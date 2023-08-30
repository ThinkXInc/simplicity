class BackButtonConfig extends ViewComponentConfig {
    constructor({
        htmlTag = 'div',
        text = 'Back',
        ...otherOptions
    } = {}) {
        super(otherOptions);
        this.htmlTag = htmlTag;
        this.text = text;
    }
}

/**
 * A class for Back Button components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the button element.
 * @param {string} text - The text to display in the button.
 */
class BackButton extends ViewComponentBase {

    constructor(parent_id, id, config = new BackButtonConfig()) {
        super(parent_id, id, config);
        this.config = config;
        this.text = config.text;
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
        console.log(`Set the click event handler for ${this.__id__}.`);
        this.$view.addEventListener('click', () => {
            if(this.viewController && typeof this.viewController.backButtonTapped === "function"){
                this.viewController.backButtonTapped(this);
            }else{
                console.error('ViewController not set or backButtonTapped not a function');
            }
        })
    }
}

class BackButtonProtocol {
    /**
     * Protocol method to handle button tap. This method should be implemented in the classes 
     * that conform to this protocol.
     * @abstract
     * @param {BackButton} button - The back button that was tapped.
     * @throws {Error} Will throw an error if the method is not implemented.
     */
    backButtonTapped(button) {
        throw new Error("You have to implement the method backButtonTapped!");
    }
}
