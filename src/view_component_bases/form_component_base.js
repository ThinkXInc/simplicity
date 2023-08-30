class FormComponentBaseConfig extends ViewComponentConfig {
    constructor({
        defaultValue = null,
        cookieExclude = false,
        hasCookiePrefix = false,
        validators = [],
        ...otherOptions
    } = {}) {
        super(otherOptions);
        this.defaultValue = defaultValue;
        this.cookieExclude = cookieExclude;
        this.hasCookiePrefix = hasCookiePrefix;
        this.validators = validators;
    }
}
/**
 * FormComponentBase is a base class for form components, providing functionalities to handle
 * form field values and their interactions with cookies. 
 * 
 * The constructor takes in several parameters, including field_name for identifying the form field,
 * and other parameters for cookie handling (like cookieExclude, hasCookiePrefix and isDefaultValueRestoredFromCookie).
 * 
 * Other methods like _getValueFromCookies(), _setValueToCookies(value), _removeValueInCookies() and 
 * _restoreValueFromCookie() provide utilities for interacting with the cookies.
 */
class FormComponentBase extends ViewComponentBase {
    constructor(parent_id, id, field_name, config = new FormComponentBaseConfig()) {
        super(parent_id, id, config);
        this.config = config;
        this.validators = config.validators;

        this.__field_name__ = field_name;
        this.__cookie_prefix__ = this.config.hasCookiePrefix ? `${parent_id}__` : '';
        this.__cookie_name__ = `${this.__cookie_prefix__}${field_name}`;

        // Set the default value.
        // This will trigger the setter and save the value to cookies.
        if (this.config.defaultValue !== null) {
            this.value = this.config.defaultValue; // If defaultValue is set, use it.
        }
    }

    /**
     * Retrieves the value of this field from cookies.
     * @return {string|null} - The value of this field stored in cookies, or null if it does not exist.
     */
    _getValueFromCookies() {
        const value = Cookies.get(this.__cookie_name__);
        if (value !== undefined) {
            return value;
        }
        return null;
    }

    /**
     * Sets a value to cookies for this field.
     * @param {string|null} value - The value to be set to cookies. If it's null, the function will do nothing.
     */
    _setValueToCookies(value) {
        if (value !== null) {
            if (!this.config.cookieExclude) {
                Cookies.set(this.__cookie_name__, value, { expires: 3, secure: true, sameSite: 'strict' });
                console.log(`Save cookie => key: ${this.__cookie_name__} value: ${value}`);
            } else {
                console.error(`The value of ${this.__id__} is excluded from being stored in cookies.`);
            }
        }
    }

    /**
     * Removes the value of this field from cookies.
     */
    _removeValueInCookies() {
        Cookies.remove(this.__cookie_name__);
        console.log(`${this.__cookie_name__} removed from cookie.`);
    }

    /**
     * Restores the value of this field from cookies and sets it as the current value.
     * @param {boolean} ignoreNull - if true, the function will not overwrite the current value with null if the cookie value is null.
     */
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
            debuglog(`Running validator: ${validator.errorType}`);
            errorMessage = validator.validate(this.value);
            if (errorMessage !== null) {
                console.log(`Validation error found for ${this.__id__}: ${errorMessage}`);
                this.alert(true, errorMessage);
                break;
            }
        }
        if (errorMessage === null) {
            debuglog(`No validation errors found in ${this.__id__}`);
            this.alert(false);
        } else {
            debuglog(`Validation failed for ${this.__id__} with result: ${errorMessage ? "Error: " + errorMessage : "No errors"}`);
        }
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
    // NOTE: this setter is necessary to set the defaultValue
    set value(value) {
        throw new Error(`The subclass class of ${this.constructor.name} must implement setter for value!`);
    }
}