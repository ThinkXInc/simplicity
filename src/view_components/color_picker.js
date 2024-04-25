class ColorPicker {
    constructor({
        id,
        defaultColor,
        defaultWidth = 60,
        defaultHeight = 30
    }) {
        this.id = id;
        this._color = defaultColor;
        this.defaultWidth = defaultWidth;
        this.defaultHeight = defaultHeight;

        this.createElements();
        this.addEventHandlers();
    }

    get value() {
        return this._color;
    }

    set value(value) {
        if (typeof value === 'string' || value == null) {
            debuglog(`Set value "${value}" to ${this.id}.color.`)
            this.color = value;
            this.$colorInput.value = value;
            this.$colorDisplay.style.backgroundColor = value;
        } else {
            console.error(`ColorPicker value must be a string or null, but got ${typeof value} : ${value}`);
        }
    }

    get color() { return this._color }

    set color(color) {
        this._color = color;
        this.$colorInput.value = color;
        this.$colorDisplay.style.backgroundColor = color;
    }

    createElements() {
        const $view = document.createElement('div');
        $view.id = this.id;
        $view.classList.add(this.id);
        this.$view = $view;

        // Hidden color input
        const $colorInput = document.createElement('input');
        $colorInput.type = 'color';
        $colorInput.value = this.defaultColor;
        $colorInput.classList.add('input');
        $colorInput.classList.add(`${this.id}Input`);
        this.$colorInput = $colorInput;
        this.$colorInput.style.position = 'absolute';
        this.$colorInput.style.opacity = 0;
        this.$colorInput.style.border = 'none';
        
        // Visible color display
        const $colorDisplay = document.createElement('div');
        $colorDisplay.style.backgroundColor = this._color;
        $colorDisplay.classList.add(`${this.id}Display`);
        $colorDisplay.style.width = `${this.defaultWidth}px`;
        $colorDisplay.style.height = `${this.defaultHeight}px`;
        $colorDisplay.style.cursor = 'pointer';
        this.$colorDisplay = $colorDisplay;

        $view.appendChild($colorInput);
        $view.appendChild($colorDisplay);
    }

    addEventHandlers() {
        const _this = this;

        // When the input value changes, update the display and internal color value
        this.$colorInput.addEventListener('input', (e) => {
            _this.color = e.target.value;
            console.log(`${_this.id} color changed to ${e.target.value}`);
            _this.$view.dispatchEvent(new CustomEvent('colorchanged', { detail: _this.color }));
        });
        
        // When the display is clicked, trigger the hidden input click
        this.$colorDisplay.addEventListener('click', () => {
            _this.$colorInput.click();
        });
    }
}