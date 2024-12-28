class ScreenLock {
    static LOCK_CLASS = 'screen-locked';
    static STYLE_ID = 'screen-lock-style';

    /**
     * lock(true)  => locks the screen
     * lock(false) => unlocks the screen
     */
    static lock(shouldLock = true) {
        console.log('ScreenLock: lock() called with shouldLock:', shouldLock);

        // Ensure the CSS is present in the <head>
        this._ensureStyles();

        if (shouldLock) {
            document.body.classList.add(this.LOCK_CLASS);
            console.log('ScreenLock: Body locked. Overflow hidden, pointer-events blocked.');
        } else {
            document.body.classList.remove(this.LOCK_CLASS);
            console.log('ScreenLock: Body unlocked. Restoring interactions.');
        }
    }

    /**
     * Injects the <style> for screen lock if it doesn’t exist yet
     */
    static _ensureStyles() {
        console.log('ScreenLock: _ensureStyles() - checking for existing style block...');

        // If the style block is already present, skip creating a new one
        if (document.getElementById(this.STYLE_ID)) {
            console.log('ScreenLock: Style block already present. Skipping injection.');
            return;
        }

        console.log('ScreenLock: Injecting style block for .screen-locked overlay...');
        const styleEl = document.createElement('style');
        styleEl.id = this.STYLE_ID;
        styleEl.type = 'text/css';

        // All CSS is self-contained here
        styleEl.textContent = `
.${this.LOCK_CLASS} {
    overflow: hidden;
    position: relative;
    cursor: wait;
}
.${this.LOCK_CLASS}::after {
    content: "";
    position: fixed; /* covers the entire viewport */
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.2);
    z-index: 99999;
    pointer-events: auto; /* blocks mouse clicks */
}
        `.trim();

        document.head.appendChild(styleEl);
        console.log('ScreenLock: Style block appended to <head>.');
    }
}

// Example usage:
// ScreenLock.lock(true);  // Lock the entire screen
// ScreenLock.lock(false); // Unlock the screen
