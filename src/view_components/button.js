class ButtonConfig extends ViewComponentConfig {
    constructor({
        htmlTag = 'div',
        text = 'Back',
        buttonClickEventNameSuffix = '_click',  // Suffix to form the event name
        ...otherOptions
    } = {}) {
        super(otherOptions);
        this.htmlTag = htmlTag;
        this.text = text;
        this.buttonClickEventNameSuffix = buttonClickEventNameSuffix;
    }
}

/**
 * A class for Back Button components.
 */
class Button extends ViewComponentBase {

    constructor(id, config = new BackButtonConfig()) {
        super(id, config);
        this.config = config;
        this.text = config.text;
        this.buttonClickEventName = `${id}${config.buttonClickEventNameSuffix}`;
    }

    _setElements() {
        super._setElements(this.config.htmlTag);
        this.$view.innerText = this.config.text;
    }

    _setEventHandlers() {
        console.log(`Set the click event handler for ${this.id}.`);
        this.$view.addEventListener('click', () => {
            const event = new CustomEvent(this.buttonClickEventName, {
                detail: {} 
            });
            this.$view.dispatchEvent(event);
            console.log(`Custom event ${this.buttonClickEventName} dispatched.`);
        })
    }
}