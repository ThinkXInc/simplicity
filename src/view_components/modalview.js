const AnimationType = {
    NO_ANIMATION: 'no-animation',
    EXPAND: 'expand',
    SHRINK: 'shrink'
};

const ModalViewStyle = {
    DEFAULT: 'defaultStyle',
    DARK: 'darkStyle',
};



class ModalView {
    static stylesInjected = false;

    constructor({
        id,
        title = "",
        text = "",
        cancelButtonText = "Cancel",
        doneButtonText = "Done",
        shouldCloseOnTapBG = true,
        htmlTag = 'div',
        protocols = [],
        validators = [],
        showAnimation = AnimationType.NO_ANIMATION,
        closeAnimation = AnimationType.NO_ANIMATION,
        baseCSSStyle = ModalViewStyle.DEFAULT,
        onDone = ()=>{}
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
        this.showAnimation = showAnimation;
        this.closeAnimation = closeAnimation;
        this.baseCSSStyle = baseCSSStyle;
        this.onDone = onDone;

        this.createElements();

        if (this.shouldCloseOnTapBG) {
            this.setCloseOnBackgroundTap();
        }
    }

    createElements() {
        this.$view = document.createElement(this.htmlTag);
        this.$view.id = this.id;
        this.$view.classList.add('ModalView');
        this.$view.classList.add(this.baseCSSStyle);
        this.$view.style.display = 'none';

        // Background
        this.$bg = document.createElement('div');
        this.$bg.classList.add('bg');
        this.$bg.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        this.$view.appendChild(this.$bg);

        // Window
        this.$window = document.createElement('div');
        this.$window.classList.add('window');
        this.$window.style.transformOrigin = 'center center';
        this.$window.style.animationFillMode = 'forwards';
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
        this.$footer.classList.add('modalViewFooter');
        this.$window.appendChild(this.$footer);

        // CancelButton (create only if cancelButtonText is provided)
        if (this.cancelButtonText) {
            this.$cancelButton = document.createElement('button');
            this.$cancelButton.classList.add('cancelButton');
            this.$cancelButton.textContent = this.cancelButtonText;
            this.$cancelButton.addEventListener('click', () => this.cancel());
            this.$footer.appendChild(this.$cancelButton);
        }

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

        // Inject styles if not already done
        if (!ModalView.stylesInjected) {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `
            @keyframes modalExpand {
                from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }

            @keyframes modalShrink {
                from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                to { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            }
            `;
            document.head.appendChild(style);
            ModalView.stylesInjected = true;
        }
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
        if(!this.$bg) {
            console.eror(`[ModalView] no bg to set action.`)
        }
        this.$bg.addEventListener('click', (event) => {
            console.log(`[ModalView] bg clicked.`)
            // Ensure the click event originated from the background itself
            if (event.target === this.$bg) {
                this.cancel();
            }
        });
    }

    show() {
        // Show the modal view (e.g., make it visible in the DOM)
        this.$view.style.display = 'block';

        // Reset any previous animations
        this.$window.style.animation = '';

        if (this.showAnimation === AnimationType.EXPAND) {
            this.$window.style.animation = 'modalExpand 0.3s  forwards';
        } else if (this.showAnimation === AnimationType.SHRINK) {
            this.$window.style.animation = 'modalShrink 0.3s reverse forwards';
        } else {
            // No animation
            this.$window.style.animation = '';
        }
    }

    cancel() {
        // Reset any previous animations
        this.$window.style.animation = '';

        if (this.closeAnimation === AnimationType.SHRINK) {
            this.$window.style.animation = 'modalShrink 0.3s forwards';
            this.$window.addEventListener('animationend', () => {
                this.$view.style.display = 'none';
                this.$window.style.animation = '';
            }, { once: true });
        } else if (this.closeAnimation === AnimationType.EXPAND) {
            this.$window.style.animation = 'modalExpand 0.3s reverse forwards';
            this.$window.addEventListener('animationend', () => {
                this.$view.style.display = 'none';
                this.$window.style.animation = '';
            }, { once: true });
        } else {
            this.$view.style.display = 'none';
        }
    }

    close() {
        this.cancel();
    }

    done() {
        this.onDone();
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