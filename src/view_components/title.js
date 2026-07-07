class TitleConfig extends ViewComponentConfig {
    constructor({
        htmlTag = 'h2',
        text = '',
        ...otherOptions
    } = {}) {
        super(otherOptions);
        this.htmlTag = htmlTag;
        this.text = text;
    }
}

/**
 * A class for title components.
 * @constructor
 * @param {string} id - The id for the new element.
 * @param {string} text - The text to display in the element.
 * @param {string} htmlTag - The type of HTML element to create (default is 'h2').
 */
class Title extends ViewComponentBase {

    constructor(id, config = new TitleConfig()) {
        super(id, config);
        this.config = config;
    }

    /**
     * DOM nodes as variables.
     * Note: This method overrides the _setElements method in the base class.
     */
    _setElements() {
        super._setElements(this.config.htmlTag);
        this.$view.innerText = this.config.text;
    }

    /**
     * Set the event handler for the button. If the view controller is set and the method 
     * backButtonTapped exists in the view controller, this method will be called when the button is clicked.
     */
    _setEventHandlers() {
    }
}
