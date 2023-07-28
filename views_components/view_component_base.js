/**
 * A base class for view components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the new element.
 * @param {string} text - The text to display in the element.
 * @param {string} htmlTag - The type of HTML element to create (e.g., 'div', 'h2', etc.).
 */
class ViewComponentBase {
    constructor(parent_id, id, text, htmlTag) {
        this.__parent_id__ = parent_id;
        this.__id__ = id;
        this._setElements(text, htmlTag);
    }

    /**
     * Create and set the DOM elements.
     * @param {string} text - The text to display in the element.
     * @param {string} htmlTag - The type of HTML element to create (e.g., 'div', 'h2', etc.).
     */
    _setElements(text, htmlTag) {
        // parent view
        this.$parentView = document.getElementById(this.__parent_id__);
        if (this.$parentView == null) {
            console.error(
                `The parent element id=${this.__parent_id__} is necessary in HTML.`);
        }

        // create view
        let $view = document.createElement(htmlTag);
        $view.id = this.__id__;
        $view.innerText = text;

        this.$view = $view;
        this.$parentView.appendChild($view);

        this.$view.classList.add(`${this.__parent_id__}_${this.__id__}`);
    }
}