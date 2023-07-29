const ValidationErrorType = Object.freeze({ required: 0, length: 1, emailFormat: 2, passwordFormat: 3, telFormat: 4, notcorrespond: 99 })

const RegexType = Object.freeze({
    email: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
    postalcode: /^(?:[A-Z0-9]+([- ]?[A-Z0-9]+)*)?$/,
    tel: /^[\+]?[(]?[0-9]{2,3}[)]?[-\s\.]?[0-9]{4,6}[-\s\.]?[0-9]{4,6}$/im,
})

/**
 * Class representing a validation for a component.
 * 
 * <code>
 *  let validator = new Validator(component, ValidationErrorType.emailFormat, "Invalid email format");
 *  let errorMsg = validator.validate("notanemail");
 *  if (errorMsg != null) {
 *       component.alert(true, errorMsg);
 *  }
 * </code>
 */
class Validator {
    /**
     * Create a validation.
     * @param {number} errorType - The type of error this validation is checking for.
     * @param {string} errorMessage - The error message to display if the validation fails.
     * @param {Array} args - Additional arguments needed for this validation.
     */
    constructor(errorType, errorMessage, args = []) {
        if (errorType == null) {
            throw new Error('Validator requires errorType.');
        }
        if (errorMessage == null) {
            throw new Error('Validator requires errorMessage.');
        }

        this.errorType = errorType;
        this.errorMessage = errorMessage;
        this.args = args;
    }

    /**
     * Set the component.
     * @param {ViewComponent} component 
     */
    setComponent(component) {
        if (component == null) {
            throw new Error('Validator requires component applied to.');
        }
        if (typeof component.alert !== 'function') {
            throw new Error('Component must have an alert function.');
        }

        this.component = component;
    }
    
    /**
     * Validate a component's value.
     * @param {string} value - The value to validate.
     * @return {string|null} - The error message if validation fails, or null if it passes.
     */
    validate(value) {
        switch (this.errorType) {
            case ValidationErrorType.required:
                if (!this._validateNotNull(value)) {
                    return this.errorMessage;
                } 
                break;
            case ValidationErrorType.length:
                if (!this._validateLength(value)) {
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.emailFormat:
                if (!this._validateFormat(value, RegexType.email)) {
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.passwordFormat:
                if (!this._validateFormat(value, RegexType.password)) {
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.telFormat:
                if (!this._validateFormat(value, RegexType.tel)) {
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.notcorrespond:
                if (!this._validateNotCorrespond(value)) {
                    return this.errorMessage;
                }
                break;
        }

        return null;
    }
    
    /**
     * Check if a value is not null or undefined.
     * @param {string} value - The value to check.
     * @return {boolean} - Whether or not the value is not null or undefined.
     */
    _validateNotNull(value) {
        return value != null && value != undefined;
    }
    
    /**
     * Check if a value's length is within the provided range.
     * @param {string} value - The value to check.
     * @return {boolean} - Whether or not the value's length is within the range.
     */
    _validateLength(value) {
        const minLength = this.args[0];
        const maxLength = this.args[1];
        return value.length >= minLength && value.length <= maxLength;
    }
    
    /**
     * Check if a value matches a certain format.
     * @param {string} value - The value to check.
     * @param {RegExp} regex - The regular expression representing the format.
     * @return {boolean} - Whether or not the value matches the format.
     */
    _validateFormat(value, regex) {
        return regex.test(value);
    }
}
