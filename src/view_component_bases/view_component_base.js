/**
 * A base class for view components.
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the new element.
 * @param {string} text - The text to display in the element.
 * @param {string} htmlTag - The type of HTML element to create (e.g., 'div', 'h2', etc.).
 * @param {Array<Validator>} validators - An array of validators to apply to this component.
 */
class ViewComponentBase {
    constructor(parent_id, id, text, htmlTag, validators = []) {
        debuglog(`Initializing ${this.constructor.name} with id=${id}`)
        this.__parent_id__ = parent_id;
        this.__id__ = id;
        this._setElements(text, htmlTag);

        // Apply validators to the component
        this.validators = validators;

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
     * @param {string} text - The text to display in the element.
     * @param {string} htmlTag - The type of HTML element to create (e.g., 'div', 'h2', etc.).
     */
    _setElements(text, htmlTag) {
        // create view
        this.$view = document.createElement(htmlTag);
        this.$view.id = this.__id__;
        this.$view.innerText = text;
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
        this._setEventHandlers();
    }

}