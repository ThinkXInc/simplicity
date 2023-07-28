/**
 * A class for Next Button components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the button element.
 * @param {string} text - The text to display in the button.
 */
class NextButton extends ViewComponentBase {

    constructor(parent_id, id, text) {
        super(parent_id, id, text, 'button');
    }

    /**
     * DOM nodes as variables.
     * Note: This method overrides the _setElements method in the base class.
     * @param {string} text - The text to display in the button.
     * @param {string} htmlTag - The type of HTML element to create ('button').
     */
    _setElements(text, htmlTag) {
        super._setElements(text, htmlTag);
    }
}
