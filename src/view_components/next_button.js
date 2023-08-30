class NextButtonConfig extends ViewComponentConfig {
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
 * A class for Next Button components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the button element.
 * @param {string} text - The text to display in the button.
 */
class NextButton extends ViewComponentBase {

    constructor(parent_id, id, config = new NextButtonConfig()) {
        super(parent_id, id, config);
        this.config = config;
    }

    /**
     * DOM nodes as variables.
     * Note: This method overrides the _setElements method in the base class.
     * @param {string} htmlTag - The type of HTML element to create ('button').
     */
    _setElements(htmlTag) {
        super._setElements(htmlTag);
    }

    /**
     * Set the event handler for the button. If the view controller is set and the method 
     * nextButtonTapped exists in the view controller, this method will be called when the button is clicked.
     */
    _setEventHandlers() {
        console.log(`Set the click event handler for ${this.__id__}.`);
        this.$view.addEventListener('click', () => {
            if(this.viewController && typeof this.viewController.nextButtonTapped === "function"){
                this.viewController.nextButtonTapped(this);
            }else{
                console.error('ViewController not set or nextButtonTapped not a function');
            }
        })
    }
}

class NextButtonProtocol {
    /**
     * Protocol method to handle button tap. This method should be implemented in the classes 
     * that conform to this protocol.
     * @abstract
     * @param {NextButton} button - The next button that was tapped.
     * @throws {Error} Will throw an error if the method is not implemented.
     */
    nextButtonTapped(button) {
        throw new Error("You have to implement the method nextButtonTapped!");
    }
}
