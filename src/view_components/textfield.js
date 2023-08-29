'use strict'
/**
 * @fileoverview business/view_components/textfield.js
 * TextField view component class.
 * 
 * @author kaz@thinkxinc.com (Kazuki Otsuka)
 */

const textFieldOnDisableClassName = 'onDisable';

const TextFieldState = Object.freeze({ onhide: 0, onshow: 1, });
//onfocus: 3,  // TODO:
//onlock: 4,  // TODO:
const TextFieldLoadingState = Object.freeze({ none: 0, onloading: 1, done: 2, });
const TextFieldValidationState = Object.freeze({ none: 0, onalert: 1, onverified: 1, });
const TextFieldInputState = Object.freeze({ empty: 0, filled: 1, overmaximum: 2, });
const TextFieldType = Object.freeze({ singleline: 0, multiplelines: 1, });

const FooterColumn = Object.freeze({ left: 'left', middle: 'middle', right: 'right' });

class TextFieldConfig extends FormComponentBaseConfig {
    constructor({
        htmlTag = 'div',
        maxTextLength = 999,
        initRows = 6,
        verticalFlex = false,
        hasTitle = true,
        title = "",
        placeholder = "",
        counterFormat = `$count/$maxcount`,
        passwordMode = false,
        defaultValue = null,
        cookieExclude = false,
        hasCookiePrefix = false,
        isDefaultValueRestoredFromCookie = true,
        scrollControlElementId = null,
        isCounter = true,
        isEnterButton = false,
        enterButtonPlacedInFooterColumn = FooterColumn.right,
        messagePlacedInFooterColumn = FooterColumn.middle,
        counterPlacedInFooterColumn = FooterColumn.right,
        indicatorPlacedInFooterColumn = FooterColumn.left,
        ...otherOptions
    } = {}) {
        super(otherOptions);
        this.htmlTag = htmlTag;
        this.maxTextLength = maxTextLength;
        this.initRows = initRows;
        this.verticalFlex = verticalFlex;
        this.hasTitle = hasTitle;
        this.title = title;
        this.placeholder = placeholder;
        this.counterFormat = counterFormat;
        this.passwordMode = passwordMode;
        this.defaultValue = defaultValue;
        this.cookieExclude = cookieExclude;
        this.hasCookiePrefix = hasCookiePrefix;
        this.isDefaultValueRestoredFromCookie = isDefaultValueRestoredFromCookie;
        this.scrollControlElementId = scrollControlElementId;
        this.isCounter = isCounter;
        this.isEnterButton = isEnterButton;
        this.enterButtonPlacedInFooterColumn = enterButtonPlacedInFooterColumn;
        this.messagePlacedInFooterColumn = messagePlacedInFooterColumn;
        this.counterPlacedInFooterColumn = counterPlacedInFooterColumn;
        this.indicatorPlacedInFooterColumn = indicatorPlacedInFooterColumn;
    }
}

/**
 * A class for creating TextField components. 
 *
 * This class relies on a configuration object of type TextFieldConfig 
 * for more granular control over its properties.
 * 
 * HTML Structure:
 * ```
 *  <div id="{this.__id__}" class="textField">
 *      <div class="inputOuter">
 *          <h6 class="title">{this.__title__}</h6>
 *          <input class="{this.__field_name__}form" name="{this.__field_name__}" type="text" autocomplete="off">
 *          <div class="footer">
 *              <span class="indicator"></span>
 *              <span class="message"></span>
 *              <span class="counter"></span>
 *          </div>
 *      </div>
 *  </div>
 * ```
 *
 * Example usage:
 * ```javascript
 *  // Initialize the validators
 *  let requiredValidator = new Validator(titleField, ValidationErrorType.required, 'This field is required');
 *  let lengthValidator = new Validator(titleField, ValidationErrorType.length, 'The length of the text exceeds the limit', [140]);  // assuming max length of 140
 * 
 *  let validators = [requiredValidator, lengthValidator];
 *
 *  // Configuration for TextField
 *  let config = new TextFieldConfig({
 *      maxTextLength: 140,
 *      initRows: 4,
 *      verticalFlex: false,
 *      hasTitle: true,
 *      passwordMode: false
 *  });
 * 
 *  // Initialize the TextField
 *  let titleField = new TextField(
 *      'parentView',
 *      'titleField',
 *      'title',
 *      TextFieldType.multiplelines,
 *      'title(reqired)',
 *      'Mona Lisa Title and subject',
 *      validators,
 *      config
 *  );
 * ```
 *
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the TextField element.
 * @param {string} field_name - The name attribute for the TextField.
 * @param {string} type - The type of TextField (e.g., singleline, multiplelines).
 * @param {Validator[]} validators - Array of Validator objects for the TextField.
 * @param {TextFieldConfig} [config] - Configuration object for more granular customization. Defaults to a new TextFieldConfig object.
 */
class TextField extends FormComponentBase {
    constructor(parent_id, id, field_name, type, locale, lang, validators, config = new TextFieldConfig()) {
        super(parent_id, id, field_name, '', config.htmlTag, validators, config);

        // set config
        this.config = config;

        const options = [
            {name: '__type__', value: type, type: 'number'},
            {name: '__title__', value: config.title, type: 'string'},
            {name: '__lang__', value: lang, type: 'string'},
            {name: '__field_name__', value: field_name, type: 'string'},
        ];

        options.forEach(option => {
            // set the value
            this[option.name] = option.value;
        
            // Special case for 'string|null'
            if (option.type === 'string|null') {
                if (typeof this[option.name] !== 'string' && this[option.name] !== null) {
                    console.error(`${option.name.replace('__', '')} must be of type 'string' or 'null', but got ${typeof option.value}`);
                }
            } else {
                // check the type
                if (typeof this[option.name] !== option.type) {
                    console.error(`${option.name.replace('__', '')} must be of type ${option.type}, but got ${typeof option.value}`);
                }
            }
        });
 
        // set locale
        this.locale = locale;
        // initialize view elements
        this._setElements();
        // set counter 
        this.count = 0;
        // validators
        this.validators = validators;
        // password mode
        this._togglePasswordMode(this.config.passwordMode);
        // restore from cookie
        this._restoreValueFromCookie();
        // Resize textarea. Ensure the browser gets a chance to recalculate layout before resizing
        if(this.config.verticalFlex) {
            requestAnimationFrame(() => {
                this._resizeTextArea(this.$textArea);
            });
        }
    }

    /**
     * value getter / setter.
     */
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

    /**
     * text setter /getter.
     */
    set text(text) {
        this._text = text;
        this.$textArea.value = text;
        console.log(this.$textArea.value)
        // count
        if (text) {
            this.count = text.length;
        }
        // dispatch event
        const event = new CustomEvent('textupdated', {detail: {new: text,}});
        this.$textField.dispatchEvent(event);
        // save cookie
        if (this.validate() == null) {
            this._setValueToCookies(text);
        } else {
            console.warn(`Cookie is not set for key ${this.__field_name__} since the value is not valid.`)
        }
    }

    get text() {return this._text}

    /**
     * count setter / getter.
     */
    set count(count) {
        this._count = count;
        // update counter text
        if (this.isCounter) {
            this.$counter.innerHTML = this.config.counterFormat
                .replace('$count', count).replace('$maxcount', this.config.maxTextLength);
        }
    }

    get count() {return this._count}

    /**
     * state setter.
     */
    set state(state) {
        this._state = state;
        switch (state) {
            case TextFieldState.onhide:
                console.log(`TextField ${this.__id__} state changed -> onhide`);
                break
            case TextFieldState.onshow:
                console.log(`TextField ${this.__id__} state changed -> onshow`);
                break
        }
    }

    /**
     * loadingState setter.
     */
    set loadingState(state) {
        this._loadingState = state;
        switch (state) {
            case TextFieldLoadingState.none:
                console.log(`TextField ${this.__id__} loadingState changed -> none`);
                break
            case TextFieldLoadingState.onloading:
                console.log(`TextField ${this.__id__} loadingState changed -> onloading`);
                break
        }
    }

    /**
     * validationState setter.
     */
    set validationState(state) {
        this._validationState = state;
        switch (state) {
            case TextFieldValidationState.none:
                debuglog(`TextField ${this.__id__} validationState changed -> none`);
                this.$textField.classList.remove('alert');
                break
            case TextFieldValidationState.onalert:
                debuglog(`TextField ${this.__id__} validationState changed -> onalert`);
                this.$textField.classList.add('alert');
                break
            case TextFieldValidationState.onverified:
                debuglog(`TextField ${this.__id__} validationState changed -> onverified`);
                this.$textField.classList.remove('alert');
                break
        }
    }

    /**
     * inputState setter.
     */
    set inputState(state) {
        this._inputState = state;
        switch (state) {
            case TextFieldInputState.empty:
                debuglog(`TextField ${this.__id__} inputState changed -> empty`);
                this.$textField.classList.remove('overMaximumTextCount');
                break
            case TextFieldInputState.filled:
                debuglog(`TextField ${this.__id__} inputState changed -> filled`);
                this.$textField.classList.remove('overMaximumTextCount');
                break
            case TextFieldInputState.overmaximum:
                debuglog(`TextField ${this.__id__} inputState changed -> overmaximum`);
                this.$textField.classList.add('overMaximumTextCount');
                break
        }
    }

    set onDisable (onDisable) {
        if (onDisable == this._onDisable) { return }
    
        this._onDisable = onDisable;
        debuglog(`${this.__id__} disable ${onDisable}`);
        this.disableInteractions(onDisable);
    }

    get onDisable () { return this._onDisable; }

    disableInteractions(disable) {
        if (disable) {
            this.$textField.classList.add(textFieldOnDisableClassName);
            this.$textArea.setAttribute('disabled', true);
       } else {
            this.$textField.classList.remove(textFieldOnDisableClassName);
            this.$textArea.removeAttribute('disabled');
       }
    }

    /**
     * DOM nodes as variables.
     * Note: This method overrides the _setElements method in the base class.
     * @param {string} text - The text to display in the TextField. Not used in this class.
     * @param {string} htmlTag - The type of HTML element to create ('div').
     */
    _setElements(text, htmlTag) {
        super._setElements('', 'div'); // call super method to create the div element
    
        // textField
        this.$textField = this.$view;
        this.$textField ?? console.warn(`<section id=${this.__id__} class=textField></section> is necessary in HTML.`);
        this.$textField.className = 'TextField';
    
        // create new elements
        const $inputOuter = document.createElement('div');
        $inputOuter.className = 'inputOuter';
        this.$inputOuter = $inputOuter;
    
        const $title = document.createElement('h6');
        $title.className = 'title';
        $title.textContent = this.__title__;
        $inputOuter.appendChild($title);
        if (!this.config.hasTitle) $title.remove();
    
        const $inputElem = document.createElement(this.__type__ == TextFieldType.singleline ? 'input' : 'textarea');
        $inputElem.className = this.__field_name__ + 'form';
        $inputElem.name = this.__field_name__;
        if ($inputElem instanceof HTMLInputElement) {
            $inputElem.type = 'text';
        }
        $inputElem.placeholder = this.config.placeholder;
        $inputElem.autocomplete = 'off';
        if (this.__type__ !== TextFieldType.singleline) {
            $inputElem.rows = this.config.initRows;
            $inputElem.contentEditable = true;
        }
        $inputOuter.appendChild($inputElem);
        this.$textArea = $inputElem;
    
        const $footer = document.createElement('div');
        $footer.className = 'footer';
        ['indicator', 'message', 'counter'].forEach(elem => {
            const $span = document.createElement('span');
            $span.className = elem;
            $footer.appendChild($span);
            this[`$${elem}`] = $span;
        });
        $inputOuter.appendChild($footer);
        this.$footer = $footer;

        // Create the footer columns
        const $leftColumn = document.createElement('div');
        $leftColumn.className = 'left';
        const $middleColumn = document.createElement('div');
        $middleColumn.className = 'middle';
        const $rightColumn = document.createElement('div');
        $rightColumn.className = 'right';

        const columns = {
            [FooterColumn.left]: $leftColumn,
            [FooterColumn.middle]: $middleColumn,
            [FooterColumn.right]: $rightColumn
        };
        
        // Append elements to appropriate columns based on config
        if (this.$indicator) {
            columns[this.config.indicatorPlacedInFooterColumn].appendChild(this.$indicator);
        }
        if (this.$message) {
            columns[this.config.messagePlacedInFooterColumn].appendChild(this.$message);
        }
        if (this.$counter && this.config.isCounter) {
            columns[this.config.counterPlacedInFooterColumn].appendChild(this.$counter);
        }
        
        if (this.config.isEnterButton) {
            const $enterButton = document.createElement('button');
            $enterButton.id = 'EnterButton';
            $enterButton.className = 'enterButton';
            $enterButton.innerHTML = SVGIcons.enterButtonSVG;
            columns[this.config.enterButtonPlacedInFooterColumn].appendChild($enterButton);
            this.$enterButton = $enterButton;
        }
        
        // Append columns to footer
        this.$footer.append($leftColumn, $middleColumn, $rightColumn);
    
        this.$textField.appendChild($inputOuter);
    }

    /**
     * Set event handlers.
     */
    _setEventHandlers() {
        const _this = this;
        debuglog(`Set the input event handler for ${this.__id__}.`);
        this.$textArea.addEventListener('input', (e) => {
            _this.text = _this.$textArea.value;
            _this.count = _this.$textArea.value.length;

            if(this.viewController && typeof this.viewController.textFieldInputValueChanged === "function"){
                this.viewController.textFieldInputValueChanged(this, _this.$textArea.value);
            } else {
                console.error('ViewController not set or textFieldInputValueChanged not a function');
            }

            // set state as the text count 
            console.log(`max text count: ${_this.config.maxTextLength} count: ${_this.count}`);
            if (this.count > this.config.maxTextLength) {
                this._setState(TextFieldValidationState.onalert, TextFieldInputState.overmaximum);
            } else if (this.count === 0) {
                this._setState(TextFieldValidationState.none, TextFieldInputState.empty);
            } else {
                this._setState(TextFieldValidationState.none, TextFieldInputState.filled);
            }

            // Auto resize textarea
            if (_this.config.verticalFlex) {
                _this._resizeTextArea(_this.$textArea);
            }
        })

        debuglog(`Set the blur event handler for ${this.__id__}.`);
        this.$textArea.addEventListener('blur', () => {
            console.log(`[event] blur -> ${_this.$textArea.value}`)
            if (this.viewController && typeof this.viewController.textFieldOnBlur === "function") {
                this.viewController.textFieldOnBlur(this, _this.$textArea.value);
            } else {
                console.error('ViewController not set or textFieldOnBlur not a function');
            }
        });
    }

    _resizeTextArea($textArea) {
        console.error('resize');
    
        let createViewElem = document.getElementById(this.config.scrollControlElementId);
        let originalScrollTop = createViewElem.scrollTop;
        let footerTopPositionBefore = this.$footer.getBoundingClientRect().top;
        let viewportHeight = window.innerHeight;
    
        // 1. Check if the footer top is visible before resizing
        let isFooterTopVisible = footerTopPositionBefore < viewportHeight;
    
        // 2. Reset the height to default to get the actual scrollHeight
        $textArea.style.height = 'auto';
    
        // 3. Set the height based on scroll height
        $textArea.style.height = `${$textArea.scrollHeight}px`; 
        debuglog(`$textArea height in TextField is set to the scroll height: ${$textArea.scrollHeight}px`);
    
        // 4. Check if the footer bottom is hidden after resizing
        let footerBottomPositionAfter = this.$footer.getBoundingClientRect().bottom;
        let isFooterBottomHidden = footerBottomPositionAfter > viewportHeight;
    
        // 5. If footer top was visible before resizing and footer bottom is hidden after resizing, adjust scroll.
        if (isFooterTopVisible && isFooterBottomHidden) {
            console.error('XXX');
            let scrollAmountNeeded = footerBottomPositionAfter - viewportHeight;
            createViewElem.scrollTop = originalScrollTop + scrollAmountNeeded;
        }
    }

    _resizeTextArea($textArea) {
        console.error('resize');
        
        // Initialize necessary variables
        let scrollViewElem = this._getScrollViewElement();
        let originalScrollTop = scrollViewElem ? scrollViewElem.scrollTop : 0;
        
        let footerTopPositionBefore = this.$footer.getBoundingClientRect().top;
        let viewportHeight = window.innerHeight;
        
        // Determine if the top of the footer is visible before resizing
        let isFooterTopVisible = footerTopPositionBefore < viewportHeight;
    
        // Adjust the textarea height
        this._adjustTextAreaHeight($textArea);
        
        // Restore original scroll position, if scrollViewElem exists
        if (scrollViewElem) {
            scrollViewElem.scrollTop = originalScrollTop;
        }
    
        // Adjust scroll to ensure footer visibility, if necessary
        this._ensureFooterVisibility(scrollViewElem, originalScrollTop, isFooterTopVisible, viewportHeight);
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

    /**
     * Sets the validation state and input state of the TextField.
     *
     * @param {TextFieldValidationState} validationState - The validation state to be set for the TextField.
     * @param {TextFieldInputState} inputState - The input state to be set for the TextField.
     *
     * The TextFieldValidationState and TextFieldInputState are enumeration values representing different states.
     * TextFieldValidationState can be 'onalert', 'none', or other states defined in the enumeration.
     * TextFieldInputState can be 'overmaximum', 'empty', 'filled', or other states defined in the enumeration.
     */
    _setState(validationState, inputState) {
        this.validationState = validationState;
        this.inputState = inputState;
    }

    /* private functions */

    /**
     * Toggle Password mode.
     *
     * @param {boolean} passwordMode this.config.passwordMode
     */
    _togglePasswordMode(passwordMode) {
        if (this.__type__ == TextFieldType.multiplelines) {
            console.warn(`<textarea> doesn't allow password type.`);
            return;
        }
        this.$textArea.type = passwordMode ? 'password' : 'text';
    }

    /**
     * Set placeholder.
     * @param {string} placeholder - 
     */
    _setPlaceholder(placeholder) {
        this.$textArea.placeholder = placeholder;
    }

    /* public functions */

    /**
     * Add/Remove alert.
     * 
     * When an alert is triggered, the alert method will add a 'alert' class to the textField 
     * and add a paragraph tag within the footer, resulting in:
     * 
     * <div id="{this.__id__}" class="textField alert">
     *    <div class="inputOuter">
     *        <h6 class="title">{this.__title__}</h6>
     *        <input class="{this.__field_name__}form" name="{this.__field_name__}" type="text" autocomplete="off">
     *        <div class="footer cf">
     *            <span class="indicator"></span>
     *            <span class="message"></span>
     *            <span class="counter"></span>
     *            <p class="alertMessage" id="{this.__id__}__alert">{message}</p>
     *        </div>
     *    </div>
     * </div>
     * 
     * @param {bool} onAlert 
     * @param {string} message
     */
    alert(onAlert, message) {
        const alertMessageId = this.__id__ + '__alert';
   
        if (onAlert) {
            console.log(`Alert turned on for ${this.__id__} with message: ${message}`);
            this.$textField.classList.add('alert');
    
            // If the alertMessage already exists, update it or return if it's the same.
            if (this._isAlerted(alertMessageId)) {
                if (!this._isAlertMessageEqualTo(alertMessageId, message)) {
                    this._setAlertMessage(message);
                    console.log(`Updated alert message for ${this.__id__} to: ${message}`);
                } else {
                    console.log(`Alert message for ${this.__id__} is already set to: ${message}`);
                }
                return;
            }
    
            // Create new alert message if it does not exist.
            this._appendAlertMessage(alertMessageId, message);
            debuglog(`Created new alert message for ${this.__id__} with message: ${message}`);

        } else if (this._isAlerted(alertMessageId)) { // Only run if $alertMessage exists
            console.log(`Alert turned off for ${this.__id__}`);
            // Remove alert message
            this._removeAlertMessage(alertMessageId);

        } else {
            //DEBUG: console.log(`Alert method called for ${this.__id__} to remove the message but not found.`);
        }
    }

    /**
     * Checks if an alert message with a given ID is present in the text field's footer.
     *
     * @param {string} alertMessageId - The ID of the alert message to check for.
     * @returns {boolean} - True if the alert message is present; otherwise, false.
     */
    _isAlerted(alertMessageId) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        return $alertMessage ? true : false;
    }
  
    /**
     * Checks if an alert message with a given ID has content equal to the specified message.
     *
     * @param {string} alertMessageId - The ID of the alert message to check.
     * @param {string} message - The message to compare to the alert message's content.
     * @returns {boolean} - True if the content is equal; otherwise, false.
     */
    _isAlertMessageEqualTo(alertMessageId, message) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        return $alertMessage && $alertMessage.innerText === message;
    }
  
    /**
     * Sets the content of an alert message with a given ID.
     *
     * @param {string} alertMessageId - The ID of the alert message to update.
     * @param {string} message - The new message content.
     */
    _setAlertMessage(alertMessageId, message) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        if ($alertMessage) {
            $alertMessage.innerText = message;
        }
    }
  
    /**
     * Appends an alert message with a specified ID and content to the text field's footer.
     * If an alert message with the given ID already exists, its content is updated.
     *
     * @param {string} alertMessageId - The ID to assign to the alert message.
     * @param {string} message - The content/message to set for the alert.
     */
    _appendAlertMessage(alertMessageId, message) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        const $footer = this.$footer;
  
        if (!$alertMessage) {
            const newAlertMessage = document.createElement('p');
            newAlertMessage.classList.add('alertMessage');
            newAlertMessage.id = alertMessageId;
            newAlertMessage.innerText = message;
            const targetColumn = this.config.messagePlacedInFooterColumn;
            $footer.querySelector(`.${targetColumn}`).appendChild(newAlertMessage);
        } else {
            $alertMessage.innerText = message;
        }
    }
  
    /**
     * Removes an alert message with a given ID from the text field's footer.
     *
     * @param {string} alertMessageId - The ID of the alert message to be removed.
     */
    _removeAlertMessage(alertMessageId) {
        const $alertMessage = this._getAlertMessage(alertMessageId);
        if ($alertMessage) {
            this.$textField.classList.remove('alert');
            $alertMessage.remove();
        }
    }
  
    /**
     * Helper function to get a reference to an alert message by its ID.
     *
     * @param {string} alertMessageId - The ID of the alert message to find.
     * @returns {HTMLElement|null} - The found alert message element, or null if not found.
     * @private
     */
    _getAlertMessage(alertMessageId) {
        return this.$footer.querySelector(`#` + alertMessageId);
    }
}

class TextFieldProtocol {
    /**
     * To be overridden in the ViewController. 
     * Called when the input value of a TextField changes.
     * 
     * @param {TextField} textField - The TextField that triggered the event.
     * @param {string} value - The current input value of the TextField.
     * @throws {Error} If the method is not overridden in the ViewController.
     */
    textFieldInputValueChanged(textField, value) {
        throw new Error(`ViewController of TextField ${textField.__id__} must implement textFieldInputValueChanged method!`);
    }

    /**
     * To be overridden in the ViewController. 
     * Called when the TextField loses focus.
     * 
     * @param {TextField} textField - The TextField that triggered the event.
     * @param {string} value - The current input value of the TextField.
     * @throws {Error} If the method is not overridden in the ViewController.
     */
    textFieldOnBlur(textField, value) {
        throw new Error(`ViewController of TextField ${textField.__id__} must implement textFieldOnBlur method!`);
    }
}