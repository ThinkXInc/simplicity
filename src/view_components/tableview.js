class TableViewConfig extends ViewComponentConfig {
    constructor({
        isHeader = false,
        isFooter = false,
        maxDefaultCellNumber = 20,
        addingCellNumber = 20,
        tableViewCellClass = TableViewCell,
        tableViewCellContentClass = TableViewCellContent,
        tableViewCellHiddenClassName = 'hide',
        tableViewCellFadeOutClassName = 'fadeOut',
        tableViewCellFadeOutLeftClassName = 'fadeOutLeft',
        tableViewHiddenClassName = 'hide',
        tableViewCloseAnimationDelay = 0,
        tableViewCloseAnimationType = TableViewCloseAnimationType.fadeOut,
        tableViewCloseAnimationCurve = 'easeInSine', 
        tableViewCellCloseAnimationType = TableViewCellCloseAnimationType.fadeOutLeft,
        tableViewCellCloseAnimationDelay = 10, // Fixed the typo here
        tableViewCellCloseAnimationDuration = 400,
        tableViewInsertCellAnimationType = TableViewInsertCellAnimationType.moveFromLeft,
        tableViewInsertCellAnimationDuration = 20,
        tableViewInsertCellAnimationCurve = 'easeInSine',
        ...otherOptions
    } = {}) {
        super(otherOptions);
        this.isHeader = isHeader;
        this.isFooter = isFooter;
        this.maxDefaultCellNumber = maxDefaultCellNumber;
        this.addingCellNumber = addingCellNumber;
        this.tableViewCellClass = tableViewCellClass;
        this.tableViewCellContentClass = tableViewCellContentClass; // Added this property
        this.tableViewCellHiddenClassName = tableViewCellHiddenClassName;
        this.tableViewCellFadeOutClassName = tableViewCellFadeOutClassName;
        this.tableViewCellFadeOutLeftClassName = tableViewCellFadeOutLeftClassName;
        this.tableViewHiddenClassName = tableViewHiddenClassName;
        this.tableViewCloseAnimationDelay = tableViewCloseAnimationDelay;
        this.tableViewCloseAnimationType = tableViewCloseAnimationType;
        this.tableViewCloseAnimationCurve = tableViewCloseAnimationCurve;
        this.tableViewCellCloseAnimationType = tableViewCellCloseAnimationType;
        this.tableViewCellCloseAnimationDelay = tableViewCellCloseAnimationDelay;
        this.tableViewCellCloseAnimationDuration = tableViewCellCloseAnimationDuration;
        this.tableViewInsertCellAnimationType = tableViewInsertCellAnimationType;
        this.tableViewCellInsertAnimationDuration = tableViewCellCloseAnimationDuration;
        this.tableViewCellCloseAnimationType = tableViewCellCloseAnimationType;
    }
}

const TableViewCellCloseAnimationType = Object.freeze({
    noAnimation: 0,
    fadeOut: 1,
    fadeOutLeft: 2,
});

const TableViewCloseAnimationType = Object.freeze({
    noAnimation: 0,
    fadeOut: 1,
});

const TableViewInsertCellAnimationType = Object.freeze({
    noAnimation: 0,
    fadeIn: 1,
    moveFromLeft: 2,
})


class TableViewCellContent {
    constructor({
        title = '',
        text = '',
        icon = '' 
    } = {}) {
        this.title = title;
        this.text = text;
        this.icon = icon;
    } 
}


/**
 * <li id="{this.id}" class="TableViewCell {this.tableViewId}Cell">
 *   <div class="header">
 *     <span class="label"></span>
 *     <p class="title"></p>
 *   </div>
 *   <div class="body">
 *     <p class="text"></p>
 *   </div>
 *   <div class="footer">
 *   </div>
 * </li>
 */
class TableViewCell {
    constructor(tableView, index, config = new TableViewConfig()) {
        this.tableView = tableView
        this.config = config;
        this.index = index;
        this.__id__ = this.id;

        this._setElements();
    }

    get id() { return `${this.tableView.__id__}Cell_${this.index}`; }

    get className() { return `${this.tableView.__id__}Cell`; }

    set content(content) {
        if (!TableViewCellContent.prototype.isPrototypeOf(this.config.tableViewCellContentClass.prototype)) {
            throw new Error(`tableViewCellContent in ${this.__id__} config is not a subclass of ${TableViewCellContent.name} but ${this.config.tableViewCellContentClass.name}.`);
        }
        if (!this.config.tableViewCellContentClass.prototype.isPrototypeOf(content)) {
            throw Error(`Provided content is not an instance of ${this.config.tableViewCellContentClass.name}.`);
        }

        this._content = content;
    }

    get content() { return this._content; }

    setContent(content) {
        this.content = content;

        this.$title.innerText = content.title;
        this.$text.innerText = content.text;
    }


    _setElements() {
        this.$view = document.createElement('li');
        this.$view.id = this.id;
        this.$view.classList.add('TableViewCell');
        this.$view.classList.add('tableViewCell');
        this.$view.classList.add(this.className);

        // Creating the header element for the cell
        this.$header = document.createElement('div');
        this.$header.classList.add('header');
        this.$label = document.createElement('span');
        this.$label.classList.add('label');
        this.$title = document.createElement('h6');
        this.$title.classList.add('title');
        this.$header.appendChild(this.$label);
        this.$header.appendChild(this.$title);
        this.$view.appendChild(this.$header);

        // Creating the body element for the cell
        this.$body = document.createElement('div');
        this.$body.classList.add('body');
        this.$text = document.createElement('p');
        this.$text.classList.add('text');
        this.$body.appendChild(this.$text);
        this.$view.appendChild(this.$body);

        // Creating the footer element for the cell
        this.$footer = document.createElement('div');
        this.$footer.classList.add('footer');
        this.$view.appendChild(this.$footer);
    }

    add(index = null) {
        if (typeof index !== 'undefined' && this.tableView.$tableListView.children[index]) {
            this.tableView.$tableListView.insertBefore(this.$view, this.tableView.$tableListView.children[index]);
        } else {
            this.tableView.$tableListView.appendChild(this.$view);
        }
    }

    insert(index, delay, onComplete) {
        // TODO: smoothly add padding 
        const computedStyle = getComputedStyle(this.$view);
        const originalPadding = computedStyle.padding;

        this.$view.style.opacity = 0;
        this.$view.style.height = '0px';
        this.$view.style.padding = '0';

        // For 'moveFromLeft' type
        if (this.config.tableViewInsertCellAnimationType === TableViewInsertCellAnimationType.moveFromLeft) {
            this.$view.style.transform = 'translateX(-100%)';
        }

        // Insert the cell into the table view
        this.add(index);

        // Perform the animation
        this.$view.animate([
            { opacity: 1, height: 'auto', transform: 'translateX(0)' } // update with correct properties
        ], {
            duration: this.config.tableViewCellInsertAnimationDuration,
            delay: delay,
            easing: this.config.tableViewCellInsertAnimationCurve,
            fill: 'forwards'
        }).finished.then(() => {
            this.$view.style.padding = originalPadding;
            onComplete();
        });
    }


    fadeOut(delay, onComplete) {
        this.$view.animate([
            { opacity: 0 }
        ], {
            duration: this.config.tableViewCellCloseAnimationDuration,
            delay: delay,
            easing: this.config.tableViewCellCloseAnimationCurve,
            fill: 'forwards'
        }).finished.then(()=> {
            onComplete();
        })
    }

    fadeOutLeft(delay, onComplete) {
        const animation = this.$view.animate([
            {
                opacity: 1,
                transform: 'translateX(0px)'
            },
            {
                opacity: 0,
                transform: 'translateX(-20px)'
            }
        ], {
            duration: this.config.tableViewCellCloseAnimationDuration,
            delay: delay,
            easing: this.config.tableViewCellCloseAnimationCurve,
            iterations: 1,
            fill: 'forwards'
        }).finished.then(()=> {
            onComplete();
        });
    
        animation.onfinish = onComplete; // Call onComplete when the animation is finished.
    }

    hide() {
        this.$view.classList.add(this.config.tableViewCellHiddenClassName);
    }

    show() {
        this.$view.classList.remove(this.config.tableViewCellHiddenClassName);
    }

}

const TableViewState = Object.freeze({
    onLoading: 'onLoading',
    onSelected: 'onSelected',
    onCloseStart: 'onCloseStart',
    onCloseComplete: 'onCloseComplete'
});


/**
 * <div id={id} class="TableView {this.id}">
 *   <div class="tableViewWrapper">
 *     <div class="tableViewHeader">
 *     </div>
 *     <div class="tableViewTable">
 *       <ul class="tableViewTableList">
 *         // cell inserted here
 *       </ul>
 *     </div>
 *     <div class="tableViewFooter">
 *     </div>
 *   </div>
 * </div>
 * 
 */
class TableView {
    constructor(id, config = new TableViewConfig()) {
        this.__id__ = id;
        this.config = config;
        console.error('B')

        this._setElements();

        this.state = null;
        this.selectedIndex = null;
    }

    set contents(contents) {
        this._contents = contents;
        this._resetCells();
        this._setEventHandlers();
        console.log(`${contents.length} cells set to ${this.__id__}.`);
    }

    set state(state) {
        const previousState = this._state;
        this._state = state;
        switch (state) {
            case TableViewState.onLoading:
                console.log(`tableView state changed -> onLoading`);
                break
            case TableViewState.onSelected:
                console.log('tableView state changed -> onSelected');
                break
            case TableViewState.onCloseStart:
                console.log('tableView state changed -> onclosestart');
                break
            case TableViewState.onCloseComplete:
                console.log(`tableView state changed  ${TableViewState[previousState]}-> onclosecomplete`);
        }
    }

    _setElements() {
        // Main container
        this.$view = document.createElement('div');
        this.$view.id = this.__id__;
        this.$view.classList.add('TableView', this.__id__);
        
        // Wrapper
        this.$tableViewContainer = document.createElement('div');
        this.$tableViewContainer.classList.add('tableViewContainer');
        
        // Header
        if (this.config.isHeader) {
            this.$tableViewHeader = document.createElement('div');
            this.$tableViewHeader.classList.add('tableViewHeader');
            this.$tableViewContainer.appendChild(this.$tableViewHeader);
        }
       
        // ListView Wrapper
        this.$tableView = document.createElement('div');
        this.$tableView.classList.add('tableView');
        this.$tableView.id = `${this.__id__}TableView`;
        this.$tableView.classList.add(`${this.__id__}TableView`);
        
        // List
        this.$tableListView = document.createElement('ul');
        this.$tableListView.classList.add('tableListView');
        this.$tableListView.id = `${this.__id__}ListView`;
        this.$tableListView.classList.add(`${this.__id__}ListView`);
        this.$tableView.appendChild(this.$tableListView);
        
        this.$tableViewContainer.appendChild(this.$tableView);

        // Footer
        if (this.config.isFooter) {
            this.$tableViewFooter = document.createElement('div');
            this.$tableViewFooter.classList.add('tableViewFooter');
            this.$tableViewContainer.appendChild(this.$tableViewFooter);
        }
        
        this.$view.appendChild(this.$tableViewContainer);
    }

    appendToElementById(elementId) {
        console.warn(`${this.__id__} is appended to ${elementId}`)
        console.log(this.$view)
        document.getElementById(elementId).appendChild(this.$view)
    }

    insertCell(content, index, delay = 0) {
        // First, check if the provided index is valid, and within range.
        if (index < 0 || (this.cells && index > this.cells.length)) {
            throw new Error(`insertCell(): Invalid index: ${index}`);
        }

        // Add the content to this._contents at the specified index
        this._contents.splice(index, 0, content);

        // After adding content to _contents
        let newCell = new this.config.tableViewCellClass(this, index, this.config);
        newCell.setContent(content);
        newCell.insert(index, delay, () => {
            console.log('Insert animation finished!');
        });

        // Apply the cell insert animation (if needed).
        switch(this.config.tableViewInsertCellAnimationType) {
            case TableViewInsertCellAnimationType.noAnimation:
                // No animation. Just added the cell.
                break;
            case TableViewInsertCellAnimationType.fadeIn:
                // TODO: Implement fade in animation for the cell.
                break;
            case TableViewInsertCellAnimationType.moveFromLeft:
                // TODO: Implement move from left animation for the cell.
                break;
            default:
                throw new Error(`Invalid tableViewInsertCellAnimationType: ${this.config.tableViewInsertCellAnimationType}`);
        }
    
    }

    _resetCells() {
        console.log(`${this.__id__} resetCells:`);

        // Reset tableView
        if (!this.$tableListView) {
            console.error(`${this.__id__}.$tableListView is undefined.`)
        }
        this.$tableListView.innerHTML = '';

        // Check if tableViewCellClass is a subclass of TableViewCellClass
        if (!TableViewCell.prototype.isPrototypeOf(this.config.tableViewCellClass.prototype)) {
            throw new Error(`this.config.tableViewCellClass does not inherit from TableViewCell. but ${this.config.tableViewCellClass}`);
        }
        // Re initialize cells
        this.cells = this._contents.map((content, i) => {
            let cell = new this.config.tableViewCellClass(this, i, this.config);
            cell.setContent(content);
            cell.add();
            return cell;
        });

        console.table(this.cells);

        // Reset event handlers for all cells
        this._setEventHandlers();
    }

    _setEventHandlers() {
        const _this = this;
        this.cells.forEach((cell, index) => {
            console.log(`set event for ${cell.id}`);
            document.getElementById(cell.id).addEventListener('click', e => {
                console.log(`cell ${cell.id} clicked`)
                _this.selectedIndex = cell.index;
                _this.state = TableViewState.onSelected;
            });
            document.getElementById(cell.id).addEventListener('mouseover', e => {
                _this.$view.dispatchEvent(
                    new CustomEvent(
                        'onmouseover', {detail: {cellId: cell.id, index: cell.index}}
                    ));
            });
            document.getElementById(cell.id).addEventListener('mouseout', e => {
                _this.$view.dispatchEvent(
                    new CustomEvent(
                        'onmouseout', {detail: {cellId: cell.id, index: cell.index}}
                    ));
            });
        })
    }

    show() {
        this.$view.classList.remove(this.config.tableViewHiddenClassName);
    }

    hide() {
        this.$view.classList.add(this.config.tableViewHiddenClassName);
    }

    close(maxCellIndexToAnimate=999) {
        // TODO: 
        let previousState = this.state;

        console.log(`${this.__id__} close function called. (previousState ${previousState})`);

        var _this = this;

        // TableViewCell Animation
        this.cells.forEach(cell => {
            if (cell.__index__ > maxCellIndexToAnimate) {
                console.log(`Cell index ${cell.__index__} reached to maxCellIndexToAnimate.`);
                return;  // Skip the cell if its index is greater than the limit
            }

            switch (this.config.closeAnimationType) {
                case TableViewCloseAnimationType.noAnimation:
                    break;
                case TableViewCloseAnimationType.fadeOut:
                    cell.fadeOut(0, () => {
                        console.log(`Cell ${cell.__id__} faded out`);
                    });
                    break;
                case TableViewCloseAnimationType.delayedFadeOut:
                    cell.fadeOut(cell.__index__ * this.config.tableViewCellCloseAimationDelay, () => {
                        console.log(`Cell ${cell.__id__} faded out after delay`);
                    });
                    break;
                default:
                    break;
            }
        });

        // TableView Animation
        switch (this.config.tableViewCloseAnimationType) {
            case TableViewCloseAnimationType.noAnimation:
                this.state = TableViewState.onCloseComplete;
                this.dispatchOnCloseCompleteEvent(previousState);
                break;

            case TableViewCloseAnimationType.fadeOut:
                // Fadeout TableView
                this.fadeOut(this.config.tableViewCloseAnimationDelay, () => {
                    _this.state = TableViewState.onCloseComplete;
                    this.dispatchOnCloseCompleteEvent(previousState);
                });
                break;

            case TableViewCloseAnimationType.delayedFadeOut:
                const numWait = Math.min(this.cells.length, maxCellIndexToAnimate + 1); // +1 because index starts from 0
                const delay = this.config.tableViewCellCloseAimationDelay * numWait;
                // Fadeout TableView
                this.fadeOut(delay, () => {
                    _this.state = TableViewState.onCloseComplete;
                    this.dispatchOnCloseCompleteEvent(previousState);
                });
                break;

            default:
                console.error("Invalid tableViewCloseAnimationType");
                break;
        }
    }

    fadeOut(delay, onComplete) {
        this.$view.animate(
            { opacity: 0 },
            delay,
            this.config.tableViewCloseAnimationCurve
        ).finished.then(()=> {
            onComplete();
        })
    }

    dispatchOnCloseCompleteEvent(previousState) {
        this.$view.dispatchEvent(
            new CustomEvent(
                'onCloseComplete', {
                    detail: {
                        previous: previousState,
                        selected: this.selectedIndex,
        }}));

    }
}
