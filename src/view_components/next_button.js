class NextButtonConfig extends ViewComponentConfig {
    constructor({
        htmlTag = 'button',
        text = 'Next',
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
 * @param {string} id - The id for the button element.
 * @param {string} text - The text to display in the button.
 */
class NextButton extends ViewComponentBase {

    constructor(id, config = new NextButtonConfig()) {
        if (typeof config === 'string') {
            config = new NextButtonConfig({ text: config });
        }
        super(id, config);
        this.config = config;
        this.text = config.text;
    }

    /**
     * DOM nodes as variables.
     * Note: This method overrides the _setElements method in the base class.
     * @param {string} htmlTag - The type of HTML element to create ('button').
     */
    _setElements() {
        super._setElements();
        this.$view.classList.add('spl-nextButton');
        this.$view.innerText = this.config.text;
    }

    /**
     * Set the event handler for the button. If the view controller is set and the method 
     * nextButtonTapped exists in the view controller, this method will be called when the button is clicked.
     */
    _setEventHandlers() {
        console.log(`Set the click event handler for ${this.id}.`);
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
