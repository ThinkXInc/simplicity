// Optional helper so you can do: pattern: LoadingMessagePattern.A
const LoadingMessagePattern = {
    A: 'A',
    B: 'B',
};

// Named gradients
const LoadingMessageGradient = {
    gray:      { start: '#aaaaaa', end: '#fafafa' },
    ocean:     { start: '#30688d', end: '#01BFD8' },
    bluegreen: { start: '#00ff00', end: '#0000ff' },
    alert:     { start: '#8c1111', end: '#8c1111' }, // just in case you want a 2-stop "red" gradient
};

class LoadingMessage {
    constructor({
        id,
        classList,
        gradientStart = '#aaaaaa',   // default color A
        gradientEnd   = '#fafafa',   // default color B
        alertColor    = '#8c1111',   // default alert color
        minimumWaitTimeMs = 500,
        pattern = LoadingMessagePattern.B,  // default = Pattern B (5-stop)
    }) {
        this.id = id;
        this.classList = classList;
        this.gradientStart = gradientStart;  
        this.gradientEnd   = gradientEnd;
        this.alertColor    = alertColor;
        this.minimumWaitTimeMs = minimumWaitTimeMs;
        
        // Which pattern to use (A or B)
        this.pattern = pattern;

        // Active layer (0 or 1)
        this._activeIndex = 0;
        // Track when current text was displayed
        this._lastDisplayedAt = Date.now();
        // Queue of text calls
        this._queue = [];
        this._isProcessing = false;

        // Create the CSS + DOM
        this.injectDynamicStyle();
        this.createView();

        // Initialize the container’s CSS vars
        this._updateGradientVars(this.gradientStart, this.gradientEnd);
    }

    /**
     * Inject <style> with either the 3-stop ping-pong (Pattern A)
     * or the 5-stop loop (Pattern B).
     */
    injectDynamicStyle() {
        const styleEl = document.createElement('style');
        styleEl.type = 'text/css';

        // We build different CSS depending on the chosen pattern
        let keyframesCss = '';
        let gradientCss  = '';

        if (this.pattern === LoadingMessagePattern.A) {
            // Pattern A:
            // A "3-stop" gradient: A → B → A
            // Keyframe from 0%→100%→0% (ping-pong)
            // so it goes left→right→left continuously
            keyframesCss = `
                @keyframes ${this.id}-gradient-animation {
                    0%   { background-position: 0% 30%; }
                    50%  { background-position: 100% 30%; }
                    100% { background-position: 0% 30%; }
                }
            `;
            gradientCss = `
                #${this.id}.loading .fadeLayer.active {
                    background-image: linear-gradient(
                        to right,
                        var(--lm-grad-start, #aaaaaa),
                        var(--lm-grad-end,   #fafafa),
                        var(--lm-grad-start, #aaaaaa)
                    );
                    background-size: 300% 100%;
                    background-position: 0% 50%;
                    animation: ${this.id}-gradient-animation 3s ease-in-out infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `;
        } else {
            // Pattern B:
            // A "5-stop" gradient: A→B→A→B→A
            // Keyframe from 0%→100% left→right, loops seamlessly
            keyframesCss = `
                @keyframes ${this.id}-gradient-animation {
                    0% {
                        background-position: 0% 50%;
                    }
                    100% {
                        background-position: 100% 50%;
                    }
                }
            `;
            gradientCss = `
                #${this.id}.loading .fadeLayer.active {
                    background-image: linear-gradient(
                        to right,
                        var(--lm-grad-start, #aaaaaa) 0%,
                        var(--lm-grad-end,   #fafafa) 30%,
                        var(--lm-grad-start, #aaaaaa) 40%,
                        var(--lm-grad-end,   #fafafa) 80%,
                        var(--lm-grad-start, #aaaaaa) 100%
                    );
                    background-size: 200% 100%;
                    background-position: 0% 50%;
                    animation: ${this.id}-gradient-animation 3s linear infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `;
        }

        styleEl.textContent = `
            ${keyframesCss}

            ${gradientCss}

            #${this.id} .fadeLayer {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                transition: opacity 0.3s ease;
                opacity: 0;
                white-space: pre-wrap;
            }

            #${this.id} .fadeLayer.active {
                opacity: 1;
            }

            #${this.id} {
                position: relative;
                min-height: 1em;
            }
        `;

        document.head.appendChild(styleEl);
    }

    createView() {
        this.$view = document.createElement('div');
        this.$view.id = this.id;
        this.$view.classList.add('LoadingMessage');

        if (this.classList) {
            const clsArr = this.classList.split(/\s+/);
            clsArr.forEach(cls => this.$view.classList.add(cls));
        }

        // Two layers for crossfade
        this.$layerA = document.createElement('div');
        this.$layerB = document.createElement('div');
        this.$layerA.classList.add('fadeLayer');
        this.$layerB.classList.add('fadeLayer');
        this.$layerA.style.width = 'max-content';
        this.$layerA.style.position = 'initial';
        this.$layerB.style.width = 'max-content';
        this.$layerB.style.position = 'initial';

        // layerA is active initially
        this.$layerA.classList.add('active');

        this.$view.appendChild(this.$layerA);
        this.$view.appendChild(this.$layerB);
    }

    /**
     * setText(...) - queue a new text with options for gradient, alert, loading, etc.
     * 
     * Usage examples:
     *    setText('Now playing...', { gradient: LoadingMessageGradient.gray });
     *    setText('Now playing...', { gradientStart: '#fff', gradientEnd: '#000' });
     *    setText('Error', { alert: true });
     *    setText('Loading stuff', { loading: true, gradient: LoadingMessageGradient.ocean });
     */
    setText(text, options = {}) {
        // Destructure your optional fields
        const {
            gradient,        // e.g. {start: '#aaaaaa', end: '#fafafa'}
            gradientStart, 
            gradientEnd,
            alert = false,
        } = options;

        // Determine the final gradient colors for this text
        // 1) If we have a named gradient, start with that
        let finalStart = gradient ? gradient.start : this.gradientStart;
        let finalEnd   = gradient ? gradient.end   : this.gradientEnd;

        // 2) If the caller provided explicit gradientStart/End, override
        if (gradientStart) finalStart = gradientStart;
        if (gradientEnd)   finalEnd   = gradientEnd;

        // Push it into our queue
        this._queue.push({
            newText: text,
            alert,
            gradientStart: finalStart,
            gradientEnd: finalEnd,
        });

        // If we are not processing anything, kick things off
        if (!this._isProcessing) {
            this._processQueue();
        }
    }

    stop() {
        // 1) Stop queue processing
        this._isProcessing = false;
        // 2) Clear any pending messages
        this._queue = [];
    
        // 3) Fade out the currently active layer
        const activeLayer = (this._activeIndex === 0) ? this.$layerA : this.$layerB;
        activeLayer.classList.remove('active');
    
        // Ensure container is not in loading state
        this.load(false);
    
        // 4) After the transition is done (~300ms), clear out text and styling
        setTimeout(() => {
            activeLayer.textContent = '';
            activeLayer.style.color = '';
            activeLayer.classList.remove('error');
    
            // Also clear out the inactive layer, just in case
            const inactiveLayer = (this._activeIndex === 0) ? this.$layerB : this.$layerA;
            inactiveLayer.textContent = '';
            inactiveLayer.style.color = '';
            inactiveLayer.classList.remove('error');
        }, 300);
    }

    _processQueue() {
        if (this._queue.length === 0) {
            this._isProcessing = false;
            return;
        }
        this._isProcessing = true;

        const {
            newText,
            alert,
            gradientStart,
            gradientEnd,
        } = this._queue.shift();

        const now = Date.now();
        const timeSinceLast = now - this._lastDisplayedAt;
        const waitRemaining = Math.max(0, this.minimumWaitTimeMs - timeSinceLast);

        setTimeout(() => {
            this._fadeOutOld(() => {
                this._fadeInNew(
                    newText,
                    alert,
                    gradientStart,
                    gradientEnd,
                    () => {
                        this._lastDisplayedAt = Date.now();
                        this._processQueue();
                    }
                );
            });
        }, waitRemaining);
    }

    _fadeOutOld(onDone) {
        const oldLayer = (this._activeIndex === 0) ? this.$layerA : this.$layerB;
        oldLayer.classList.remove('active');
        setTimeout(() => {
            if (onDone) onDone();
        }, 300);
    }

    _fadeInNew(newText, alert, gradientStart, gradientEnd, onDone) {
        this.load(true);
        
        // Clear error from both
        this.$layerA.style.color = '';
        this.$layerB.style.color = '';
        this.$layerA.classList.remove('error');
        this.$layerB.classList.remove('error');

        // Update the gradient for this message
        this._updateGradientVars(gradientStart, gradientEnd);

        // The inactive layer
        const newLayer = (this._activeIndex === 0) ? this.$layerB : this.$layerA;
        newLayer.textContent = newText;

        if (alert) {
            newLayer.style.color = this.alertColor;
            newLayer.classList.add('error');
        }

        newLayer.classList.add('active');
        this._activeIndex = (this._activeIndex === 0) ? 1 : 0;

        setTimeout(() => {
            if (onDone) onDone();
        }, 300);
    }

    load(isLoading) {
        // Add or remove .loading => triggers the gradient on the active layer
        if (isLoading) {
            this.$view.classList.add('loading');
        } else {
            this.$view.classList.remove('loading');
        }
    }

    /**
     * Update container’s CSS vars so the gradient picks them up
     */
    _updateGradientVars(startColor, endColor) {
        this.$view.style.setProperty('--lm-grad-start', startColor);
        this.$view.style.setProperty('--lm-grad-end', endColor);
    }

    setError(isError) {
        const activeLayer = (this._activeIndex === 0) ? this.$layerA : this.$layerB;
        if (isError) {
            activeLayer.style.color = this.alertColor;
            activeLayer.classList.add('error');
        } else {
            activeLayer.style.color = '';
            activeLayer.classList.remove('error');
        }
    }
}
