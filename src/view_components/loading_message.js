// Optional helper so you can do: pattern: LoadingMessagePattern.A
const LoadingMessagePattern = {
    A: 'A',
    B: 'B',
};

// Named gradients
const LoadingMessageGradient = {
    gray:      { start: '#aaaaaa', end: '#fafafa' },
    gray2:      { start: '#888', end: '#aaa' },
    ocean:     { start: '#30688d', end: '#01BFD8' },
    bluegreen: { start: '#00ff00', end: '#0000ff' },
    alert:     { start: '#8c1111', end: '#8c1111' },
};

// Text align options
const LoadingMessageTextAlign = {
    left:   'left',
    center: 'center',
    right:  'right'
};

class LoadingMessage {
    constructor({
        id,
        classList,
        gradientStart = '#aaaaaa',   // default color A
        gradientEnd   = '#fafafa',   // default color B
        alertColor    = '#8c1111',   // default alert color
        minimumWaitTimeMs = 0,
        defatulFadeOutAfterMs = 500,
        pattern = LoadingMessagePattern.B,  // default = Pattern B (5-stop)
        textAlign = LoadingMessageTextAlign.center // default alignment = center
    }) {
        this.id = id;
        this.classList = classList;
        this.gradientStart = gradientStart;  
        this.gradientEnd   = gradientEnd;
        this.alertColor    = alertColor;
        this.minimumWaitTimeMs = minimumWaitTimeMs;
        this.defatulFadeOutAfterMs = defatulFadeOutAfterMs;

        // Pattern (A or B)
        this.pattern = pattern;

        // Text alignment
        this.textAlign = textAlign;

        // Active layer (0 or 1)
        this._activeIndex = 0;
        // Track when current text was displayed
        this._lastDisplayedAt = Date.now();
        // Queue of text calls
        this._queue = [];
        this._isProcessing = false;

        // We'll store a single callback that should be run after the entire queue is done.
        this._onQueueComplete = null;

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

        let keyframesCss = '';
        let gradientCss  = '';

        if (this.pattern === LoadingMessagePattern.A) {
            // Pattern A (3-stop)
            keyframesCss = `
                @keyframes ${this.id}-gradient-animation {
                    0%   { background-position: 0% 30%; }
                    50%  { background-position: 100% 30%; }
                    100% { background-position: 0% 30%; }
                }
            `;
            gradientCss = `
                #${this.id}.spl-loading .spl-fadeLayer.spl-active {
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
            // Pattern B (5-stop)
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
                #${this.id}.spl-loading .spl-fadeLayer.spl-active {
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

            #${this.id} .spl-fadeLayer {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                transition: opacity 0.3s ease;
                opacity: 0;
                white-space: pre-wrap;
            }

            #${this.id} .spl-fadeLayer.spl-active {
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
        // Use the user-provided textAlign
        this.$view.style.width = '100%';
        this.$view.style.textAlign = this.textAlign;
        this.$view.classList.add('spl-LoadingMessage');

        if (this.classList) {
            const clsArr = this.classList.split(/\s+/);
            clsArr.forEach(cls => this.$view.classList.add(cls));
        }

        // Two layers for crossfade
        this.$layerA = document.createElement('div');
        this.$layerB = document.createElement('div');
        this.$layerA.classList.add('spl-fadeLayer');
        this.$layerB.classList.add('spl-fadeLayer');
        this.$layerA.style.position = 'absolute';
        this.$layerA.style.width = '100%';
        this.$layerB.style.position = 'absolute';
        this.$layerB.style.width = '100%';

        // layerA is active initially
        this.$layerA.classList.add('spl-active');

        this.$view.appendChild(this.$layerA);
        this.$view.appendChild(this.$layerB);
    }

    /**
     * setText(...) - queue a new text with options for gradient, alert, loading, etc.
     *
     * Pass a callback if you want to be notified *after the ENTIRE queue* has finished:
     *    setText('Hello World', { loading: true }, () => {
     *       console.log('Queue is done!');
     *    });
     */
    setText(text, options = {}, onQueueComplete = null) {
        console.warn(`[LoadingMessage]`, text)
        const {
            gradient,        // e.g. {start: '#aaaaaa', end: '#fafafa'}
            gradientStart, 
            gradientEnd,
            alert = false,
            // NOTE: removing default from destructuring so we can manually handle it
            fadeOutAfterMs 
        } = options;

        // Determine final gradient colors for this text
        let finalStart = gradient ? gradient.start : this.gradientStart;
        let finalEnd   = gradient ? gradient.end   : this.gradientEnd;

        if (gradientStart) finalStart = gradientStart;
        if (gradientEnd)   finalEnd   = gradientEnd;

        // Decide on the final fadeOutAfterMs
        // If alert = true AND user did NOT explicitly pass fadeOutAfterMs,
        // then do NOT fade out. Otherwise, default fade out in 1s.
        let finalFadeOutAfterMs;
        if (options.hasOwnProperty('fadeOutAfterMs')) {
            // User explicitly provided fadeOutAfterMs (could be 0, 1000, etc.)
            finalFadeOutAfterMs = fadeOutAfterMs;
        } else {
            // fadeOutAfterMs not explicitly set by user
            if (alert) {
                // For an alert message, do NOT fade out automatically
                finalFadeOutAfterMs = null;
            } else {
                // Normal message fades out after 1s
                finalFadeOutAfterMs = this.defatulFadeOutAfterMs;
            }
        }

        // If user passed a callback, store it. (Only keep the most recent callback.)
        if (onQueueComplete) {
            this._onQueueComplete = onQueueComplete;
        }

        // Push it into our queue
        this._queue.push({
            newText: text,
            alert,
            gradientStart: finalStart,
            gradientEnd: finalEnd,
            fadeOutAfterMs: finalFadeOutAfterMs
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
        activeLayer.classList.remove('spl-active');
    
        // Ensure container is not in loading state
        this.load(false);
    
        // 4) After the transition is done (~300ms), clear out text and styling
        setTimeout(() => {
            activeLayer.textContent = '';
            activeLayer.style.color = '';
            activeLayer.classList.remove('spl-error');
    
            // Also clear out the inactive layer, just in case
            const inactiveLayer = (this._activeIndex === 0) ? this.$layerB : this.$layerA;
            inactiveLayer.textContent = '';
            inactiveLayer.style.color = '';
            inactiveLayer.classList.remove('spl-error');
        }, 300);
    }

    _processQueue() {
        // If queue is empty, we are done
        if (this._queue.length === 0) {
            this._isProcessing = false;

            // Call the user’s callback if available
            if (this._onQueueComplete) {
                this._onQueueComplete();
                this._onQueueComplete = null;
            }
            return;
        }
        this._isProcessing = true;

        const {
            newText,
            alert,
            gradientStart,
            gradientEnd,
            fadeOutAfterMs
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
                    fadeOutAfterMs,
                    () => {
                        this._lastDisplayedAt = Date.now();
                        // Process the *next* item
                        this._processQueue();
                    }
                );
            });
        }, waitRemaining);
    }

    _fadeOutOld(onDone) {
        const oldLayer = (this._activeIndex === 0) ? this.$layerA : this.$layerB;
        oldLayer.classList.remove('spl-active');
        setTimeout(() => {
            if (onDone) onDone();
        }, 0);
    }

    _fadeInNew(newText, alert, gradientStart, gradientEnd, fadeOutAfterMs, onDone) {
        this.load(true);
        
        // Clear error from both layers
        this.$layerA.style.color = '';
        this.$layerB.style.color = '';
        this.$layerA.classList.remove('spl-error');
        this.$layerB.classList.remove('spl-error');

        // Choose the inactive layer
        const newLayer = (this._activeIndex === 0) ? this.$layerB : this.$layerA;
        newLayer.textContent = newText;

        // Update the gradient for this message
        if (alert) {
            this._updateGradientVars(this.alertColor, this.alertColor);
            newLayer.classList.add('spl-error');
        } else {
            this._updateGradientVars(gradientStart, gradientEnd);
        }


        newLayer.classList.add('spl-active');
        this._activeIndex = (this._activeIndex === 0) ? 1 : 0;

        // Fade-out logic — only if fadeOutAfterMs is non-null
        if (fadeOutAfterMs != null) {
            setTimeout(() => {
                // Only fade out if the text is still the same
                if (newLayer.textContent === newText) {
                    newLayer.classList.remove('spl-active');
                    // Wait for the fade-out transition (~300ms)
                    setTimeout(() => {
                        // Clear the text & remove error styles
                        if (newLayer.textContent === newText) {
                            newLayer.textContent = '';
                            newLayer.style.color = '';
                            newLayer.classList.remove('spl-error');
                        }
                    }, 300);
                }
            }, fadeOutAfterMs);
        }

        setTimeout(() => {
            if (onDone) onDone();
        }, 300);
    }

    load(isLoading) {
        if (isLoading) {
            this.$view.classList.add('spl-loading');
        } else {
            this.$view.classList.remove('spl-loading');
        }
    }

    _updateGradientVars(startColor, endColor) {
        this.$view.style.setProperty('--lm-grad-start', startColor);
        this.$view.style.setProperty('--lm-grad-end', endColor);
    }

    setError(isError) {
        const activeLayer = (this._activeIndex === 0) ? this.$layerA : this.$layerB;
        if (isError) {
            activeLayer.style.color = this.alertColor;
            activeLayer.classList.add('spl-error');
        } else {
            activeLayer.style.color = '';
            activeLayer.classList.remove('spl-error');
        }
    }
}
