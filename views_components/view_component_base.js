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
        this.viewController = viewController;
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

        // Set this component as the target for each validator
        this.validators.forEach(validator => {
            validator.setComponent(this);
        });
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
     * @interface
     * @param {boolean} isError - The error status of the component.
     * @param {string} message - The error message to be displayed.
     * 
     * Handle the alert logic for the component. 
     * This is a no-op function by default but can be overridden by subclasses if needed.
     */
    _setEventHandlers() {
        // Default implementation could be empty if no general behavior is needed
        // Or you could throw an error reminding developers to override this method in the subclass
        throw new Error(`Instance ${this.id} must implement the method _setEventHandlers in subclass!`);
    }

    // Set the viewController instance
    setViewController(viewController) {
        this.viewController = viewController;
        this._setEventHandlers();
    }

    /**
     * Validate the component using its validators.
     * @interface
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

    /**
     * @interface
     * @param {boolean} isError - The error status of the component.
     * @param {string} message - The error message to be displayed.
     * 
     * Handle the alert logic for the component. 
     * This is a no-op function by default but can be overridden by subclasses if needed.
     */
    alert(isError, message = '') {
        // No-op function, can be overridden in subclasses
    }

    /**
     * @property {any} value - The value of the component.
     * 
     * Get or Set the value of the component. 
     * By default, this returns null for the getter and does nothing for the setter.
     * These can be overridden by subclasses as needed.
     */
    get value() {
        return null; // Can be overridden in subclasses
    }

    set value(value) {
        // Can be overridden in subclasses
    }
}