class FormComponentBase extends ViewComponentBase {
    constructor(parent_id, id, field_name, text, htmlTag, viewController, validators = [], defaultValue = null, cookieExclude = false) {
        super(parent_id, id, text, htmlTag, viewController, validators);
        this.__cookie_exclude__ = cookieExclude; //fields you don't want to be saved in cookies.
        this.__field_name__ = field_name;
        this.value = defaultValue;  // this will trigger the setter and save the default value to cookies if necessary.
    }

    _getValueFromCookies() {
        const cookieName = `${this.__field_name__}`;
        const value = Cookies.get(cookieName);
        if (value !== undefined) {
            return value;
        }
        return null;
    }

    _setValueToCookies(value) {
        const cookieName = `${this.__field_name__}`;
        if (!this.__cookie_exclude__) {
            Cookies.set(cookieName, value, { expires: 3, secure: true, sameSite: 'strict' });
        } else {
            console.error(`The value of ${this.__id__} is excluded from being stored in cookies.`);
        }
    }

    _removeValueInCookies() {
        const cookieName = `${this.__field_name__}`;
        Cookies.remove(cookieName);
        console.log(`${cookieName} removed from cookie.`);
    }

    /**
     * Validates the current component using its set validators.
     * It iterates through each validator, and if an error message is returned,
     * it triggers an alert with the error message, marks the component as invalid, and breaks the loop.
     * If no validation errors are found, it deactivates the alert and logs a message stating that no validation errors were found.
     *
     * @interface
     * @returns {null|string} - Null if the component is valid; the error message string if the component is not valid.
     */
    validate() {
        let errorMessage = null;
        for (let validator of this.validators) {
            console.log(`Running validator: ${validator.errorType}`);
            errorMessage = validator.validate(this.value);
            if (errorMessage !== null) {
                console.log(`Validation error found for ${this.__id__}: ${errorMessage}`);
                this.alert(true, errorMessage);
                break;
            }
        }
        if (errorMessage === null) {
            console.log(`No validation errors found in ${this.__id__}`);
            this.alert(false);
        } else {
            console.log(`Validation failed for ${this.__id__}`);
        }
        console.log(`Finished validation for ${this.__id__} with result: ${errorMessage ? "Error: " + errorMessage : "No errors"}`);
        return errorMessage;
    }
    

    /**
     * @interface
     * @param {boolean} isError - The error status of the component.
     * @param {string} message - The error message to be displayed.
     * 
     * Handle the alert logic for the component. 
     * This is a no-op function by default but can be overridden by subclasses if needed.
     */
    // override this in subclasses
    alert(isError, message = '') {
        throw new Error(`The subclass class of ${this.constructor.name} must implement alert method!`);
    }

    // override this in subclasses
    get value() {
        throw new Error(`The subclass class of ${this.constructor.name} must implement getter for value!`);
    }

    // override this in subclasses
    set value(value) {
        this._setValueToCookies(value); // the value is saved to cookies whenever it's set.
    }
}