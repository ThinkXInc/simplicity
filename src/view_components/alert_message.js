/**
 * A class for AlertMessage components that display or hide a message.
 * This class implements the AlertMessageProtocol.
 * @constructor
 * @param {string} id - The id for the new element.
 */
class AlertMessage extends AlertMessageComponentBase {
    constructor(id) {
        super(id);
    }

    /**
     * Overrides the show method in the base class.
     * @param {string} text - The message to display.
     */
    show(text) {
        super.show(text);
    }

    /**
     * Overrides the hide method in the base class.
     */
    hide() {
        super.hide();
    }
}