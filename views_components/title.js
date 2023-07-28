/**
 * A class for title components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the new element.
 * @param {string} text - The text to display in the element.
 * @param {string} htmlTag - The type of HTML element to create (default is 'h2').
 */
class Title extends ViewComponentBase {

    constructor(parent_id, id, text, htmlTag = 'h2') {
        super(parent_id, id, text, htmlTag);
    }

    /**
     * DOM nodes as variables.
     * Note: This method overrides the _setElements method in the base class.
     * @param {string} text - The text to display in the element.
     * @param {string} htmlTag - The type of HTML element to create.
     */
    _setElements(text, htmlTag) {
        super._setElements(text, htmlTag);
    }
}
