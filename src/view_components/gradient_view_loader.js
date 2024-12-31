// Define the IndicatorAlignment as a frozen object so it cannot be modified.
const IndicatorAlignment = Object.freeze({ "top": "top", "center": "center" });

/**
 * // Usage
 * const loader = new GradientViewLoader({
 *      id: 'my-container',
 *      numIndicator: 2,
 *      animationDelay: 20,
 *      alignment: 'top',
 *      initialX1: -50,
 *      shiftAmount: -10,
 *      initialBaseColor: [124, 124, 124]
 * });
 * loader.startLoading();
 * // loader.stopLoading();
 * 
 */
class GradientViewLoader {
    /**
     * @constructor
     * @param {string} id - ID for the loader element
     * @param {Object} config - Configuration object with default values
     */
    constructor({
        id,
        numIndicator = 4,
        animationDelay = 30,
        alignment = IndicatorAlignment.center,
        initialX1 = -50,
        defaultShift = 0,
        shiftAmount = -20,
        initialBaseColor = [80, 80, 80],
        indicatorWidth = 100,
        individualHeight = 2,
        spaceBetween = 1,
        rx = 0.5,
        ry = 0.5
    }) {
        this.id = id;
        this.numIndicator = numIndicator;
        this.animationDelay = animationDelay;
        this.alignment = alignment;
        this.initialX1 = initialX1;
        this.defaultShift = defaultShift;
        this.shiftAmount = shiftAmount;
        this.initialBaseColor = initialBaseColor;
        this.indicatorWidth = indicatorWidth;
        this.individualHeight = individualHeight;
        this.spaceBetween = spaceBetween;
        this.rx = rx;
        this.ry = ry;

        this.$view = null;
        this.isLoading = false;
        this.$gradients = [];
        this.$indicators = [];

        this.createElements();
    }

    createElements() {
        const $view = document.createElement('div');
        $view.id = this.id;
        $view.classList.add('gradientViewIndicator');
        $view.classList.add(this.id);
        this.$view = $view;

        const $container = document.createElement('div');
        $container.className = 'indicator-container';

        const $indicatorWrapper = document.createElement('div');
        $indicatorWrapper.className = 'indicator-wrapper';
        $indicatorWrapper.style.minWidth = `${this.indicatorWidth}px`;

        const $svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        $svg.setAttribute('viewBox', '0 0 100 10');
        this.$svg = $svg;

        $indicatorWrapper.appendChild($svg);
        $container.appendChild($indicatorWrapper);
        $view.appendChild($container);

        this.setupIndicators();
        this.startAnimation();
    }

    startLoading() {
        this.$view.style.display = 'block';
        this.isLoading = true;
    }

    stopLoading() {
        this.$view.style.display = 'none';
        this.isLoading = false;
    }

    mount($parent) {
        // Check if $parent is null or not an instance of HTMLElement
        if (!$parent || !($parent instanceof HTMLElement)) {
            console.error(`[GradintViewLoader ERROR] Could not find a parent element with id=${parentId} or the element is not a valid HTML element.`);
            return;
        }
    
        // Check if this.$view is valid
        if (!this.$view || !(this.$view instanceof HTMLElement)) {
            console.error(`[GradintViewLoader ERROR] this.$view is not a valid HTMLElement.`);
            return;
        }
        $parent.appendChild(this.$view);
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

    setupIndicators() {
        const totalHeight = this.numIndicator * this.individualHeight + (this.numIndicator - 1) * this.spaceBetween;

        // SVG and viewBox setup
        this.$svg.setAttribute('viewBox', `0 0 100 ${totalHeight}`);

        // Calculate the starting y position based on alignment
        let startY = 0;
        if (this.alignment === IndicatorAlignment.center) {
            startY = (totalHeight - (this.numIndicator * this.individualHeight + (this.numIndicator - 1) * this.spaceBetween)) / 2;
        } else if (this.alignment === IndicatorAlignment.top) {
            startY = 0;
        }

        for(let i = 0; i < this.numIndicator; i++) {
            const gradientId = `${this.id}__animatedGradient${i}`;

            // Create gradient
            const $gradient = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
            $gradient.setAttribute('id', gradientId);
            $gradient.setAttribute('x1', `${this.initialX1 + i * this.shiftAmount}%`);
            $gradient.setAttribute('x2', `${i * this.shiftAmount}%`);
        
            // Add stops to gradient
            const stops = [
                ['11%', this.initialBaseColor],
                ['19%', this.initialBaseColor.map(x => x + 7)],
                ['40%', this.initialBaseColor.map(x => x + 26)],
                ['61%', this.initialBaseColor.map(x => x + 40)],
                ['61%', this.initialBaseColor]
            ];
            for (const [offset, color] of stops) {
                const stop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
                stop.setAttribute('offset', offset);
                stop.style.stopColor = `rgb(${color.join(',')})`;
                $gradient.appendChild(stop);
            }

            this.$svg.appendChild($gradient);
            this.$gradients.push($gradient);

            // Create indicator
            const $indicator = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            $indicator.setAttribute('class', '$indicator');
            $indicator.setAttribute('x', '0');
            $indicator.setAttribute('y', `${startY + i * (this.individualHeight + this.spaceBetween)}`);
            $indicator.setAttribute('width', '100%');
            $indicator.setAttribute('height', this.individualHeight);
            $indicator.setAttribute('rx', this.rx);
            $indicator.setAttribute('ry', this.ry);
            $indicator.setAttribute('fill', `url(#${gradientId})`);
            this.$svg.appendChild($indicator);
            this.$indicators.push($indicator);
        }
    }

    startAnimation() {
        for (let i = 0; i < this.numIndicator; i++) {
           this.animateGradient(this.animationDelay, i, this.initialX1, 0, this.defaultShift);
        }
    }

    /**
     * Animates an individual gradient.
     * @param {number} delay - Delay time for animation
     * @param {number} index - Index of the gradient
     * @param {number} initialX1 - Initial x1 value for the gradient
     * @param {number} initialX2 - Initial x2 value for the gradient
     */
    animateGradient(delay, index, initialX1, initialX2, defaultShift) {
        console.log(`Check initial params - initialX1: ${initialX1}, initialX2: ${initialX2}, defaultShift: ${defaultShift}`);

        let x1 = defaultShift + initialX1 + index * this.shiftAmount;
        let x2 = defaultShift + initialX2 + index * this.shiftAmount;
        let increment = 1;

        console.log(`Initial values - Index: ${index}, X1: ${x1}, X2: ${x2}, Delay: ${delay}`);

        const animate = () => {
            x1 += increment;
            x2 += increment;

            //console.log(`Updated values - Index: ${index}, X1: ${x1}, X2: ${x2}`);

            if (x1 > 100) {
              x1 = initialX1 + index;
              x2 = initialX2 + index;
              //console.log(`Reset values - Index: ${index}, X1: ${x1}, X2: ${x2}`);

            }
            if (this.$gradients[index] == null) {
                console.error(`${this.id} must have $gradient ${index}".`)
            }
            this.$gradients[index].setAttribute('x1', `${x1}%`);
            this.$gradients[index].setAttribute('x2', `${x2}%`);
            setTimeout(() => {
              requestAnimationFrame(animate);
            }, delay);
        }
        animate();
    }

}

