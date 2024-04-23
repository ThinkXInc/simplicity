class ModalView {
    constructor({
        id,
        title = "",
        text = "",
        cancelButtonText = "Cancel",
        doneButtonText = "Done",
        shouldCloseOnTapBG = true,
        htmlTag = 'div',
        protocols = [],
        validators = []
    }) {
        this.id = id;
        this.title = title;
        this.text = text;
        this.cancelButtonText = cancelButtonText;
        this.doneButtonText = doneButtonText;
        this.shouldCloseOnTapBG = shouldCloseOnTapBG;
        this.htmlTag = htmlTag;
        this.protocols = protocols;
        this.validators = validators;

        this.createElements();

        if (this.shouldCloseOnTapBG) {
            this.setCloseOnBackgroundTap();
        }
    }

    createElements() {
        this.$view = document.createElement(this.htmlTag);
        this.$view.id = this.id;
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
        this.$title.textContent = this.title;
        this.$contentWrapper.appendChild(this.$title);

        // MainContent
        this.$mainContent = document.createElement('div');
        this.$mainContent.id = `${this.id}MainContent`;
        this.$mainContent.classList.add('mainContent');
        if (this.text.length) {
            this.$mainContent.textContent = this.text;
        }
        this.$contentWrapper.appendChild(this.$mainContent);

        // Footer
        this.$footer = document.createElement('div');
        this.$footer.classList.add('footer');
        this.$window.appendChild(this.$footer);

        // CancelButton
        this.$cancelButton = document.createElement('button');
        this.$cancelButton.classList.add('cancelButton');
        this.$cancelButton.textContent = this.cancelButtonText;
        this.$cancelButton.addEventListener('click', () => this.cancel());
        this.$footer.appendChild(this.$cancelButton);

        // DoneButton
        this.$doneButton = document.createElement('button');
        this.$doneButton.classList.add('doneButton');
        this.$doneButton.textContent = this.doneButtonText;
        this.$doneButton.addEventListener('click', () => this.done());
        this.$footer.appendChild(this.$doneButton);

        // Alert for displaying error messages
        this.$alert = document.createElement('div');
        this.$alert.classList.add('ModalViewAlert');
        this.$alert.style.display = 'none'; // Initially hidden
        this.$contentWrapper.appendChild(this.$alert);
    }

    mount(selectorOrElement) {
        let container;
    
        // Check if the input is a string, implying a selector
        if (typeof selectorOrElement === 'string') {
            container = document.querySelector(selectorOrElement);
            if (!container) {
                console.error(`No element found with selector ${selectorOrElement}`);
                return;
            }
        } else if (selectorOrElement instanceof Element) {
            container = selectorOrElement;
        } else {
            console.error('Invalid input: selector must be a string or a DOM element');
            return;
        }
        container.appendChild(this.$view);
    }

    setCloseOnBackgroundTap() {
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

    // Others (WILL DEPRECATE)
    addToPage(page) {
        // WILL DEPRECATE
        // NOTE: この時点でpageのdom elementはまだHTML上にないことに注意
        // すべてのview componentをpageにアタッチした後でなければpageはHTML上に作られない
        // 詳しくはInputPageViewControllerのsetElements()のフローを参照
        if (!page.$view.id) {
            console.error(`[ERROR] ${page.$view} has no id`);
        }
        this.addTo(page.$view);
        this.setPageIndex(page.pageIndex);
        this.$view.classList.add(`${page.id}__${this.constructor.name}`);
    }

    addTo($parent) {
        // WILL DEPRECATE
        if (!$parent || $parent == undefined || !($parent instanceof HTMLElement)) {
            console.error(
                `[ERROR] $parent must exist but ${$parent} `);
        } else {
            debuglog(`[${$parent.className}] appendChild ${this.id}`)
            $parent.appendChild(this.$view);
        }
    }

    setViewController(viewController) {
        // WILL DEPRECATE
        this.viewController = viewController;
        //this._setEventHandlers(); <- this causes double event registration [WILL REMOVE THIS LINE]
    }

    setPageIndex(pageIndex) {
        // WILL DEPRECATE
        this.pageIndex = pageIndex;
    }

    scrollTo(delay = 0) {
        setTimeout(() => {
            this.$view.scrollIntoView({
                behavior: 'smooth', // Enable smooth scrolling
                block: 'start', // Scroll to the start (top) of this.$view
                inline: 'nearest' // In case of horizontal scrolling, scroll in the nearest viewport
            });
        }, delay);
    }
}