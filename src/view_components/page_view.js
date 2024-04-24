class PageView {
    constructor({ id = 'PageView', numPages = 1 }) {
        console.log(`Initializing ${this.constructor.name} with id=${id}`);

        this.id = id;
        this.numPages = numPages;
        this.currentPageIndex = 0;
        this.pages = new Array(numPages).fill(null).map(() => ({
            elements: [],
            container: null
        }));

        this.createElements();
    }

    createElements() {
        this.$view = document.createElement('div');
        this.$view.id = this.id;
        this.$view.classList.add('PageView')

        this.pages.forEach((page, i) => {
            const $page = document.createElement('div');
            $page.classList.add('PageViewContainer')
            $page.classList.add(`${this.id}_${i}`);
            this.$view.appendChild($page);
            $page.style.display = 'none';
            page.container = $page;
            if (i === this.currentPageIndex) {
                $page.style.display = 'block';
            }
        });
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

    appendChild(element, pageIndex) {
        if (pageIndex >= 0 && pageIndex < this.numPages) {
            const page = this.pages[pageIndex];
            page.elements.push(element);
            page.container.appendChild(element);
        } else {
            console.error(`Invalid page index ${pageIndex}. It must be between 0 and ${this.numPages - 1}.`);
        }
    }

    show(index) {
        if (index >= 0 && index < this.numPages) {
            this.pages.forEach((page, i) => {
                page.container.style.display = i === index ? 'block' : 'none';
            });
            this.currentPageIndex = index;
        } else {
            console.error(`Invalid page index: ${index}`);
        }
    }

    showAll() {
        this.pages.forEach((page, i) => {
            page.container.style.display = 'block';
        });
    }

    next() {
        if (this.currentPageIndex < this.numPages - 1) {
            this.show(this.currentPageIndex + 1);
        }
    }

    prev() {
        if (this.currentPageIndex > 0) {
            this.show(this.currentPageIndex - 1);
        }
    }
}
