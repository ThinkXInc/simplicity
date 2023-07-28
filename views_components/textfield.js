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
 * @classdesc `<div id={id} class=textField>` is necessary in HTML.
 * usage:
 * `<code>`
 *     titleField = new TextField(
 *         'titleField', TextFieldType.multiplelines, 'title(reqired)', 'title',
 *         'Mona Lisa Title and subject', 140, 4, false);
 * `</code>`
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the TextField element.
 * @param {string} type - The type of TextField.
 * @param {string} title - The title to display in the TextField.
 * @param {string} field_name - The name of the TextField.
 * @param {string} placeholder - The placeholder text for the TextField.
 * @param {number} max_text_count - The maximum character count for the TextField. Defaults to 999.
 * @param {number} init_rows - The initial number of rows in the TextField. Defaults to 6.
 * @param {boolean} vertical_flex - Whether the TextField has vertical flexibility. Defaults to true.
 * @param {boolean} has_title - Whether the TextField has a title. Defaults to true.
 * @param {boolean} password_mode - Whether the TextField is in password mode. Defaults to false.
 */
class TextField extends ViewComponentBase {
    __inner_template_single__ = `
        <div class="name inputouter">
            <h6 class=title>$title</h6>
            <input class=$field_nameform name=$field_name type=text autocomplete=off/>
            <div class="footer cf">
                <span class=indicator></span>
                <span class=message></span>
                <span class=counter></span>
            </div>
        </div>
    `
    __inner_template_multiple__ = `
        <div class="name inputouter">
            <h6 class=title>$title</h6>
            <textarea class=$field_nameform name=$field_name rows=$rows contenteditable></textarea>
            <div class="footer cf">
                <span class=indicator></span>
                <span class=message></span>
                <span class=counter></span>
            </div>
        </div>
    `

    __counter_format__ = `$count/$maxcount`;

    __title__ = null;
    __field_name__ = null;
    __placeholder__ = null;
    __max_text_count__ = null;

    __init_rows__ = null;
    __vertical_flex__ = null;

    // states
    _state = null;
    _loadingstate = null;
    _validationstate = null;
    _inputstate = null;

    // data
    _text = '';
    _count = null;

    constructor(parent_id, id, type, title, field_name, placeholder,
            htmlTag = 'div',
            max_text_count=999, init_rows=6, vertical_flex=true, has_title=true,
            password_mode=false) {

        super(parent_id, id, '', htmlTag);

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
        // initialize layout
        this._initLayout();
        // set eventhandlers
        this._setEventHandlers();
        // set counter 
        this.count = 0;
        // password mode
        this._togglePasswordMode(this.__password_mode__);
    }

    /**
     * text setter.
     */
    set text(text) {
        this._text = text;
        this.$textArea.value = text;
        console.log(`text updated: ${text}`);
        // count
        if (text) {
            this.count = text.length;
        }
        // dispatch event
        const event = new CustomEvent('textupdated', {detail: {new: text,}});
        this.$textField.dispatchEvent(event);
    }

    /**
     * text getter.
     */
    get text() {return this._text}

    /**
     * count setter.
     */
    set count(count) {
        this._count = count;
        // update counter text
        this.$counter.innerHTML = this.__counter_format__
            .replace('$count', count).replace('$maxcount', this.__max_text_count__);
    }

    /**
     * count getter.
     */
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
     * loadingstate setter.
     */
    set loadingstate(state) {
        this._loadingstate = state;
        switch (state) {
            case TextFieldLoadingState.none:
                console.log(`TextField ${this.__id__} loadingstate changed -> none`);
                break
            case TextFieldLoadingState.onloading:
                console.log(`TextField ${this.__id__} loadingstate changed -> onloading`);
                break
        }
    }

    /**
     * validationstate setter.
     */
    set validationstate(state) {
        this._validationstate = state;
        switch (state) {
            case TextFieldValidationState.none:
                console.log(`TextField ${this.__id__} validationstate changed -> none`);
                this.$textField.classList.remove('alert');
                break
            case TextFieldValidationState.onalert:
                console.log(`TextField ${this.__id__} validationstate changed -> onalert`);
                this.$textField.classList.add('alert');
                break
            case TextFieldValidationState.onverified:
                console.log(`TextField ${this.__id__} validationstate changed -> onverified`);
                this.$textField.classList.remove('alert');
                break
        }
    }

    /**
     * inputstate setter.
     */
    set inputstate(state) {
        this._inputstate = state;
        switch (state) {
            case TextFieldInputState.empty:
                console.log(`TextField ${this.__id__} inputstate changed -> empty`);
                this.$textField.classList.remove('overMaximumTextCount');
                break
            case TextFieldInputState.filled:
                console.log(`TextField ${this.__id__} inputstate changed -> filled`);
                this.$textField.classList.remove('overMaximumTextCount');
                break
            case TextFieldInputState.overmaximum:
                console.log(`TextField ${this.__id__} inputstate changed -> overmaximum`);
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
 
        // setting innerHTML for the div
        this.$textField.innerHTML = (this.__type__ == TextFieldType.singleline) ?
            this.__inner_template_single__.replaceAll('$field_name', this.__field_name__)
                .replaceAll('$title', this.__title__).replaceAll('$rows', this.__init_rows__)
            : this.__inner_template_multiple__.replaceAll('$field_name', this.__field_name__)
                .replaceAll('$title', this.__title__).replaceAll('$rows', this.__init_rows__);
   
        // title
        this.$title = this.$textField?.querySelector('.title');
        this.$title ?? console.warn(`<h6 class=title> is necessary in HTML.`);
        if (!this.__has_title__) this.$title?.remove();

        // textArea
        this.$textArea = this.__type__ == TextFieldType.singleline 
            ? this.$textField?.querySelector('input') 
            : this.$textField?.querySelector('textarea');
        this.$textArea ?? console.warn(`<input> is necessary in HTML.`);
        this._setPlaceholder(this.__placeholder__);

        // indicator, message, counter
        ['indicator', 'message', 'counter'].forEach(elem => {
            this[`$${elem}`] = this.$textField?.querySelector(`.${elem}`);
            this[`$${elem}`] ?? console.warn(`<span class=${elem}> is necessary in HTML.`);
        });
    }

    /**
     * Initialize the layout for display.
     */
    _initLayout() {
    }

    /**
     * Set event handlers.
     */
    _setEventHandlers() {
        const _this = this;
        this.$textArea.addEventListener('input', (e) => {
            console.log(`text in textarea changed. -> ${_this.$textArea.value}`)
            _this.text = _this.$textArea.value;
            _this.count = _this.$textArea.value.length;

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
            _this.$textArea.addEventListener('keydown', ()=> {
                setTimeout(()=> {
                    this.$textArea.style.cssText = `height:auto; height:${this.$textArea.scrollHeight}px;`;
                }, 0);
            });
        }

        // onfocus

        // on
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
        this.validationstate = validationState;
        this.inputstate = inputState;
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
     * @param {bool} onAlert 
     * @param {string} message
     */
    alert(onAlert, message) {
        const id = this.__id__ + '_alert';
        const $parent = this.$textField;
        const $footer = $parent.querySelector('.footer');
        let $alertMessage = $footer.querySelector('#' + id);
    
        if (onAlert) {
            $parent.classList.add('alert');
    
            // If the alertMessage already exists, update it or return if it's the same.
            if ($alertMessage) {
                if (message !== $alertMessage.innerText) {
                    $alertMessage.innerText = message;
                }
                return;
            }
    
            // Create new alert message if it does not exist.
            $alertMessage = document.createElement('p');
            $alertMessage.classList.add('alertMessage');
            $alertMessage.id = id;
            $alertMessage.innerText = message;
            $footer.appendChild($alertMessage);
        } else if ($alertMessage) { // Only run if $alertMessage exists
            $parent.classList.remove('alert');
            $footer.removeChild($alertMessage);
        }
    }
}

