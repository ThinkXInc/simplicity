// Define the IndicatorAlignment as a frozen object so it cannot be modified.
const IndicatorAlignment = Object.freeze({ "top": "top", "center": "center" });

/**
 * GradientViewLoaderConfig class.
 * Configuration options for the gradient view loader.
 */
class GradientViewLoaderConfig {
    constructor({
        numIndicator = 4,
        animationDelay = 30,
        alignment = IndicatorAlignment.center,
        initialX1 = -50,
        shiftAmount = -20,
        initialBaseColor = [80, 80, 80],
        indicatorWidth = 100,
        individualHeight = 2,
        spaceBetween = 1,
        rx = 0.5,
        ry = 0.5
    } = {}) {
        this.numIndicator = numIndicator;
        this.animationDelay = animationDelay;
        this.alignment = alignment;
        this.initialX1 = initialX1;
        this.shiftAmount = shiftAmount;
        this.initialBaseColor = initialBaseColor;
        this.indicatorWidth = indicatorWidth;
        this.individualHeight = individualHeight;
        this.spaceBetween = spaceBetween;
        this.rx = rx;
        this.ry = ry;
    }
}

/**
 * // Usage
 * const config = new GradientViewLoaderConfig({
 *   numIndicator: 2,
 *   animationDelay: 20,
 *   alignment: 'top',
 *   initialX1: -50,
 *   shiftAmount: -10,
 *   initialBaseColor: [124, 124, 124]
 * });
 * 
 * const loader = new GradientViewLoader('my-container', 'my-loader', config);
 * loader.startLoading();
 * // loader.stopLoading();
 * 
 */
class GradientViewLoader {
    /**
     * @constructor
     * @param {string} parent_id - Parent container ID
     * @param {string} id - ID for the loader element
     * @param {GradientViewLoaderConfig} config - Configuration object
     */
    constructor(parent_id, id, config) {
        // Initialize instance variables
        this.__parent_id__ = parent_id;
        this.__id__ = id;
        this.config = config;
        this.$view = null;
        this.isLoading = false;

        this.$gradients = [];
        this.$indicators = [];

        this._checkConfig(config);
        this._setElements();
    }

    /**
     * Validates the configuration object.
     * @throws {Error} if the configuration object is invalid
     */
    _checkConfig() {
        // Basic validation checks for config object
        if (!this.config || typeof this.config !== 'object') {
            throw new Error('Invalid configuration object.');
        }

        const requiredProps = [
            'numIndicator',
            'animationDelay',
            'alignment',
            'initialX1',
            'shiftAmount',
            'initialBaseColor',
            'indicatorWidth',
            'individualHeight',
            'spaceBetween',
            'rx',
            'ry'
        ];

        for (const prop of requiredProps) {
            if (!this.config.hasOwnProperty(prop)) {
                throw new Error(`Missing required property: ${prop}`);
            }
        }
    }

    /**
     * Sets up the initial elements required for the loader.
     */
    _setElements() {
        // Create and set the elements
        const $parentView = document.getElementById(this.parent_id);

        // Create main wrapper div
        const $view = document.createElement('div');
        $view.id = this.__id__;
        $view.className = 'GradientViewIndicator';
        this.$view = $view;
    
        // Create container div
        const $container = document.createElement('div');
        $container.className = 'container';
    
        // Create indicator-wrapper div
        const $indicatorWrapper = document.createElement('div');
        $indicatorWrapper.className = 'indicator-wrapper';
    
        // Create SVG
        const $svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        $svg.setAttribute('viewBox', '0 0 100 10');
        this.$svg = $svg;
        // Additional SVG attributes and children can be set here, or they can be set in _setupIndicators()
    
        // Nest elements
        $indicatorWrapper.appendChild($svg);
        $container.appendChild($indicatorWrapper);
        $view.appendChild($container);
    
        // Append to parent
        if ($parentView) {
            $parentView.appendChild($view);
        }
        
        // Set up indicators and start the animation
        this._setupIndicators(this.config);
        this._startAnimation();
    }

    /**
     * Returns the indicatorSVG HTML template as a string.
     * @returns {string} The SVG HTML string
     */
    get indicatorSVG() {
        return `
        <svg class="indicatorSVG" viewBox="0 0 100 10">
            <defs>
              <linearGradient id="animatedGradient" x1="-50%" x2="0%" y1="0%" y2="0%">
                <stop offset="11%" style="stop-color: rgb(124, 124, 124);"></stop>
                <stop offset="19%" style="stop-color: rgb(131, 131, 131);"></stop>
                <stop offset="40%" style="stop-color: rgb(150, 150, 150);"></stop>
                <stop offset="61%" style="stop-color: rgb(164, 164, 164);"></stop>
                <stop offset="61%" style="stop-color: rgb(124, 124, 124);"></stop>
               </linearGradient>
            </defs>
            <!-- Indicators will be inserted here -->
            <!-- <rect class="indicator" x="0" y="0" width="100%" height="100%" fill="url(#animatedGradient)"></rect> -->
        </svg>
        `
    }

    /**
     * Sets up the indicators for the loader.
     * @param {Object} config - Configuration settings for indicators
     */
    _setupIndicators(config) {
        // Calculate total height required
        const { numIndicator, individualHeight, spaceBetween, alignment, initialX1, shiftAmount, initialBaseColor, rx, ry } = this.config;
        const totalHeight = numIndicator * individualHeight + (numIndicator - 1) * spaceBetween;

        // SVG and viewBox setup
        this.$svg.setAttribute('viewBox', `0 0 100 ${totalHeight}`);

        // Calculate the starting y position based on alignment
        let startY = 0;
        if (alignment === IndicatorAlignment.center) {
            startY = (totalHeight - (numIndicator * individualHeight + (numIndicator - 1) * spaceBetween)) / 2;
        } else if (alignment === IndicatorAlignment.top) {
            startY = 0;
        }

        for(let i = 0; i < numIndicator; i++) {
            const gradientId = `animatedGradient${i}`;

            // Create gradient
            const $gradient = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
            $gradient.setAttribute('id', gradientId);
            $gradient.setAttribute('x1', `${initialX1 + i * shiftAmount}%`);
            $gradient.setAttribute('x2', `${i * shiftAmount}%`);
        
            // Add stops to gradient
            const stops = [
                ['11%', initialBaseColor],
                ['19%', initialBaseColor.map(x => x + 7)],
                ['40%', initialBaseColor.map(x => x + 26)],
                ['61%', initialBaseColor.map(x => x + 40)],
                ['61%', initialBaseColor]
            ];
            for (const [offset, color] of stops) {
                const stop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
                stop.setAttribute('offset', offset);
                stop.style.stopColor = `rgb(${color.join(',')})`;
                $gradient.appendChild(stop);
            }

            this.$svg.appendChild($gradient);
            this.$gradients.push($gradient);
            console.error(this.$gradients);

            // Create indicator
            const $indicator = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            $indicator.setAttribute('class', '$indicator');
            $indicator.setAttribute('x', '0');
            $indicator.setAttribute('y', `${startY + i * (individualHeight + spaceBetween)}`);
            $indicator.setAttribute('width', '100%');
            $indicator.setAttribute('height', individualHeight);
            $indicator.setAttribute('rx', rx);
            $indicator.setAttribute('ry', ry);
            $indicator.setAttribute('fill', `url(#${gradientId})`);
            this.$svg.appendChild($indicator);
            this.$indicators.push($indicator);
        }
    }

    /**
     * Starts the animation for the indicators.
     * @param {Object} config - Configuration settings for animation
     */
    _startAnimation(config) {
        // Function to animate x1 and x2
        const { numIndicator, animationDelay, initialX1 } = this.config;
        // Start the animation for each indicator
        for (let i = 0; i < numIndicator; i++) {
           this._animateGradient(animationDelay, i, initialX1, 0);
        }
    }

    /**
     * Animates an individual gradient.
     * @param {number} delay - Delay time for animation
     * @param {number} index - Index of the gradient
     * @param {number} initialX1 - Initial x1 value for the gradient
     * @param {number} initialX2 - Initial x2 value for the gradient
     */
    _animateGradient(delay, index, initialX1, initialX2) {
        const { shiftAmount } = this.config;
        let x1 = initialX1 + index * shiftAmount;
        let x2 = initialX2 + index * shiftAmount;
        let increment = 1;

        const animate = () => {
            x1 += increment;
            x2 += increment;

            if (x1 > 100) {
              x1 = initialX1 + index;
              x2 = initialX2 + index;
            }

            if (this.$gradients[index] == null) {
                console.error(`${this.__id__} must have $gradient ${index}".`)
            }
            this.$gradients[index].setAttribute('x1', `${x1}%`);
            this.$gradients[index].setAttribute('x2', `${x2}%`);
            setTimeout(() => {
              requestAnimationFrame(animate);
            }, delay);
        }
        animate();
    }
  
    /**
     * Initiates the loading process by displaying the loader.
     */
    startLoading() {
        this.$view.style.display = 'block';
        this.isLoading = true;
    }

    /**
     * Stops the loading process by hiding the loader.
     */
    stopLoading() {
        this.$view.style.display = 'none';
        this.isLoading = false;
    }
}

