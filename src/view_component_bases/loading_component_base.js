'use strict';
class LoadingConfig extends ViewComponentConfig {
    constructor({
        htmlTag = 'div',
        ...otherOptions
    } = {}) {
        super(otherOptions);
        this.htmlTag = htmlTag;
    }
}

/**
 * Base class for loading components. Manages loading state and display style.
 * 
 * @class LoadingComponentBase
 * @extends {ViewComponentBase}
 */
class LoadingComponentBase extends ViewComponentBase {
    /**
     * Constructs an instance of LoadingComponentBase.
     * 
     * @param {string} parent_id - The id of the parent element.
     * @param {string} id - The id of the loading component.
     */
    constructor(parent_id, id, config = new LoadingConfig()) {
		super(parent_id, id, config);
        this.config = config;
        this.isLoading = false;
        this.$view.style.display = 'none';
	}

    addToParent() {
        const parentId = this.__parent_id__;
        let $parent = document.getElementById(parentId);
    
        // Check if $parent is null or not an instance of HTMLElement
        if (!$parent || !($parent instanceof HTMLElement)) {
            console.error(`[ERROR] Could not find a parent element with id=${parentId} or the element is not a valid HTML element.`);
            return;
        }
    
        // Check if this.$view is valid
        if (!this.$view || !(this.$view instanceof HTMLElement)) {
            console.error(`[ERROR] this.$view is not a valid HTMLElement.`);
            return;
        }
    
        // If parent has no children, append this.$view normally
        if ($parent.childNodes.length === 0) {
            $parent.appendChild(this.$view);
        } else {
            // Otherwise, insert this.$view as the first child
            $parent.insertBefore(this.$view, $parent.firstChild);
        }
    }

    /**
     * Inherited from ViewComponentBase, does not add additional functionality.
     */
    _setElements() {
        super._setElements(this.config.htmlTag);
    }

    /**
     * Starts the loading state and makes the component visible.
     */
	startLoading() {
        this.$view.style.display = 'block';
        this.isLoading = true;
	}

    /**
     * Stops the loading state and hides the component.
     */
	stopLoading() {
        this.$view.style.display = 'none';
        this.isLoading = false;
	}

    /**
     * Returns the current loading state.
     * 
     * @returns {boolean} - True if loading, false otherwise.
     */
	isLoading() {
        return this.isLoading;
	}
}

class LoadingProtocol {
    /**
     * Protocol method to start loading. This method should be implemented in the classes 
     * that conform to this protocol.
     * @abstract
     * @param {LoadingComponentBase} loading - The loading component to start.
     * @throws {Error} Will throw an error if the method is not implemented.
     */
    startLoading(loading) {
        throw new Error('You have to implement the method startLoading!');
    }

    /**
     * Protocol method to stop loading. This method should be implemented in the classes 
     * that conform to this protocol.
     * @abstract
     * @param {LoadingComponentBase} loading - The loading component to stop.
     * @throws {Error} Will throw an error if the method is not implemented.
     */
    stopLoading(loading) {
        throw new Error('You have to implement the method stopLoading!');
    }
}