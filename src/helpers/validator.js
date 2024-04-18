const ValidationErrorType = Object.freeze(
    { 
        required: 'required', maxLength: 'max_length',
        emailFormat: 'email_format', passwordFormat: 'password_format',
        telFormat: 'tel_format', postalCodeFormat: 'postal_code_format',
        domainFormat: 'domain_format',
        positiveIntegerFormat: 'positive_integer_format',
        notCorresponding: 'not_corresponding',
     })


const RegexType = Object.freeze({
    email: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
    postalcode: /^(?:[A-Z0-9]+([- ]?[A-Z0-9]+)*)?$/,
    tel: /^[\+]?[(]?[0-9]{2,3}[)]?[-\s\.]?[0-9]{4,6}[-\s\.]?[0-9]{4,6}$/im,
    domainFormat: /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:\/?#\[\]@!$&'()*+,;=]*)?$/,
    positiveIntegerFormat: /^[1-9]\d*$/,
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
    constructor({
        errorType,
        errorMessage,
        maxLength = 9999999,
        min = 1,
        max = 999999,
    }) {
        if (errorType == null) {
            throw new Error('Validator requires errorType.');
        }
        if (errorMessage == null) {
            throw new Error('Validator requires errorMessage.');
        }

        this.errorType = errorType;
        this.errorMessage = errorMessage;
        this.maxLength = maxLength;
        this.min = min;
        this.max = max;

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

        if (errorType === ValidationErrorType.positiveIntegerFormat) {
            this.errorMessage = this.errorMessage.replace('$0', this.min).replace('$1', this.max);
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
                    debuglog(`validated: ${value} is null.`)
                    return this.errorMessage;
                } 
                break;
            case ValidationErrorType.maxLength:
                debuglog(`validating.. ${value} > max length ${this.maxLength}.`)
                if (!this._validateMaxLength(value)) {
                    debuglog(`validated: ${value} > max length ${this.maxLength}.`)
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.emailFormat:
                if (!this._validateFormat(value, RegexType.email)) {
                    debuglog(`validated: ${value} is invalid email format.`)
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.passwordFormat:
                if (!this._validateFormat(value, RegexType.password)) {
                    debuglog(`validated: ${value} is invalid password format.`)
                    return this.errorMessage;
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.telFormat:
                if (!this._validateFormat(value, RegexType.tel)) {
                    debuglog(`validated: ${value} is invalid tel format.`)
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.domainFormat:
                if (!this._validateFormat(value, RegexType.domainFormat)) {
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.notCorresponding:
                if (!this._validateNotCorrespond(value)) {
                    debuglog(`validated: ${value} is not corresponding.`)
                    return this.errorMessage;
                }
                break;
            case ValidationErrorType.positiveIntegerFormat:
                if (!this._validateFormat(value, RegexType.positiveIntegerFormat)) {
                    return this.errorMessage;
                }
                const numericValue = Number(value);
                if (numericValue < this.minLength || numericValue > this.maxLength) {
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
