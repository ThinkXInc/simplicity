const MeshAnimation = {
    perspective: 'perspective'
};

const isDebug = false;

class Mesh {
    /**
     * @param {Object} config
     * @param {string} config.id - The ID for the SVG element
     * @param {number} config.n - Number of horizontal lines
     * @param {number} config.m - Number of vertical lines
     * @param {string} [config.lineColor='#000000'] - Color of the lines
     * @param {number} [config.lineWidth=1] - Line width
     */
    constructor({ id, n, m, lineColor = '#000000', lineWidth = 1 }) {
        this.id = id;
        this.n = n;  // Number of horizontal lines
        this.m = m;  // Number of vertical lines
        this.lineColor = lineColor;
        this.lineWidth = lineWidth;

        // SVG root
        this.svg = null;

        // Store references to lines so we can update them
        this.hLines = [];  // Horizontal line elements
        this.vLines = [];  // Vertical line elements

        // For perspective animation
        this.angle = 0;
        this.animationFrameId = null;
    }

    /**
     * Mounts the SVG into the provided DOM container
     * and draws the initial right-angled grid.
     *
     * @param {HTMLElement} $dom - DOM container to mount the SVG
     */
    mount({ $parent, $insertBefore }) {
        // Create SVG element if not already created
        if (!this.svg) {
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.setAttribute('id', this.id);
    
            // Insert the SVG before $insertBefore if provided, otherwise append to $parent
            if ($insertBefore) {
                $parent.insertBefore(this.svg, $insertBefore);
            } else {
                $parent.appendChild(this.svg);
            }
        }
    
        // Use getBoundingClientRect() to get the dimensions
        //const rect = $parent.getBoundingClientRect();
        //const width = $parent.style.width; //rect.width;
        //const height = $parent.style.height;//rect.height;
        let width = parseFloat($parent.style.width);
        let height = parseFloat($parent.style.height);
        if (isNaN(width) || isNaN(height)) {
            // Use getBoundingClientRect() as a fallback
            const rect = $parent.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
        }

    
        this.width = width;
        this.height = height;
    
        // Set explicit width/height on the SVG
        this.svg.style.position = 'absolute';
        this.svg.style.top = '0px';
        this.svg.style.left = '0px';
        this.svg.setAttribute('width', width);
        this.svg.setAttribute('height', height);
    
        // Draw initial lines (no perspective)
        this.drawMesh();
    }

    /**
     * Creates the initial right-angled grid lines in SVG.
     * At this point, 'angle' is assumed to be 0 => no perspective.
     */
    drawMesh() {
        // Clear any existing lines
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
        this.hLines = [];
        this.vLines = [];

        const width = this.width;
        const height = this.height;

        // Create horizontal lines
        // Spacing from bottom (height) upwards
        const hSpacing = height / (this.n + 1);
        for (let i = 1; i <= this.n; i++) {
            const y = height - i * hSpacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', this.lineColor);
            line.setAttribute('stroke-width', this.lineWidth);
            this.svg.appendChild(line);
            this.hLines.push(line);
        }

        // Create vertical lines
        // Spacing from left to right
        const vSpacing = width / (this.m + 1);
        for (let j = 1; j <= this.m; j++) {
            const x = j * vSpacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            line.setAttribute('stroke', this.lineColor);
            line.setAttribute('stroke-width', this.lineWidth);
            this.svg.appendChild(line);
            this.vLines.push(line);
        }

        // Apply perspective with angle=0 => effectively none
        this.applyPerspectiveToLines(0);
    }

    /**
     * Applies perspective transformations to existing lines
     * by adjusting their positions (horizontal lines)
     * and applying rotation transforms (vertical lines).
     *
     * @param {number} angle - A value in [0..1] controlling perspective intensity
     */
    applyPerspectiveToLines(angle) {
        const width = this.width;
        const height = this.height;
        const cx = width / 2;
        const cy = height / 2;

        // We can adjust how "intense" the perspective is
        // by scaling the angle or using another formula.
        // Here, let's define:
        const perspectiveFactor = angle * 0.5;

        // Update horizontal lines
        // Compress them from the bottom to the center as angle increases
        const maxSpacingH = height / (this.n + 1);
        this.hLines.forEach((line, i) => {
            // i goes from 0..(n-1), but we used 1..n in creation
            const index = i + 1;
            const baseY = height - index * maxSpacingH;
            // new Y with perspective
            const newY = baseY - (baseY - cy) * perspectiveFactor;

            // Update the y1, y2 to shift line up or down
            line.setAttribute('y1', newY);
            line.setAttribute('y2', newY);
        });

        // Update vertical lines
        // Tilt them around the center
        const maxSpacingV = width / (this.m + 1);
        const rotationRange = angle * (Math.PI / 6);  
        // => up to +/- 30° (π/6 rad) at angle=1

        this.vLines.forEach((line, j) => {
            const index = j + 1;
            const baseX = index * maxSpacingV;
            const relPos = (baseX - cx) / cx;  
            // range from ~-1.0..+1.0

            // lineAngle is how much to rotate
            const lineAngle = relPos * rotationRange;
            // Convert to degrees for SVG transform
            const degAngle = (lineAngle * 180) / Math.PI;

            // We want to rotate the entire line around (cx, cy).
            // The default position of the line is X=baseX, so let's do:
            // transform="translate(cx, cy) rotate(degAngle) translate(-cx, -cy)"

            // Apply the transform
            line.setAttribute(
                'transform',
                `translate(${cx}, ${cy}) rotate(${degAngle}) translate(${-cx}, ${-cy})`
            );
        });
    }

    /**
     * Animates the mesh. Currently only supports perspective.
     * @param {Object} options
     * @param {string} options.type
     */
    animate({ type }) {
        if (type === MeshAnimation.perspective) {
            // Cancel any previous animation
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            this.animatePerspective();
        }
    }

    /**
     * Internal method to animate perspective from 0 to 1 and back,
     * giving a smooth oscillation effect. 
     * When the angle hits max or min, it reverses direction.
     * Logs final data once per cycle.
     */
    animatePerspective() {
        const maxAngle = 1;
        const minAngle = 0;
        let speed = 0.01;
        let direction = 1;

        const loop = () => {
            if (this.angle >= maxAngle) {
                direction = -1;
                console.log('[Mesh Info] Reached max angle, reversing direction.');
            }
            if (this.angle <= minAngle) {
                direction = 1;
                console.log('[Mesh Info] Reached min angle, reversing direction.');
            }
            this.angle += direction * speed;

            // Apply perspective
            this.applyPerspectiveToLines(this.angle);

            // Log details when we hit min or max
            if (this.angle <= minAngle || this.angle >= maxAngle) {
                if (isDebug) {this.logDetails();}
            }

            this.animationFrameId = requestAnimationFrame(loop);
        };

        loop();
    }

    /**
     * Logs some basic information about the current mesh state.
     */
    logDetails() {
        console.log('[Detailed Logs]');
        console.log('-----------------------------------------');
        console.log(`  Horizontal lines: ${this.n}`);
        console.log(`  Vertical lines: ${this.m}`);
        console.log(`  Current angle: ${this.angle.toFixed(2)}`);
        console.log('-----------------------------------------');
    }
}