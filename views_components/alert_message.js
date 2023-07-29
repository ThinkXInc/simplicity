/**
 * A class for AlertMessage components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the new element.
 * @param {string} text - The text to display in the element.
 * @param {string} htmlTag - The type of HTML element to create (default is 'p').
 */
class AlertMessage extends ViewComponentBase {
    _message;

    constructor(parent_id, id, text, htmlTag = 'div') {
        super(parent_id, id, text, htmlTag);
    }

    /**
     * Overrides the _setElements method in the base class.
     * @param {string} text - The text to display in the element.
     * @param {string} htmlTag - The type of HTML element to create.
     */
    _setElements(text, htmlTag) {
        super._setElements(text, htmlTag);
    
        // Additional setup specific to AlertMessage
        this.$view.classList.add('AlertMessage');
        this.message = text;
    }

    /**
     * DOM nodes as variables.
     */
    _setElements() {
        // set class and message
        this.$view.classList.add('AlertMessage');
        this.message = text;
        
        // create message element
        this.$message = document.createElement('p');
        this.$message.id = this.__id__ + '_message';
        this.$message.classList.add('AlertMessage__message');
        this.$view.appendChild(this.$message);
    }

    /**
     * Set the event handler for the button. If the view controller is set and the method 
     * backButtonTapped exists in the view controller, this method will be called when the button is clicked.
     */
    _setEventHandlers() {
    }

    /**
     * message setter.
     */
    set message(message) {
        this._message = message;
        console.log(`${this.__id__} message set: ${message}`);
        // set message
        this.$message.innerText = message;
    }

    /**
     * message getter.
     */
    get message() {return this._message;}
}