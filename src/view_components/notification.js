/*
Usage:

    const notification = new Notification({
        id: 'unique-notification-id',
        position: NotificationPosition.topCenter
    });

    notification.mount('#app');

    notification.show({
        message: "API Request Successful!",
        type: NotificationType.success,
        animationType: NotificationAnimationType.fadeInFromTop,
        duration: NotificationDuration.short
    });

*/
const NotificationPosition = Object.freeze({
    topCenter: 'spl-top-center',
    bottomRight: 'spl-bottom-right'
});

const NotificationType = Object.freeze({
    info: 'spl-info',
    success: 'spl-success',
    warning: 'spl-warning',
    error: 'spl-error'
});

const NotificationDuration = Object.freeze({
    short: 1000,
    forever: null
});

const NotificationAnimationType = Object.freeze({
    fadeInFromTop: 'spl-fade-in-from-top',  // FIXME: not work properly
    fadeIn: 'spl-fade-in',
    fadeOut: 'spl-fade-out'
});

class Notification {
    constructor({ id, position = NotificationPosition.topCenter }) {
        console.log('[Notification] Creating notification instance');
        this.id = id;
        this.position = position;
        this.createElement();
        this.setEventHandlers();
    }

    createElement() {
        console.log('[Notification] Creating element');
        this.$view = document.createElement('div');
        this.$view.id = this.id;
        this.$view.classList.add('spl-Notification', this.position);

        this.$message = document.createElement('p');
        this.$message.classList.add('spl-NotificationMessage');
        this.$view.appendChild(this.$message);
    }

    mount(selectorOrElement) {
        console.log('[Notification] Mounting');
        let container;

        if (typeof selectorOrElement === 'string') {
            container = document.querySelector(selectorOrElement);
            if (!container) {
                console.error('[Notification] No element found with selector ' + selectorOrElement);
                return;
            }
        } else if (selectorOrElement instanceof Element) {
            container = selectorOrElement;
        } else {
            console.error('[Notification] Invalid input: selector must be a string or a DOM element');
            return;
        }

        container.appendChild(this.$view);
        console.log('[Notification] Mounted successfully to ' + (typeof selectorOrElement === 'string' ? selectorOrElement : selectorOrElement.tagName));
    }

    show({ message, type = NotificationType.info, animationType = NotificationAnimationType.fadeIn, duration = NotificationDuration.short }) {
        console.log('[Notification] Showing notification of type ' + type);
        this.$message.textContent = message;
        this.$view.classList.add(type, animationType, 'spl-show');

        if (duration !== NotificationDuration.forever) {
            setTimeout(() => {
                this.hide();
            }, duration);
            console.log('[Notification] Will auto-hide after ' + duration + ' milliseconds');
        }
    }

    hide() {
        console.log('[Notification] Hiding notification');
        this.$view.classList.add(NotificationAnimationType.fadeOut);
        setTimeout(() => {
            this.$view.classList.remove('spl-show');
            console.log('[Notification] Notification removed from DOM');
        }, 500); // Assume fade-out animation takes 500ms
    }

    setEventHandlers() {
        this.$view.addEventListener('click', () => {
            console.log('[Notification] Notification clicked');
            this.hide();
        });
    }
}
