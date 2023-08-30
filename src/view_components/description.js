class DescriptionConfig extends ViewComponentConfig {
    constructor({
        htmlTag = 'p',
        text = '',
        ...otherOptions
    } = {}) {
        super(otherOptions);
        this.htmlTag = htmlTag;
        this.text = text;
    }
}

/**
 * A class for description components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the new element.
 */
class Description extends ViewComponentBase {

    constructor(parent_id, id, config = new DescriptionConfig()) {
        super(parent_id, id, config);
        this.config = config;
        this.text = this.config.text;
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