class RadioButtonItem {
    constructor({
        name,
        value
    }) {
        this.name = name;
        this.value = value;
    }
}

class RadioButton {
    constructor({
        id,
        fieldName,
        items,
        defaultValue,
        hasTitle = true,
        title = "",
        isItemLabelPlacedAtLeft = false,
        isTitlePlacedAtInputLeft = false,
        defaultCheckBoxWidth = 20,
        defaultCheckBoxHeight = 20,
    }) {
        this.id = id;
        this.fieldName = fieldName;
        this.items = items;
        this.defaultValue = defaultValue;
        this._value = defaultValue;

        this.hasTitle = hasTitle;
        this.title = title;
        this.isTitlePlacedAtInputLeft = isTitlePlacedAtInputLeft;
        this.isItemLabelPlacedAtLeft = isItemLabelPlacedAtLeft;

        this.createElements();

        this.addEventHandlers();
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        if (newValue !== this._value) {
            this._value = newValue;
            this.$view.dispatchEvent(new CustomEvent("valuechanged", { detail: { newValue : this._value} }));
        }
    }

    createElements(){
        this.$view = document.createElement('div');
        this.$view.id = this.id;
        this.$view.classList.add(this.id);
        this.$view.classList.add("spl-RadioButton");

        const $inputOuter = document.createElement('div');
        $inputOuter.className = 'spl-inputOuter';
        this.$inputOuter = $inputOuter;

        const $inputWrapper = document.createElement('div');
        $inputWrapper.className = 'spl-inputWrapper';
        this.$inputWrapper = $inputWrapper;
 
        const $inputAfter = document.createElement('div');
        $inputAfter.className = 'spl-inputAfter';
        this.$inputAfter = $inputAfter;

        const $title = document.createElement('h6');
        $title.classList.add('spl-title');
        $title.textContent = this.title;

        if (this.isTitlePlacedAtInputLeft) {
            $inputWrapper.appendChild($title);
        } else {
            $inputOuter.appendChild($title);
        }
 
        this.items.forEach((item) => {
            const $item = document.createElement('div');
            $item.classList.add('spl-item');
            $item.classList.add(item.value);
            $item.style.cursor = 'pointer';

            const inputId = `${this.id}_${item.value}`;
            const $input = document.createElement('input');
            $input.type = "radio";
            $input.classList.add(inputId);
            $input.id = inputId;
            $input.value = item.value;
            $input.name = this.fieldName;
            $input.style.position = 'absolute';
            $input.style.opacity = 0;
            $input.style.border = 'none';
            if (this.defaultValue == item.value) {
                $input.checked = true;
                $item.classList.add('spl-checked')
            }

            const $checkBox = document.createElement('span');
            $checkBox.classList.add('spl-checkbox');
            $checkBox.classList.add(`checkbox_${item.value}`)
            $checkBox.style.display = 'block';
            $checkBox.style.width = `${this.defaultCheckBoxWidth}px`;
            $checkBox.style.height = `${this.defaultCheckBoxHeight}px`;

            const $label = document.createElement('label');
            $label.htmlFor = inputId;
            $label.textContent = item.name;

            if (this.isItemLabelPlacedAtLeft) {
                $item.appendChild($input);
                $item.appendChild($label);
                $item.appendChild($checkBox);
            } else {
                $item.appendChild($input);
                $item.appendChild($checkBox);
                $item.appendChild($label);
            }

            $inputWrapper.appendChild($item);
        })

        const $footer = document.createElement('div');
        $footer.className = 'spl-footer';
        this.$footer = $footer;

        this.$inputWrapper.appendChild($inputAfter);
        this.$inputOuter.appendChild($inputWrapper);
        this.$inputOuter.appendChild($footer);
        this.$view.appendChild($inputOuter);
    }

    addEventHandlers() {
        this.items.forEach((item) => {
            const inputId = `${this.id}_${item.value}`;
            const $item = this.$view.querySelector(`.${item.value}`);
            const $input = this.$view.querySelector(`#${inputId}`);

            $item.addEventListener('click', (e) => {
                this.items.forEach((otherItem) => {
                    const $otherItem = this.$view.querySelector(`.${otherItem.value}`)
                    const otherInputId = `${this.id}_${otherItem.value}`;
                    const $otherInput = this.$view.querySelector(`#${otherInputId}`);

                    $otherInput.checked = false;
                    $otherItem.classList.remove('spl-checked');
                });

                $input.checked = true;
                $item.classList.add('spl-checked');

                this.value = item.value;
            });
        });

    }

    alert(message) {
        const existingAlert = this.$footer.querySelector('.spl-alertMessage');
        if (existingAlert) {
            this.$footer.removeChild(existingAlert);
            this.$view.classList.remove('spl-alert');
        }

        if (message) {
            this.$view.classList.add('spl-alert');
            const newAlertMessage = document.createElement('p');
            newAlertMessage.classList.add('spl-alertMessage');
            newAlertMessage.textContent = message;
            this.$footer.appendChild(newAlertMessage);
        }
    }
}