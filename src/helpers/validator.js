const ValidationErrorType = Object.freeze(
    { 
        required: 'required', maxLength: 'max_length',
        emailFormat: 'email_format', passwordFormat: 'password_format',
        telFormat: 'tel_format', postalCodeFormat: 'postal_code_format', notCorresponding: 'not_corresponding' })


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
    constructor(errorType, locale, lang, maxLength = 9999999) {
        if (errorType == null) {
            throw new Error('Validator requires errorType.');
        }
        if (locale == null) {
            throw new Error('Validator requires locale object.');
        }

        this.errorType = errorType;
        this.locale = locale;
        this.errorMessage = locale.get(errorType, lang);
        this.maxLength = maxLength;

        // Check for maxLength value if errorType is maxLength
        if (errorType === ValidationErrorType.maxLength) {
            if (!Number.isInteger(this.maxLength)) {
                throw new Error('For length validation, maxLength must be a number.');
            }
            if (!/\$0/.test(this.errorMessage)) {
                throw new Error('For length validation, error message must include $0 placeholder.');
            }
            this.errorMessage = this.errorMessage.replace('$0', this.maxLength);
        }
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
                if (!this._validateNotNullOrEmpty(value)) {
                    return this.errorMessage;
                } 
                break;
            case ValidationErrorType.maxLength:
                if (!this._validateMaxLength(value)) {
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
            case ValidationErrorType.notCorresponding:
                if (!this._validateNotCorrespond(value)) {
                    return this.errorMessage;
                }
                break;
        }

        return null;
    }

    /**
     * Check if a value is not null, undefined, or an empty string.
     * @param {string} value - The value to check.
     * @return {boolean} - Whether or not the value is not null, undefined, or an empty string.
     */
    _validateNotNullOrEmpty(value) {
        return value != null && value != undefined && value != '';
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
     * Check if a value's length is less than or equal to the provided maxLength.
     * @param {string} value - The value to check.
     * @return {boolean} - Whether or not the value's length is within the range.
     */
    _validateMaxLength(value) {
        return value.length <= this.maxLength;
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
