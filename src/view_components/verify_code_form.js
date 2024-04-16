class VerifyCodeForm {
    constructor({ 
        id,
        errorMessageUnfilled = 'Please enter all 4 digits.',
        inputCompleteEventName = 'verificationInputComplete',
    }) {
        this.id = id;
        this.errorMessageUnfilled = errorMessageUnfilled;
        this.inputCompleteEventName = inputCompleteEventName;
        this.inputs = [];
        this.createElements();
        this.attachEventListeners();
    }

    createElements() {
        const $view = document.createElement('div');
        $view.id = this.id;
        $view.classList.add('VerifyCodeForm');

        const $container = document.createElement('div');
        $container.classList.add('verifyCodeFormContainer');

        for (let i = 0; i < 4; i++) {
            const $input = document.createElement('input');
            $input.type = 'text';
            $input.maxLength = 1;
            $input.classList.add('verifyInput');
            $input.dataset.index = i;
            this.inputs.push($input);
            $container.appendChild($input);
        }

        const $alert = document.createElement('p');
        $alert.classList.add('alert');
        $alert.style.display = 'none';

        $view.appendChild($container);
        $view.appendChild($alert);

        this.$view = $view;
        this.$alert = $alert;
    }

    attachEventListeners() {
        this.inputs.forEach(($input, index) => {
            $input.addEventListener('input', this.handleInput.bind(this, index));
            $input.addEventListener('keydown', this.handleBackspace.bind(this, index));
        });
    }

    handleInput(index, event) {
        if (event.target.value) {
            const nextInput = this.inputs[index + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
        this.checkAllFilled();
    }

    handleBackspace(index, event) {
        if (event.key === 'Backspace' && !this.inputs[index].value) {
            const previousInput = this.inputs[index - 1];
            if (previousInput) {
                previousInput.focus();
            }
        }
    }

    checkAllFilled() {
        if (this.inputs.every(input => input.value)) {
            if (this.validate()) {
                const event = new CustomEvent(this.inputCompleteEventName, { detail: this.value });
                this.$view.dispatchEvent(event);
            } else {
                this.alert(this.validate());
            }
        }
    }

    get value() {
        return this.inputs.map(input => input.value).join('');
    }

    set value(val) {
        const values = val.split('');
        this.inputs.forEach((input, index) => {
            input.value = values[index] || '';
        });
    }

    validate() {
        const value = this.value;
        if (value.length === 4) {
            this.disableAlert();
            return true;
        } else {
            this.alert(this.errorMessageUnfilled);
            return false;
        }
    }

    alert(message) {
        this.$view.classList.add('alert');
        this.$alert.style.display = 'block';
        this.$alert.textContent = message;
    }

    disableAlert() {
        this.$view.classList.remove('alert');
        this.$alert.style.display = 'none';
        this.$alert.textContent = '';
    }
}
