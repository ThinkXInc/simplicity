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