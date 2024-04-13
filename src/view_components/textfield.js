'use strict'
/**
 * @fileoverview business/view_components/textfield.js
 * TextField view component class.
 * 
 * @author kaz@thinkxinc.com (Kazuki Otsuka)
 */
class TextFieldConfig extends ViewComponentConfig {
    constructor({
        defaultValue = null,
        type = TextFieldType.singleline,
        validators = [],
        maxTextLength = 999,
        initRows = 6,
        verticalFlex = false,
        hasTitle = true,
        title = "",
        placeholder = "",
        counterFormat = `$count/$maxcount`,
        passwordMode = false,
        onDisableClassName = 'disable',
        onFocusClassName = 'focus',
        onMouseDownClassName = 'clicked',
        shouldTrackLocalChangeInCookie = true,
        cookieExclude = false,
        hasCookiePrefix = false,
        isDefaultValueRestoredFromCookie = true,
        scrollControlElementId = null,
        isCounter = true,
        isDoneButton = false,
        isCancelButton = false,
        isTitlePlacedAtInputLeft = false,
        shouldEnterKeySubmitDoneButton = false,
        eventNameDoneButtonClick = 'doneButtonClick',
        eventNameCancelButtonClick = 'cancelButtonClick',
        doneButtonPlace = TextFieldPlaceTo.inputAfter,
        messagePlace = TextFieldPlaceTo.footerMiddle,
        counterPlace = TextFieldPlaceTo.footerRight,
        indicatorPlace = TextFieldPlaceTo.footerLeft,
        ...otherOptions
    } = {}) {
        super(otherOptions);

        // Explicit property assignments
        this.defaultValue = defaultValue;
        this.type = type;
        this.validators = validators;
        this.maxTextLength = maxTextLength;
        this.initRows = initRows;
        this.verticalFlex = verticalFlex;
        this.hasTitle = hasTitle;
        this.title = title;
        this.placeholder = placeholder;
        this.counterFormat = counterFormat;
        this.passwordMode = passwordMode;
        this.onDisableClassName = onDisableClassName;
        this.onFocusClassName = onFocusClassName;
        this.onMouseDownClassName = onMouseDownClassName;
        this.shouldTrackLocalChangeInCookie = shouldTrackLocalChangeInCookie;
        this.cookieExclude = cookieExclude;
        this.hasCookiePrefix = hasCookiePrefix;
        this.isDefaultValueRestoredFromCookie = isDefaultValueRestoredFromCookie;
        this.scrollControlElementId = scrollControlElementId;
        this.isCounter = isCounter;
        this.isDoneButton = isDoneButton;
        this.isCancelButton = isCancelButton;
        this.isTitlePlacedAtInputLeft = isTitlePlacedAtInputLeft;
        this.shouldEnterKeySubmitDoneButton = shouldEnterKeySubmitDoneButton;
        this.eventNameDoneButtonClick = eventNameDoneButtonClick;
        this.eventNameCancelButtonClick = eventNameCancelButtonClick;
        this.doneButtonPlace = doneButtonPlace;
        this.messagePlace = messagePlace;
        this.counterPlace = counterPlace;
        this.indicatorPlace = indicatorPlace;
    }
}

const TextFieldState = Object.freeze({ empty: 0, filled: 1, overmaximum: 2, });
const TextFieldType = Object.freeze({ singleline: 0, multiplelines: 1, });

const TextFieldPlaceTo = Object.freeze({ 
    inputOuter: '.inputOuter', 
    inputAfter: '.inputOuter .inputAfter', 
    footerLeft: '.footer .left', 
    footerMiddle: '.inputOuter .footer .middle', 
    footerRight: '.inputOuter .footer .right' 
});

/**
 *  <div id="{this.id}" class="textField">
 *      <div class="inputOuter">
 *          <h6 class="title">{this.__title__}</h6>
 *          <div class="inputWrapper">
 *             <input class="{this.fieldName}form" name="{this.fieldName}" type="text" autocomplete="off">
 *             <div class="inputAfter"></div>
 *          </div>
 *          <div class="footer">
 *              <span class="indicator"></span>
 *              <span class="message"></span>
 *              <span class="counter"></span>
 *          </div>
 *      </div>
 *  </div>
  */
class TextField {
    constructor(id, fieldName, config = new TextFieldConfig()) {
        this.id = id;
        this.config = config;

        const options = [
            {name: 'fieldName', value: fieldName, type: 'string'},
        ];

        options.forEach(option => {
            // set the value
            this[option.name] = option.value;
        
            // Special case for 'string|null'
            if (typeof this[option.name] !== option.type) {
                console.error(`${option.name} must be of type ${option.type}, but got ${typeof option.value}`);
            }
        });
 
        this.createElements();
        this.setEventHandlers();

        this.count = 0;
        this.validators = this.config.validators;

        this._togglePasswordMode(this.config.passwordMode);

        this._restoreValueFromCookie();

        if(this.config.verticalFlex) {
            this._resizeTextArea();
        }
    }

    get value() {
        return this._text;
    }

    set value(value) {
        if (typeof value === 'string' || value == null) {
            debuglog(`Set value "${value}" to the textField.text.`)
            this.text = value;
        } else {
            console.error(`TextField value must be a string or null, but got ${typeof value} : ${value}`);
        }
    }

    set text(text) {
        this._text = text;
        this.$textArea.value = text;
        if(this.config.verticalFlex) {
            this._resizeTextArea();
        }
        console.log(this.$textArea.value)

        if (text) {
            this.count = text.length;
        }

        if (!this.onReset) {
            // dispatch event
            const event = new CustomEvent('textupdated', {detail: {new: text,}});
            this.$textField.dispatchEvent(event);
            // save cookie
            if (this.validate() == null) {
                if (this.config.shouldTrackLocalChangeInCookie) {
                    this._setValueToCookies(text);
                } else {
                    if (this.savedValue != null && text != this.savedValue) {
                        debuglog(`value:${text} != savedValue:${this.savedValue} -> edited`)
                        this.$textField.classList.add('edited');
                    } else {
                        debuglog(`value:${text} == savedValue:${this.savedValue} -> remove edited`)
                        this.$textField.classList.remove('edited');
                    }
                }
            } else {
                console.warn(`Cookie is not set for key ${this.fieldName} since the value is not valid.`)
            }
        }
    }

    get text() {return this._text}

    reset() {
        this.onReset = true;
        this.text = '';
        this.onReset = false;
    }

    set count(count) {
        this._count = count;
        // update counter text
        if (this.config.isCounter) {
            this.$counter.innerHTML = this.config.counterFormat
                .replace('$count', count).replace('$maxcount', this.config.maxTextLength);
        }
    }

    get count() {return this._count}

    set textFieldState(state) {
        this._textFieldState = this.textFieldState;
        switch (this.textFieldState) {
            case TextFieldState.empty:
                debuglog(`TextField ${this.id} state changed -> empty`);
                this.$textField.classList.remove('overMaximumTextCount');
                break
            case TextFieldState.filled:
                debuglog(`TextField ${this.id} state changed -> filled`);
                this.$textField.classList.remove('overMaximumTextCount');
                break
            case TextFieldState.overmaximum:
                debuglog(`TextField ${this.id} state changed -> overmaximum`);
                this.$textField.classList.add('overMaximumTextCount');
                break
        }
    }

    set onDisable (onDisable) {
        if (onDisable == this._onDisable) { return }
    
        this._onDisable = onDisable;
        debuglog(`${this.id} disable ${onDisable}`);
        this.disableInteractions(onDisable);
    }

    get onDisable () { return this._onDisable; }


    // Create elements

    createElements() {
        this.$view = document.createElement('div');
        this.$view.id = this.id;
        this.$view.classList.add(`${this.id}`);
        this.$view.classList.add(`${this.constructor.name}`);
 
        // textField
        this.$textField = this.$view;
        this.$textField ?? console.warn(`<section id=${this.id} class=textField></section> is necessary in HTML.`);
        this.$textField.className = 'TextField';
        this.$textField.classList.add(this.id);
    
        // create new elements
        const $inputOuter = document.createElement('div');
        $inputOuter.className = 'inputOuter';
        this.$inputOuter = $inputOuter;

        const $inputWrapper = document.createElement('div');
        $inputWrapper.className = 'inputWrapper';
        this.$inputWrapper = $inputWrapper;
    
        const $title = document.createElement('h6');
        $title.className = 'title';
        $title.textContent = this.config.title;
        if (this.config.isTitlePlacedAtInputLeft) {
            $inputWrapper.appendChild($title);
        } else {
            $inputOuter.appendChild($title);
        }
        if (!this.config.hasTitle) $title.remove();

        $inputOuter.appendChild($inputWrapper);
    
        const $inputElem = document.createElement(this.config.type == TextFieldType.singleline ? 'input' : 'textarea');
        $inputElem.className = this.fieldName + 'form';
        $inputElem.name = this.fieldName;
        if ($inputElem instanceof HTMLInputElement) {
            $inputElem.type = 'text';
        }
        $inputElem.placeholder = this.config.placeholder;
        $inputElem.autocomplete = 'off';
        if (this.config.type !== TextFieldType.singleline) {
            $inputElem.rows = this.config.initRows;
            $inputElem.contentEditable = true;
        }
        $inputWrapper.appendChild($inputElem);
        this.$textArea = $inputElem;

        // tail box
        const $inputAfter = document.createElement('div');
        $inputAfter.className = 'inputAfter';
        $inputWrapper.appendChild($inputAfter);
        this.$inputAfter = $inputAfter;

        // footer
        const $footer = document.createElement('div');
        $footer.className = 'footer';
        $inputOuter.appendChild($footer);
        this.$footer = $footer;

        // Create the footer columns
        const $leftColumn = document.createElement('div');
        $leftColumn.className = 'left';
        const $middleColumn = document.createElement('div');
        $middleColumn.className = 'middle';
        const $rightColumn = document.createElement('div');
        $rightColumn.className = 'right';

        const places = {
            [TextFieldPlaceTo.inputOuter]: $inputOuter,
            [TextFieldPlaceTo.inputAfter]: $inputAfter,
            [TextFieldPlaceTo.footerLeft]: $leftColumn,
            [TextFieldPlaceTo.footerMiddle]: $middleColumn,
            [TextFieldPlaceTo.footerRight]: $rightColumn
        };
        
        // Append elements to appropriate columns based on config
        ['indicator', 'message', 'counter'].forEach(elem => {
            const $elem = document.createElement('span');
            $elem.className = elem;
            this[`$${elem}`] = $elem;
        });

        ['doneButton', 'cancelButton'].forEach(elem => {
            const $elem = document.createElement('button');
            $elem.className = elem;
            this[`$${elem}`] = $elem;
        })


        if (this.$indicator) {
            
            console.warn(this.config)
            console.warn(this.config.indicatorPlace)
            console.warn(places[this.config.indicatorPlace])
            console.warn(places)
            places[this.config.indicatorPlace].appendChild(this.$indicator);
        }
        if (this.$message) {
            places[this.config.messagePlace].appendChild(this.$message);
        }
        if (this.$counter && this.config.isCounter) {
            places[this.config.counterPlace].appendChild(this.$counter);
        }
        if (this.$doneButton && this.config.isDoneButton) {
            places[this.config.doneButtonPlace].appendChild(this.$doneButton);
        }
        if (this.$cancelButton && this.config.isCancelButton) {
            places[this.config.cancelButtonPlace].appendChild(this.$cancelButton);
        }
      
        // Append columns to footer
        this.$footer.append($leftColumn, $middleColumn, $rightColumn);
        this.$textField.appendChild($inputOuter);
    }

    // Events

    setEventHandlers() {
        const _this = this;
        debuglog(`Set input event handler for ${this.id}.`);

        this.$textArea.addEventListener('input', (e) => {
            _this.text = _this.$textArea.value;
            _this.count = _this.$textArea.value.length;

            // set state as the text count 
            console.log(`max text count: ${_this.config.maxTextLength} count: ${_this.count}`);
            if (this.count > this.config.maxTextLength) {
                this.textFieldState = TextFieldState.overmaximum;
                this.$textField.classList.add('alert');
            } else if (this.count === 0) {
                this.textFieldState = TextFieldState.empty;
                this.$textField.classList.remove('alert');
            } else {
                this.textFieldState = TextFieldState.filled;
                this.$textField.classList.remove('alert');
            }
            // Auto resize textarea
            if (_this.config.verticalFlex) {
                _this._resizeTextArea();
            }
        })

        // DoneButton is submit when EnterKey is pressed
        if (this.config.shouldEnterKeySubmitDoneButton) {
            this.$textArea.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {  // 13 is the keycode for Enter
                    _this._handleEnterKeyPress(event);
                }
            });
        }

        // Add doneButton click handler
        debuglog(`Set button event handler for ${this.id}.`);
        if (this.config.isDoneButton) {
            this.$doneButton.addEventListener('click', () => {
                _this.$textField.dispatchEvent(new CustomEvent(_this.config.eventNameDoneButtonClick, {
                    detail: { id: this.id, value: this.value }
                }));
            });

            // Add 'clicked' class on mousedown
            this.$doneButton.addEventListener('mousedown', () => {
                _this.$doneButton.classList.add(_this.config.onMouseDownClassName);
            });

            // Remove 'clicked' class on mouseup
            this.$doneButton.addEventListener('mouseup', () => {
                _this.$doneButton.classList.remove(_this.config.onMouseDownClassName);
            });
        }

        // Add cancelButton click handler
        if (this.config.isCancelButton) {
            this.$cancelButton.addEventListener('click', () => {
                _this.$textField.dispatchEvent(new CustomEvent(_this.config.eventNameCancelButtonClick, {
                    detail: { id: this.id,  value: this.value }
                }));
            });

            // Add 'clicked' class on mousedown
            this.$cancelButton.addEventListener('mousedown', () => {
                _this.$cancelButton.classList.add(_this.config.onMouseDownClassName);
            });

            // Remove 'clicked' class on mouseup
            this.$cancelButton.addEventListener('mouseup', () => {
                _this.$cancelButton.classList.remove(_this.config.onMouseDownClassNam);
            });
        }

        debuglog(`Set the blur event handler for ${this.id}.`);
        this.$textArea.addEventListener('blur', () => {
            console.log(`[event] blur -> ${_this.$textArea.value}`)
            if (_this.config.onFocusClassName) {
                _this.$view.classList.remove(_this.config.onFocusClassName);
            }
        });

        debuglog(`Set the focus event handler for ${this.id}.`);
        this.$textArea.addEventListener('focus', () => {
            if (_this.config.onFocusClassName) {
                _this.$view.classList.add(_this.config.onFocusClassName);
            }
        });
    }

    // Settings

    _togglePasswordMode(passwordMode) {
        if (this.config.type == TextFieldType.multiplelines) {
            if (passwordMode) {
                console.warn(`<textarea> doesn't allow password type.`);
            }
            return;
        }
        this.$textArea.type = passwordMode ? 'password' : 'text';
    }

    _setPlaceholder(placeholder) {
        this.$textArea.placeholder = placeholder;
    }

    disableInteractions(disable) {
        if (disable) {
            this.$textField.classList.add(this.config.onDisableClassName);
            this.$textArea.setAttribute('disabled', true);
       } else {
            this.$textField.classList.remove(this.config.onDisableClassName);
            this.$textArea.removeAttribute('disabled');
       }
    }

    // UI Interfactions

    _handleEnterKeyPress(event) {
        debuglog(`${this.id} Press Enter`);
        event.preventDefault(); // Prevent the default action (e.g., new line in a textarea)
        this.$doneButton.click(); // Programmatically click the done button
    }

    _resizeTextArea() {
        requestAnimationFrame(() => {
            console.warn('resize');
        
            // Initialize necessary variables
            let scrollViewElem = this._getScrollViewElement();
            let originalScrollTop = scrollViewElem ? scrollViewElem.scrollTop : 0;
        
            let footerTopPositionBefore = this.$footer.getBoundingClientRect().top;
            let viewportHeight = window.innerHeight;
        
            // Determine if the top of the footer is visible before resizing
            let isFooterTopVisible = footerTopPositionBefore < viewportHeight;
    
            // Adjust the textarea height
            this._adjustTextAreaHeight(this.$textArea);
        
            // Restore original scroll position, if scrollViewElem exists
            if (scrollViewElem) {
                scrollViewElem.scrollTop = originalScrollTop;
            }
    
            // Adjust scroll to ensure footer visibility, if necessary
            this._ensureFooterVisibility(scrollViewElem, originalScrollTop, isFooterTopVisible, viewportHeight);
        });
    }
    
    _getScrollViewElement() {
        return this.config.scrollControlElementId
            ? document.getElementById(this.config.scrollControlElementId) 
            : null;
    }
    
    _adjustTextAreaHeight($textArea) {
        // Reset height to auto for accurate scrollHeight measurement
        $textArea.style.height = 'auto';
        
        // Update height based on content's scrollHeight
        $textArea.style.height = `${$textArea.scrollHeight}px`; 
        debuglog(`$textArea height in TextField is set to the scroll height: ${$textArea.scrollHeight}px`);
    }
    
    _ensureFooterVisibility(scrollViewElem, originalScrollTop, isFooterTopVisible, viewportHeight) {
        if (this.config.scrollControlElementId && scrollViewElem) {
            requestAnimationFrame(() => {
                let footerBottomPositionAfter = this.$footer.getBoundingClientRect().bottom;
                let isFooterBottomHidden = footerBottomPositionAfter > viewportHeight;
                
                if (isFooterTopVisible && isFooterBottomHidden) {
                    console.error('XXX');
                    let scrollAmountNeeded = footerBottomPositionAfter - viewportHeight;
                    scrollViewElem.scrollTop = originalScrollTop + scrollAmountNeeded;
                }
            });
        }
    }

    // Validation & Alert

    validate() {
        let errorMessage = null;
        for (let validator of this.validators) {
            debuglog(`Running validator: ${validator.errorType}`);
            errorMessage = validator.validate(this.value);
            if (errorMessage !== null) {
                console.log(`Validation error found for ${this.id}: ${errorMessage}`);
                this.alert(true, errorMessage);
                break;
            }
        }
        if (errorMessage === null) {
            debuglog(`No validation errors found in ${this.id}`);
            this.alert(false);
        } else {
            debuglog(`Validation failed for ${this.id} with result: ${errorMessage ? "Error: " + errorMessage : "No errors"}`);
        }
        return errorMessage;
    }

    alert(onAlert, message) {
        const alertMessageId = this.id + '__alert';
   
        debuglog(`alert called. onAlert:${onAlert} message:${message}`)
        if (onAlert) {
            console.log(`Alert turned on for ${this.id} with message: ${message}`);
            this.$textField.classList.add('alert');
    
            // If the alertMessage already exists, update it or return if it's the same.
            if (this._isAlerted(alertMessageId)) {
                if (!this._isAlertMessageEqualTo(alertMessageId, message)) {
                    this._setAlertMessage(message);
                    console.log(`Updated alert message for ${this.id} to: ${message}`);
                } else {
                    console.log(`Alert message for ${this.id} is already set to: ${message}`);
                }
                return;
            }
    
            // Create new alert message if it does not exist.
            this._appendAlertMessage(alertMessageId, message);
            debuglog(`Created new alert message for ${this.id} with message: ${message}`);

        } else if (this._isAlerted(alertMessageId)) { // Only run if $alertMessage exists
            console.log(`Alert turned off for ${this.id}`);
            // Remove alert message
            this._removeAlertMessage(alertMessageId);

        } else {
            //DEBUG: 
            debuglog(`[WARNING] Alert method called for ${this.id} to remove the message but not found.`);
        }
    }

    _isAlerted(alertMessageId) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        return $alertMessage ? true : false;
    }
  
    _isAlertMessageEqualTo(alertMessageId, message) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        return $alertMessage && $alertMessage.innerText === message;
    }
  
    _setAlertMessage(alertMessageId, message) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        if ($alertMessage) {
            $alertMessage.innerText = message;
        }
    }
  
    _appendAlertMessage(alertMessageId, message) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        const $footer = this.$footer;
  
        if (!$alertMessage) {
            const newAlertMessage = document.createElement('p');
            newAlertMessage.classList.add('alertMessage');
            newAlertMessage.id = alertMessageId;
            newAlertMessage.innerText = message;
            $footer.querySelector(this.config.messagePlace).appendChild(newAlertMessage);
        } else {
            $alertMessage.innerText = message;
        }
    }
  
    _removeAlertMessage(alertMessageId) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        if ($alertMessage) {
            this.$textField.classList.remove('alert');
            $alertMessage.remove();
        }
    }
  
    _getAlertMessage(alertMessageId) {
        return this.$footer.querySelector(`#` + alertMessageId);
    }

    // Cookie

    _setValueToCookies(value) {
        if (value !== null) {
            if (!this.config.cookieExclude) {
                Cookies.set(this.__cookie_name__, value, { expires: 3, secure: true, sameSite: 'strict' });
                console.log(`Save cookie => key: ${this.__cookie_name__} value: ${value}`);
            } else {
                console.error(`The value of ${this.id} is excluded from being stored in cookies.`);
            }
        }
    }

    _getValueFromCookies() {
        const value = Cookies.get(this.__cookie_name__);
        if (value !== undefined) {
            return value;
        }
        return null;
    }

    _removeValueInCookies() {
        Cookies.remove(this.__cookie_name__);
        console.log(`${this.__cookie_name__} removed from cookie.`);
    }

    _restoreValueFromCookie(ignoreNull = true) {
        debuglog("Cookie Name:", this.__cookie_name__);
        debuglog("Value from Cookie:", this._getValueFromCookies());
 
        const cookieValue = this._getValueFromCookies();

        if (ignoreNull && cookieValue === null) {
            debuglog(`Cookie value is null and ignoreNull is set to true. Current value not overwritten.`);
            return;
        }

        console.log(`Restoring value from cookie [${this.__cookie_name__}]: ${cookieValue}`);
        this.savedValue = cookieValue;
        this.value = cookieValue;
        debuglog("Value after restoring from cookie:", this.value);
    }

    // Others
    addToPage(page) {
        // WILL DEPRECATE
        // NOTE: この時点でpageのdom elementはまだHTML上にないことに注意
        // すべてのview componentをpageにアタッチした後でなければpageはHTML上に作られない
        // 詳しくはInputPageViewControllerのsetElements()のフローを参照
        if (!page.$view.id) {
            console.error(`[ERROR] ${page.$view} has no id`);
        }
        this.addTo(page.$view);
        this.setPageIndex(page.pageIndex);
        this.$view.classList.add(`${page.id}__${this.constructor.name}`);
    }

    addTo($parent) {
        // WILL DEPRECATE
        if (!$parent || $parent == undefined || !($parent instanceof HTMLElement)) {
            console.error(
                `[ERROR] $parent must exist but ${$parent} `);
        } else {
            debuglog(`[${$parent.className}] appendChild ${this.id}`)
            $parent.appendChild(this.$view);
        }
    }

    setViewController(viewController) {
        // WILL DEPRECATE
        this.viewController = viewController;
        //this._setEventHandlers(); <- this causes double event registration [WILL REMOVE THIS LINE]
    }

    setPageIndex(pageIndex) {
        // WILL DEPRECATE
        this.pageIndex = pageIndex;
    }

    scrollTo(delay = 0) {
        setTimeout(() => {
            this.$view.scrollIntoView({
                behavior: 'smooth', // Enable smooth scrolling
                block: 'start', // Scroll to the start (top) of this.$view
                inline: 'nearest' // In case of horizontal scrolling, scroll in the nearest viewport
            });
        }, delay);
    }
}