/**
 * A base class for AlertMessage components that display or hide a message.
 * Initially, the message is hidden.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the new element.
 * @param {string} htmlTag - The type of HTML element to create (default is 'div').
 */
 class AlertMessageComponentBase extends ViewComponentBase {

    constructor(parent_id, id, htmlTag = 'div') {
        super(parent_id, id, '', htmlTag);
    }

    /**
     * Overrides the _setElements method in the base class.
     * The message element is hidden by default.
     * @param {string} text - The text to display in the element.
     * @param {string} htmlTag - The type of HTML element to create.
     */
    _setElements(text, htmlTag) {
        super._setElements(text, htmlTag);
    
        // Additional setup specific to AlertMessage
        this.$view.classList.add('AlertMessage');

        // create message element and hide it by default
        this.$message = document.createElement('p');
        this.$message.id = this.__id__ + '__message';
        this.$message.classList.add('AlertMessage__message');
        this.$message.style.display = 'none';  // Initially hidden
        this.$view.appendChild(this.$message);
    }

    /**
     * Displays a message in the AlertMessage element.
     * @param {string} text - The message to display.
     */
    show(text) {
        console.log(`AlertMessage ${this.__id__} show: ${text}`);
        this.$message.innerText = text;
        this.$message.style.display = 'block';  // Show the message
    }

    /**
     * Hides the message in the AlertMessage element.
     */
    hide() {
        console.log(`AlertMessage ${this.__id__} hide message.`);
        this.$message.innerText = '';
        this.$message.style.display = 'none';  // Hide the message
    }
}

/**
 * A protocol class for AlertMessage components.
 * This class defines the interface that AlertMessage components should implement.
 */
 class AlertMessageProtocol {
    /**
     * Protocol method to show a message. This method should be implemented in the classes 
     * that conform to this protocol.
     * @abstract
     * @param {string} text - The message to display.
     * @throws {Error} Will throw an error if the method is not implemented.
     */
    show(text) {
        throw new Error('You have to implement the method show!');
    }

    /**
     * Protocol method to hide a message. This method should be implemented in the classes 
     * that conform to this protocol.
     * @abstract
     * @throws {Error} Will throw an error if the method is not implemented.
     */
    hide() {
        throw new Error('You have to implement the method hide!');
    }
}