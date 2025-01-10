class Draggable {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.element - The DOM element to drag
     * @param {Function} [options.onDrag]   - Called continuously while dragging (signature: ({left, top}) => void)
     * @param {Function} [options.onDragEnd]- Called after mouseup with final position (signature: ({left, top}) => void)
     */
    constructor({ element, onDrag, onDragEnd, initX, initY, ignoreWhenOverSelector }) {
        this.el = element;
        this.initX = initX;
        this.initY = initY;
        this.onDrag = onDrag;
        this.onDragEnd = onDragEnd;
        this.ignoreWhenOverSelector = ignoreWhenOverSelector;

        this.isDragging = false;

        // Store initial positions
        this.elementX = initX;
        this.elementY = initY;

        // Mouse positions
        this.mouseDownX = 0;
        this.mouseDownY = 0;

        // lastLeft, lastTop if you need them
        this.lastLeft = 0;
        this.lastTop  = 0;

        // The Draggable sets absolute positioning
        this.el.style.position = 'absolute';
        if (this.initX != null && this.initY != null) {
            this.el.style.left  = this.initX + 'px';
            this.el.style.top   = this.initY + 'px';
            console.log('[Draggable] Init X:', this.initX);
            console.log('[Draggable] Init Y:', this.initY);
        }
        this.el.style.cursor = 'grab';
        this.el.style.userSelect = 'none';

        // Bind event handlers
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);

        this.onMouseUp   = this.onMouseUp.bind(this);
 
        // Attach events
        this.el.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.onMouseDown(e);
        });
 
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup',   this.onMouseUp);
 
        console.log('[Draggable] Instance created for element:', this.el);
    }

    onMouseDown(e) {
        if (this.ignoreWhenOverSelector) {
            const target = e.target.closest(this.ignoreWhenOverSelector);
            if (target) {
                return; // Do NOT begin dragging
            }
        }

        this.isDragging = true;
        console.log('[Draggable] Mouse down - start dragging');

        // Capture the element’s current offset (if .style.left/.top are not set, parseFloat returns NaN => fallback to 0)
        this.elementX = parseFloat(this.el.style.left) || 0;
        this.elementY = parseFloat(this.el.style.top)  || 0;

        // Capture the mouse’s current location
        this.mouseDownX = e.clientX;
        this.mouseDownY = e.clientY;

        // Change cursor
        this.el.style.cursor = 'grabbing';

        console.log(`    elementX=${this.elementX}, elementY=${this.elementY}`);
        console.log(`    mouseDownX=${this.mouseDownX}, mouseDownY=${this.mouseDownY}`);
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        if (this.ignoreWhenOverSelector) {
            const elUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
            if (elUnderPointer && elUnderPointer.closest(this.ignoreWhenOverSelector)) {
                return; // Temporarily do NOT move while over the ignore-selector
            }
        }
    
        const dx = e.clientX - this.mouseDownX;
        const dy = e.clientY - this.mouseDownY;
    
        const newLeft = this.elementX + dx;
        const newTop  = this.elementY + dy;
    
        // Apply new position to the element
        this.el.style.left = newLeft + 'px';
        this.el.style.top  = newTop  + 'px';
    
        console.log(`[Draggable] Mouse move: left=${newLeft}, top=${newTop}`);

        // Pass both absolute positions and deltas to the callback
        if (typeof this.onDrag === 'function') {
            this.onDrag({
                left:   newLeft,
                top:    newTop,
            });
        }
    }

    onMouseUp(e) {
        if (!this.isDragging) return;

        if (this.ignoreWhenOverSelector) {
            const elUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
            if (elUnderPointer && elUnderPointer.closest(this.ignoreWhenOverSelector)) {
                return; // Temporarily do NOT move while over the ignore-selector
            }
        }

        const dx = e.clientX - this.mouseDownX;
        const dy = e.clientY - this.mouseDownY;
    
        const newLeft = this.elementX + dx;
        const newTop  = this.elementY + dy;
  
 
        this.isDragging = false;
        this.el.style.cursor = 'grab';
        console.log('[Draggable] Mouse up - stop dragging');

        // If an onDragEnd callback was provided, call it with the final position
        if (typeof this.onDragEnd === 'function') {
            this.onDrag({
                left:   newLeft,
                top:    newTop,
            });
        }
    }
}
