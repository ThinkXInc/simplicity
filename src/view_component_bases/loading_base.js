const LoadingAppendedAs = Object.freeze({ 
    firstChild: 0, 
    lastChild: 1
});

class LoadingBase {
    constructor({
            id,
            position = LoadingAppendedAs.firstChild
        }) {
            this.id = id;
            this.position = position;
            this.isLoading = false;
            this._setElements();
            this.$view.style.display = 'none';
    }

    addToParent($parent) {
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
    
        if (this.position == LoadingAppendedAs.firstChild) {
            $parent.insertBefore(this.$view, $parent.firstChild);
        } else {
            $parent.appendChild(this.$view);
        }
    }

    _setElements() {
        this.$view = document.createElement('div');
        this.$view.id = this.id;
        this.$view.classList.add(`${this.id}`);
        this.$view.classList.add(`${this.constructor.name}`);
    }

	startLoading() {
        this.$view.style.display = 'block';
        this.isLoading = true;
	}

	stopLoading() {
        this.$view.style.display = 'none';
        this.isLoading = false;
	}

	isLoading() {
        return this.isLoading;
	}
}