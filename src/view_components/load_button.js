
class LoadButton {
    constructor({
        id,
        labelText = '',
        loaderSrc = '/img/button-loader.svg',
    }) {
        this.id = id;
        this.labelText = labelText;
        this.loaderSrc = loaderSrc;
        this.createElements();
    }

    createElements(){
        const $button = document.createElement('button');
        $button.id = this.id
        $button.classList.add('LoadButton');

        const $label = document.createElement('span');
        $label.classList.add('LoadButtonLabel');
        $label.textContent = this.labelText;

        const $loader = document.createElement('img');
        $loader.src = this.loaderSrc;
        $loader.classList.add('LoadButtonLoader')

        $button.appendChild($label);
        $button.appendChild($loader);

        this.$view = $button;
        this.$button = $button;
    }

    load(isLoading) {
        if (isLoading){
            console.log(`LoadButton: ${this.id} load -> true`)
            this.$button.classList.add('load');
        } else {
            console.log(`LoadButton: ${this.id} load -> false`)
            this.$button.classList.remove('load');
        }
    }
}