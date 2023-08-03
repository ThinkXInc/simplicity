'use strict';
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
    constructor(parent_id, id) {
		super(parent_id, id, '', 'div');
        this.isLoading = false;
	}

    /**
     * Inherited from ViewComponentBase, does not add additional functionality.
     */
    _setElements(_, htmlTag) {
        super._setElements(_, htmlTag);
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