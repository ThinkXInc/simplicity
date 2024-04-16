'use strict'
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
    constructor({
        id, // no default (must be provided)
        fieldName, // no default (must be provided)
        type = TextFieldType.singleline,
        defaultValue = null,
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
        indicatorPlace = TextFieldPlaceTo.footerLeft
    }) {
        this.id = id;
        this.fieldName = fieldName;
        this.type = type;
        this.defaultValue = defaultValue;
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

        this._createElements();
        this._setEventHandlers();

        this.count = 0;
        this.validators = this.validators;
        this.alertMessageId = this.id + '__alert';

        this._togglePasswordMode(this.passwordMode);

        this._restoreValueFromCookie();

        if(this.verticalFlex) {
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
        if(this.verticalFlex) {
            this._resizeTextArea();
        }
        console.log(this.$textArea.value)

        if (text) {
            this.count = text.length;
        }

        if (!this.onReset) {
            // dispatch event
            const event = new CustomEvent('textchanged', {detail: {newValue: text,}});
            this.$textField.dispatchEvent(event);
            // save cookie
            if (this.validate() == null) {
                if (this.shouldTrackLocalChangeInCookie) {
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
        if (this.isCounter) {
            this.$counter.innerHTML = this.counterFormat
                .replace('$count', count).replace('$maxcount', this.maxTextLength);
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

    _createElements() {
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
        $title.textContent = this.title;
        if (this.isTitlePlacedAtInputLeft) {
            $inputWrapper.appendChild($title);
        } else {
            $inputOuter.appendChild($title);
        }
        if (!this.hasTitle) $title.remove();

        $inputOuter.appendChild($inputWrapper);
    
        const $inputElem = document.createElement(this.type == TextFieldType.singleline ? 'input' : 'textarea');
        $inputElem.className = this.fieldName + 'form';
        $inputElem.name = this.fieldName;
        if ($inputElem instanceof HTMLInputElement) {
            $inputElem.type = 'text';
        }
        $inputElem.placeholder = this.placeholder;
        $inputElem.autocomplete = 'off';
        if (this.type !== TextFieldType.singleline) {
            $inputElem.rows = this.initRows;
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
            
            places[this.indicatorPlace].appendChild(this.$indicator);
        }
        if (this.$message) {
            places[this.messagePlace].appendChild(this.$message);
        }
        if (this.$counter && this.isCounter) {
            places[this.counterPlace].appendChild(this.$counter);
        }
        if (this.$doneButton && this.isDoneButton) {
            places[this.doneButtonPlace].appendChild(this.$doneButton);
        }
        if (this.$cancelButton && this.isCancelButton) {
            places[this.cancelButtonPlace].appendChild(this.$cancelButton);
        }
      
        // Append columns to footer
        this.$footer.append($leftColumn, $middleColumn, $rightColumn);
        this.$textField.appendChild($inputOuter);
    }

    // Events

    _setEventHandlers() {
        const _this = this;
        debuglog(`Set input event handler for ${this.id}.`);

        this.$textArea.addEventListener('input', (e) => {
            _this.text = _this.$textArea.value;
            _this.count = _this.$textArea.value.length;

            // set state as the text count 
            console.log(`max text count: ${_this.maxTextLength} count: ${_this.count}`);
            if (this.count > this.maxTextLength) {
                this.textFieldState = TextFieldState.overmaximum;
            } else if (this.count === 0) {
                this.textFieldState = TextFieldState.empty;
            } else {
                this.textFieldState = TextFieldState.filled;
            }
            // Auto resize textarea
            if (_this.verticalFlex) {
                _this._resizeTextArea();
            }
        })

        // DoneButton is submit when EnterKey is pressed
        if (this.shouldEnterKeySubmitDoneButton) {
            this.$textArea.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {  // 13 is the keycode for Enter
                    _this._handleEnterKeyPress(event);
                }
            });
        }

        // Add doneButton click handler
        debuglog(`Set button event handler for ${this.id}.`);
        if (this.isDoneButton) {
            this.$doneButton.addEventListener('click', () => {
                _this.$textField.dispatchEvent(new CustomEvent(_this.eventNameDoneButtonClick, {
                    detail: { id: this.id, value: this.value }
                }));
            });

            // Add 'clicked' class on mousedown
            this.$doneButton.addEventListener('mousedown', () => {
                _this.$doneButton.classList.add(_this.onMouseDownClassName);
            });

            // Remove 'clicked' class on mouseup
            this.$doneButton.addEventListener('mouseup', () => {
                _this.$doneButton.classList.remove(_this.onMouseDownClassName);
            });
        }

        // Add cancelButton click handler
        if (this.isCancelButton) {
            this.$cancelButton.addEventListener('click', () => {
                _this.$textField.dispatchEvent(new CustomEvent(_this.eventNameCancelButtonClick, {
                    detail: { id: this.id,  value: this.value }
                }));
            });

            // Add 'clicked' class on mousedown
            this.$cancelButton.addEventListener('mousedown', () => {
                _this.$cancelButton.classList.add(_this.onMouseDownClassName);
            });

            // Remove 'clicked' class on mouseup
            this.$cancelButton.addEventListener('mouseup', () => {
                _this.$cancelButton.classList.remove(_this.onMouseDownClassNam);
            });
        }

        debuglog(`Set the blur event handler for ${this.id}.`);
        this.$textArea.addEventListener('blur', () => {
            console.log(`[event] blur -> ${_this.$textArea.value}`)
            if (_this.onFocusClassName) {
                _this.$view.classList.remove(_this.onFocusClassName);
            }
        });

        debuglog(`Set the focus event handler for ${this.id}.`);
        this.$textArea.addEventListener('focus', () => {
            if (_this.onFocusClassName) {
                _this.$view.classList.add(_this.onFocusClassName);
            }
        });
    }

    // Settings

    _togglePasswordMode(passwordMode) {
        if (this.type == TextFieldType.multiplelines) {
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
            this.$textField.classList.add(this.onDisableClassName);
            this.$textArea.setAttribute('disabled', true);
       } else {
            this.$textField.classList.remove(this.onDisableClassName);
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
        return this.scrollControlElementId
            ? document.getElementById(this.scrollControlElementId) 
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
        if (this.scrollControlElementId && scrollViewElem) {
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
                this.alert(errorMessage);
                break;
            }
        }
        if (errorMessage === null) {
            debuglog(`No validation errors found in ${this.id}`);
            this.disableAlert();
        } else {
            debuglog(`Validation failed for ${this.id} with result: ${errorMessage ? "Error: " + errorMessage : "No errors"}`);
        }
        return errorMessage;
    }

    alert(message) {
        debuglog(`alert called. message:${message}`)
        console.log(`Alert turned on for ${this.id} with message: ${message}`);
        console.log(this.$textField)
        console.log(this.$textField.classList)
        this.$textField.classList.add('alert');
        this.$view.classList.add('Ebm')
        this.$view.classList.add('alert')
    
        // If the alertMessage already exists, update it or return if it's the same.
        if (this._isAlerted()) {
            if (!this._isAlertMessageEqualTo(message)) {
                this._setAlertMessage(message);
                console.log(`Updated alert message for ${this.id} to: ${message}`);
            } else {
                console.log(`Alert message for ${this.id} is already set to: ${message}`);
            }
            this.$textField.classList.add('alert');
        this.$view.classList.add('alert')
            return;
        }
    
        // Create new alert message if it does not exist.
        this._appendAlertMessage(message);
        debuglog(`Created new alert message for ${this.id} with message: ${message}`);
        console.log(this.$textField.classList)
    }

    disableAlert() {
        if (this._isAlerted()) { // Only run if $alertMessage exists
            console.log(`Alert turned off for ${this.id}`);
            // Remove alert message
            this._removeAlertMessage();
        } else {
            //DEBUG: 
            debuglog(`[WARNING] Alert method called for ${this.id} to remove the message but not found.`);
        }
    }

    _isAlerted() {
        const $alertMessage = this._getAlertMessageElement();
        return $alertMessage ? true : false;
    }
  
    _isAlertMessageEqualTo(message) {
        const $alertMessage = this._getAlertMessageElement();
        return $alertMessage && $alertMessage.innerText === message;
    }
  
    _setAlertMessage(message) {
        const $alertMessage = this._getAlertMessageElement();
        if ($alertMessage) {
            $alertMessage.innerText = message;
        }
    }
  
    _appendAlertMessage(message) {
        const $alertMessage = this._getAlertMessageElement();
        const $footer = this.$footer;
  
        if (!$alertMessage) {
            const newAlertMessage = document.createElement('p');
            newAlertMessage.classList.add('alertMessage');
            newAlertMessage.id = this.alertMessageId;
            newAlertMessage.innerText = message;
            $footer.querySelector(this.messagePlace).appendChild(newAlertMessage);
        } else {
            $alertMessage.innerText = message;
        }
    }
  
    _removeAlertMessage() {
        console.log(`remove alert from ${this.id}`)
        const $alertMessage = this._getAlertMessageElement();
        if ($alertMessage) {
            this.$textField.classList.remove('alert');
            $alertMessage.remove();
        }
    }
  
    _getAlertMessageElement() {
        return this.$footer.querySelector(`#` + this.alertMessageId);
    }

    // Cookie

    _setValueToCookies(value) {
        if (value !== null) {
            if (!this.cookieExclude) {
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