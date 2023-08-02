'use strict'
/**
 * @fileoverview business/view_components/textfield.js
 * TextField view component class.
 * 
 * @author kaz@thinkxinc.com (Kazuki Otsuka)
 */


const TextFieldState = Object.freeze({ onhide: 0, onshow: 1, });
//onfocus: 3,  // TODO:
//onlock: 4,  // TODO:
const TextFieldLoadingState = Object.freeze({ none: 0, onloading: 1, done: 2, });
const TextFieldValidationState = Object.freeze({ none: 0, onalert: 1, onverified: 1, });
const TextFieldInputState = Object.freeze({ empty: 0, filled: 1, overmaximum: 2, });
const TextFieldType = Object.freeze({ singleline: 0, multiplelines: 1, });


 /**
 * A class for TextField components.
 * @constructor
 * @classdesc 
 * `<code>`
 * html:
 *    <div id="{this.__id__}" class="textField">
 *      <div class="name inputouter">
 *          <h6 class="title">{this.__title__}</h6>
 *          <input class="{this.__field_name__}form" name="{this.__field_name__}" type="text" autocomplete="off">
 *          <div class="footer cf">
 *              <span class="indicator"></span>
 *              <span class="message"></span>
 *              <span class="counter"></span>
 *          </div>
 *      </div>
 *   </div>
 * 
 * usage:
 * 
 *  // Initialize the validators
 *  let requiredValidator = new Validator(titleField, ValidationErrorType.required, 'This field is required');
 *  let lengthValidator = new Validator(titleField, ValidationErrorType.length, 'The length of the text exceeds the limit', [140]);  // assuming max length of 140
 * 
 *  let validators = [requiredValidator, lengthValidator];
 * 
 *  // Initialize the TextField
 *  let titleField = new TextField(
 *      'parentView',  // parent_id
 *      'titleField',  // id
 *      'title',  // field name
 *      TextFieldType.multiplelines,  // single or multi
 *      'title(reqired)',  // title
 *      'Mona Lisa Title and subject',  // placeholder
 *      'div',  // the HTML tag
 *      validators,  // Pass in the validators
 *      140,  // max text count
 *      4,  // init rows
 *      false,  // vertical flex
 *      true,  // assuming the title is visible
 *      false  // assuming password mode is off
 *  );
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the TextField element.
 * @param {string} field_name - The name of the TextField.
 * @param {string} type - The type of TextField.
 * @param {string} title - The title to display in the TextField.
 * @param {string} placeholder - The placeholder text for the TextField.
 * @param {string} htmlTag - The HTML tag to use for the TextField. Defaults to 'div'.
 * @param {Validator[]} validators - The validators for the TextField.
 * @param {number} max_text_count - The maximum character count for the TextField. Defaults to 999.
 * @param {number} init_rows - The initial number of rows in the TextField. Defaults to 6.
 * @param {boolean} vertical_flex - Whether the TextField has vertical flexibility. Defaults to true.
 * @param {boolean} has_title - Whether the TextField has a title. Defaults to true.
 * @param {boolean} password_mode - Whether the TextField is in password mode. Defaults to false.
 */
class TextField extends FormComponentBase {

    __counter_format__ = `$count/$maxcount`;

    __title__ = null;
    __field_name__ = null;
    __placeholder__ = null;
    __max_text_count__ = null;

    __init_rows__ = null;
    __vertical_flex__ = null;

    // states
    _state = null;
    _loadingState = null;
    _validationState = null;
    _inputState = null;

    // data
    _text = '';
    _count = null;

    constructor(
        parent_id, 
        id, 
        field_name, 
        type, 
        title, 
        placeholder,
        htmlTag = 'div', 
        validators = [], 
        max_text_count = 999, 
        init_rows = 6, 
        vertical_flex = false, 
        has_title = true,
        password_mode = false,
        defaultValue = null, 
        cookieExclude = false, 
        hasCookiePrefix = false, 
        isDefaultValueRestoredFromCookie = true
    ) {

        super(parent_id, id, field_name, '', htmlTag, validators, defaultValue, cookieExclude, hasCookiePrefix, isDefaultValueRestoredFromCookie);

        // set options
        const options = [
            {name: '__type__', value: type, type: 'number'},
            {name: '__title__', value: title, type: 'string'},
            {name: '__field_name__', value: field_name, type: 'string'},
            {name: '__placeholder__', value: placeholder, type: 'string'},
            {name: '__max_text_count__', value: max_text_count, type: 'number'},
            {name: '__init_rows__', value: init_rows, type: 'number'},
            {name: '__vertical_flex__', value: vertical_flex, type: 'boolean'},
            {name: '__has_title__', value: has_title, type: 'boolean'},
            {name: '__password_mode__', value: password_mode, type: 'boolean'},
        ];

        options.forEach(option => {
            // set the value
            this[option.name] = option.value;
        
            // check the type
            if (typeof this[option.name] !== option.type) {
                console.error(`${option.name.replace('__', '')} must be of type ${option.type}, but got ${typeof option.value}`);
            }
        });
 
        // initialize view elements
        this._setElements();
        // set counter 
        this.count = 0;
        // validators
        this.validators = validators;
        // password mode
        this._togglePasswordMode(this.__password_mode__);
        // restore from cookie
        this._restoreValueFromCookie();
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
        this._setValueToCookies(text);
    }

    get text() {return this._text}

    /**
     * count setter / getter.
     */
    set count(count) {
        this._count = count;
        // update counter text
        this.$counter.innerHTML = this.__counter_format__
            .replace('$count', count).replace('$maxcount', this.__max_text_count__);
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
    
        // create new elements
        const $nameInputOuter = document.createElement('div');
        $nameInputOuter.className = 'name inputouter';
    
        const $title = document.createElement('h6');
        $title.className = 'title';
        $title.textContent = this.__title__;
        $nameInputOuter.appendChild($title);
        if (!this.__has_title__) $title.remove();
    
        const $inputElem = document.createElement(this.__type__ == TextFieldType.singleline ? 'input' : 'textarea');
        $inputElem.className = this.__field_name__ + 'form';
        $inputElem.name = this.__field_name__;
        if ($inputElem instanceof HTMLInputElement) {
            $inputElem.type = 'text';
        }
        $inputElem.autocomplete = 'off';
        if (this.__type__ !== TextFieldType.singleline) {
            $inputElem.rows = this.__init_rows__;
            $inputElem.contentEditable = true;
        }
        $nameInputOuter.appendChild($inputElem);
        this.$textArea = $inputElem;
    
        const $footer = document.createElement('div');
        $footer.className = 'footer cf';
        ['indicator', 'message', 'counter'].forEach(elem => {
            const $span = document.createElement('span');
            $span.className = elem;
            $footer.appendChild($span);
            this[`$${elem}`] = $span;
        });
        $nameInputOuter.appendChild($footer);
    
        this.$textField.appendChild($nameInputOuter);
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
            console.log(`max text count: ${_this.__max_text_count__} count: ${_this.count}`);
            if (this.count > this.__max_text_count__) {
                this._setState(TextFieldValidationState.onalert, TextFieldInputState.overmaximum);
            } else if (this.count === 0) {
                this._setState(TextFieldValidationState.none, TextFieldInputState.empty);
            } else {
                this._setState(TextFieldValidationState.none, TextFieldInputState.filled);
            }
        })

        // auto resize vertically
        if (_this.__vertical_flex__) {
            debuglog(`Set the keydown event handler for ${this.__id__}.`);
            _this.$textArea.addEventListener('keydown', ()=> {
                console.log(`[event] keydown -> ${_this.$textArea.value}`)
                setTimeout(()=> {
                    this.$textArea.style.cssText = `height:auto; height:${this.$textArea.scrollHeight}px;`;
                }, 0);
            });
        }

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
     * @param {boolean} passwordMode this.__password_mode__
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
     *    <div class="name inputouter">
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
        const id = this.__id__ + '__alert';
        const $parent = this.$textField;
        const $footer = $parent.querySelector('.footer');
        let $alertMessage = $footer.querySelector('#' + id);
    
        if (onAlert) {
            console.log(`Alert turned on for ${this.__id__} with message: ${message}`);
            $parent.classList.add('alert');
    
            // If the alertMessage already exists, update it or return if it's the same.
            if ($alertMessage) {
                if (message !== $alertMessage.innerText) {
                    $alertMessage.innerText = message;
                    console.log(`Updated alert message for ${this.__id__} to: ${message}`);
                } else {
                    console.log(`Alert message for ${this.__id__} is already set to: ${message}`);
                }
                return;
            }
    
            // Create new alert message if it does not exist.
            $alertMessage = document.createElement('p');
            $alertMessage.classList.add('alertMessage');
            $alertMessage.id = id;
            $alertMessage.innerText = message;
            $footer.appendChild($alertMessage);
            debuglog(`Created new alert message for ${this.__id__} with message: ${message}`);
        } else if ($alertMessage) { // Only run if $alertMessage exists
            console.log(`Alert turned off for ${this.__id__}`);
            $parent.classList.remove('alert');
            $footer.removeChild($alertMessage);
        } else {
            //DEBUG: console.log(`Alert method called for ${this.__id__} to remove the message but not found.`);
        }
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