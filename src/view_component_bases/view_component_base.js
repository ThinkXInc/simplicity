class ViewComponentConfig {
    constructor({
        htmlTag = 'div',
        validators = []
    } = {}) {
        this.htmlTag = htmlTag;
        this.validators = validators;
    } 
}

/**
 * A base class for view components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the new element.
 * @param {string} text - The text to display in the element.
 */
class ViewComponentBase {
    constructor(parent_id, id, config = new ViewComponentConfig()) {
        debuglog(`Initializing ${this.constructor.name} with id=${id}`)
        this.__parent_id__ = parent_id;
        this.__id__ = id;
        this.config = config;

        this._setElements();

        // Apply validators to the component
        this.validators = this.config.validators;

        // Set this component as the target for each validator
        this.validators.forEach(validator => {
            validator.setComponent(this);
        });
    }

    init() {
        this._checkProperties()
    }

    _checkProperties() {
        if (typeof this.alert !== "function") {
            throw new TypeError("Subclass must override 'alert' method");
        }
        if (typeof this._setEventHandlers !== "function") {
            throw new TypeError("Subclass must implement '_setEventHandlers' method");
        }
    }

    /**
     * Create and set the DOM elements.
     * @param {string} htmlTag - The type of HTML element to create (e.g., 'div', 'h2', etc.).
     */
    _setElements() {
        if (this.config.htmlTag == '' || this.config.htmlTag == null) {
            throw new Error(`htmlTag in config must be valid html tag but ${this.config.htmlTag}`);
        }
        // create view
        this.$view = document.createElement(this.config.htmlTag);
        this.$view.id = this.__id__;
        this.$view.classList.add(`${this.__id__}`);
        this.$view.classList.add(`${this.constructor.name}`);
    }

    /**
     * Add this component to the given page.
     * 
     * @param {Page} page 
     */
    addToPage(page) {
        this.addToParent(page.$view);
        this.setPageIndex(page.pageIndex);
        this.$view.classList.add(`${page.__id__}__${this.constructor.name}`);
    }

    /**
     * Adds this component to the given parent DOM element.
     *
     * This method is necessary because it encapsulates the responsibility of 
     * adding the component to the DOM within the component itself. This allows 
     * for greater flexibility as the component can be appended to various 
     * parent DOM elements as required, and ensures that the component has 
     * control over its own representation in the DOM.
     *
     * @param {HTMLElement} $parent - The parent DOM element to which this 
     * component will be appended. If not provided or null, an error is logged.
     *
     * @returns {void}
     */
    addToParent($parent) {
        if (!$parent) {
            console.error(
                `The parent element id=${this.__parent_id__} is necessary in HTML.`);
        } else {
            $parent.appendChild(this.$view);
        }
    }

    /**
     * Set page index. 
     * 
     * This is necessary for searching in which page this component belongs to.
     * @param {int} pageIndex 
     */
    setPageIndex(pageIndex) {
        this.pageIndex = pageIndex;
    }

    /**
     * Scrolls the viewport to the element referenced by `this.$view`.
     *
     * @method
     * @param {number} [delay=0] - The delay in milliseconds before the scroll action starts.
     * @description
     * The method uses the `scrollIntoView` function provided by the browser's DOM API.
     * It performs a smooth scroll to the top edge of the target element (`this.$view`).
     * If the target element is horizontally scrollable, it scrolls to the nearest viewport.
     * The function waits for a specified `delay` time (in milliseconds) before performing the scroll.
     */
    scrollTo(delay = 0) {
        setTimeout(() => {
            this.$view.scrollIntoView({
                behavior: 'smooth', // Enable smooth scrolling
                block: 'start', // Scroll to the start (top) of this.$view
                inline: 'nearest' // In case of horizontal scrolling, scroll in the nearest viewport
            });
        }, delay);
    }

    /**
     * @interface
     * @param {boolean} isError - The error status of the component.
     * @param {string} message - The error message to be displayed.
     * 
     * Handle the alert logic for the component. 
     * This is a no-op function by default but can be overridden by subclasses if needed.
     */
    _setEventHandlers() {
        // Default implementation could be empty if no general behavior is needed
        // Or you could throw an error reminding developers to override this method in the subclass
        throw new Error(`Instance ${this.id} must implement the method _setEventHandlers in subclass!`);
    }

    // Set the viewController instance
    setViewController(viewController) {
        this.viewController = viewController;
        //this._setEventHandlers(); <- this causes double event registration [WILL REMOVE THIS LINE]
    }

}