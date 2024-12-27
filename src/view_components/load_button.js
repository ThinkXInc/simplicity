
class LoadButton {
    constructor({
        id,
        labelText = '',
        loaderSrc = '/img/button-loader.svg',
        onClick,
    }) {
        this.id = id;
        this.labelText = labelText;
        this.loaderSrc = loaderSrc;
        this.createElements();

        this.isDisabled = false;

        this._registerEvents(onClick);
    }

    set isDisabled(isDisabled) {
        this._isDisabled = isDisabled;
    }
    get isDisabled() {return this._isDisabled }

    createElements(){
        const $button = document.createElement('button');
        $button.id = this.id
        $button.classList.add(this.id);
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

    _registerEvents(onClick) {
        if (typeof onClick === 'function') {
            this.$button.addEventListener('click', () => {
                if (this._isDisabled) return;
                onClick(this, this.id);
            });
        }
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

    disable(isDisabled) {
        if (isDisabled) {
            console.log(`LoadButton: ${this.id} disable -> true`)
            this.$button.classList.add('disable');
            this.isDisabled = true;
        } else {
            console.log(`LoadButton: ${this.id} disable -> false`)
            this.$button.classList.remove('disable');
            this.isDisabled = false;
        }
    }
}