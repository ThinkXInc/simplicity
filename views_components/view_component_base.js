/**
 * A base class for view components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the new element.
 * @param {string} text - The text to display in the element.
 * @param {string} htmlTag - The type of HTML element to create (e.g., 'div', 'h2', etc.).
 * @param {Array<Validator>} validators - An array of validators to apply to this component.
 */
class ViewComponentBase {
    constructor(parent_id, id, text, htmlTag, validators = []) {
        this.__parent_id__ = parent_id;
        this.__id__ = id;
        this._setElements(text, htmlTag);

        // Check if the value property has been defined in subclass
        if (this.value === undefined) {
            throw new TypeError("Must override property 'value'");
        }

        // Check if alert function has been defined in subclass
        if (typeof this.alert !== "function") {
            throw new TypeError("Must override method 'alert'");
        }

        // Apply validators to the component
        this.validators = validators;
    }

    /**
     * Create and set the DOM elements.
     * @param {string} text - The text to display in the element.
     * @param {string} htmlTag - The type of HTML element to create (e.g., 'div', 'h2', etc.).
     */
    _setElements(text, htmlTag) {
        // parent view
        this.$parentView = document.getElementById(this.__parent_id__);
        if (this.$parentView == null) {
            console.error(
                `The parent element id=${this.__parent_id__} is necessary in HTML.`);
        }

        // create view
        let $view = document.createElement(htmlTag);
        $view.id = this.__id__;
        $view.innerText = text;

        this.$view = $view;
        this.$parentView.appendChild($view);

        this.$view.classList.add(`${this.__parent_id__}_${this.__id__}`);
    }

    /**
     * Validate the component using its validators.
     */
    validate() {
        let isValid = true;
        for (let validator of this.validators) {
            let errorMessage = validator.validate(this.value);
            if (errorMessage !== null) {
                this.alert(true, errorMessage);
                isValid = false;
                break;
            }
        }
        if (isValid) {
            this.alert(false);
            console.log(`No validation errors found in ${this.__id__}`);
        }
        return isValid;
    }

    // Placeholder for alert function to be implemented in subclasses
    alert(isError, message = '') {
        throw new Error(`You have to implement the method alert in ${this.__id__}!`);
    }

    // Placeholder for value property to be implemented in subclasses
    get value() {
        throw new Error(`You have to implement the property getter for value in ${this.__id__}!`);
    }

    set value(value) {
        throw new Error(`You have to implement the property setter for value in ${this.__id__}!`);
    }
}
