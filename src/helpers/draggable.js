class Draggable {
    constructor({ element }) {
      this.el = element;
      this.isDragging = false;
  
      // We track the element’s position in “elementX” & “elementY”
      this.elementX = 0;  
      this.elementY = 0;  
      // We'll store the mouse-down coords in “mouseDownX” & “mouseDownY”
      this.mouseDownX = 0;
      this.mouseDownY = 0;
  
      // Minimal inline styles for dragging
      this.el.style.position = 'absolute';
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
      this.isDragging = true;
      console.log('[Draggable] Mouse down - start dragging');
  
      // 1) Capture the element’s current offset (from .style.left/.top)
      //    If they are not set, parseFloat() returns NaN, so use “|| 0” fallback.
      this.elementX = parseFloat(this.el.style.left) || 0;
      this.elementY = parseFloat(this.el.style.top)  || 0;
  
      // 2) Capture the mouse’s current location
      this.mouseDownX = e.clientX;
      this.mouseDownY = e.clientY;
  
      // Change cursor
      this.el.style.cursor = 'grabbing';
  
      console.log(`   elementX=${this.elementX}, elementY=${this.elementY}`);
      console.log(`   mouseDownX=${this.mouseDownX}, mouseDownY=${this.mouseDownY}`);
    }
  
    onMouseMove(e) {
      if (!this.isDragging) return;
  
      // Calculate how far the mouse has moved since the initial mousedown
      const dx = e.clientX - this.mouseDownX;
      const dy = e.clientY - this.mouseDownY;
  
      // Update position: original offset + mouse delta
      const newLeft = this.elementX + dx;
      const newTop  = this.elementY + dy;
  
      // Apply new position
      this.el.style.left = newLeft + 'px';
      this.el.style.top  = newTop  + 'px';
  
      console.log(`[Draggable] Mouse move: left=${newLeft}, top=${newTop}`);
    }
  
    onMouseUp(e) {
      if (!this.isDragging) return;
  
      this.isDragging = false;
      this.el.style.cursor = 'grab';
      console.log('[Draggable] Mouse up - stop dragging');
    }
  }
  