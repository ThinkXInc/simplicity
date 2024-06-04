class TermsScrollView {
    constructor({ id, templateUrl }) {
        this.id = id;
        this.templateURL = templateUrl;
        this.createElements();
        this.addEventHandlers();
        this.loadTemplate();
    }

    createElements() {
        this.$view = document.createElement('div');
        this.$view.id = this.id;
        this.$view.classList.add("TermsScrollView");
        this.$view.classList.add(this.id);

        const $container = document.createElement('div');
        $container.classList.add('termsViewContainer')
        const $termsView = document.createElement('div');
        $termsView.classList.add('termsView');
        $container.appendChild($termsView);
        this.$view.appendChild($container);  // Make sure to append the container to the main element
        this.$container = $container;
        this.$termsView = $termsView;
    }

    addEventHandlers() {
        console.log('Adding scroll event handler to:', this.$termsView);
        this.$container.addEventListener('scroll', () => {
            console.log('Scroll event detected');
            const isScrolledToBottom = this.$container.scrollHeight - this.$container.scrollTop <= this.$container.clientHeight;
            console.log('Is scrolled to bottom:', isScrolledToBottom);
    
            if (isScrolledToBottom) {
                console.log('Scrolled to bottom!');
                this.$view.dispatchEvent(new CustomEvent('reachedBottom'));
            }
        });
    }

    loadTemplate() {
        fetch(this.templateURL)
            .then(response => {return response.text()})  // Convert the response to text
            .then(html => {
                const termsContent = '<div id="terms"' + html.split('<div id="terms"')[1].split('<div class="footer')[0]
                this.$termsView.innerHTML = '<div id="terms"' + termsContent;  // Insert the HTML into the element
            })
            .catch(error => console.error('Error loading the terms template:', error));
    }
}