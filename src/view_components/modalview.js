// Define ModalViewConfig
class ModalViewConfig extends ViewComponentConfig {
    constructor({
        title = "",
        text = "",
        cancelButtonText = "Cancel",
        doneButtonText = "Done",
        shouldCloseOnTapBG = true,
        htmlTag = 'div',
        protocols = [],
        validators = []
    } = {}) {
        super({ htmlTag, protocols, validators });
        this.title = title;
        this.text = text;
        this.cancelButtonText = cancelButtonText;
        this.doneButtonText = doneButtonText;
        this.shouldCloseOnTapBG = shouldCloseOnTapBG;
    }
}

// Define ModalViewProtocol
class ModalViewProtocol {
    done() {
        throw new Error('You have to implement the done method in the subclass of ModalView!');
    }
}

// Define ModalView
class ModalView extends ViewComponentBase {
    constructor(id, config = new ModalViewConfig()) {
        super(id, config);
        this.config = config;
        this._setElements();

        if (this.config.shouldCloseOnTapBG) {
            this._initializeCloseOnBackgroundTap();
        }
    }

    _setElements() {
        super._setElements();

        this.$view.classList.add('ModalView');
        this.$view.style.display = 'none';

        // Background
        this.$bg = document.createElement('div');
        this.$bg.classList.add('bg');
        this.$bg.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        this.$view.appendChild(this.$bg);

        // Window
        this.$window = document.createElement('div');
        this.$window.classList.add('window');
        this.$view.appendChild(this.$window);

        // ContentWrapper
        this.$contentWrapper = document.createElement('div');
        this.$contentWrapper.classList.add('contentWrapper');
        this.$window.appendChild(this.$contentWrapper);

        // Title
        this.$title = document.createElement('h3');
        this.$title.classList.add('ModalViewTitle');
        this.$title.textContent = this.config.title;
        this.$contentWrapper.appendChild(this.$title);

        // MainContent
        this.$mainContent = document.createElement('div');
        this.$mainContent.classList.add('mainContent');
        this.$mainContent.textContent = this.config.text;
        this.$contentWrapper.appendChild(this.$mainContent);

        // Footer
        this.$footer = document.createElement('div');
        this.$footer.classList.add('footer');
        this.$window.appendChild(this.$footer);

        // CancelButton
        this.$cancelButton = document.createElement('button');
        this.$cancelButton.classList.add('cancelButton');
        this.$cancelButton.textContent = this.config.cancelButtonText;
        this.$cancelButton.addEventListener('click', () => this.cancel());
        this.$footer.appendChild(this.$cancelButton);

        // DoneButton
        this.$doneButton = document.createElement('button');
        this.$doneButton.classList.add('doneButton');
        this.$doneButton.textContent = this.config.doneButtonText;
        this.$doneButton.addEventListener('click', () => this.done());
        this.$footer.appendChild(this.$doneButton);

        // Alert for displaying error messages
        this.$alert = document.createElement('div');
        this.$alert.classList.add('ModalViewAlert');
        this.$alert.style.display = 'none'; // Initially hidden
        this.$contentWrapper.appendChild(this.$alert);
    }

    _initializeCloseOnBackgroundTap() {
        this.$bg.addEventListener('click', (event) => {
            debuglog(`${this.id} bg tapped.`)
            // Ensure the click event originated from the background itself
            // and not from any of its child elements.
            if (event.target === this.$bg) {
                this.cancel();
            }
        });
    }

    show() {
        // Show the modal view (e.g., make it visible in the DOM)
        this.$view.style.display = 'block';
    }

    cancel() {
        // Close the modal view (e.g., hide it, remove it from the DOM, etc.)
        this.$view.style.display = 'none';
    }

    close() {
        this.cancel();
    }

    alert(isShown, message = null) {
        if (isShown) {
            this.$alert.style.display = 'block';
            if (message) {
                this.$alert.textContent = message;
            }
        } else {
            this.$alert.style.display = 'none';
        }
    }
}