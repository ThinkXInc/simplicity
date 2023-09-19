class TableViewConfig extends ViewComponentConfig {
    constructor({
        protocols = [TableViewProtocol],
        isHeader = false,
        isFooter = false,
        loadingType = TableViewLoadingType.gradientViewLoader,
        loaderImage = '/img/load-of-the-ring@2x.png',  // TODO: use SvgIcon class
        loaderSize = '24px',
        gradientViewLoaderConfig = {
            numIndicator: 3,
            individualHeight: 7,
            spaceBetween: 10,
            animationDelay: 10,
            defaultShift: 10,
            shiftAmount: -20,
            rx: 2,
            ry: 2,
        },
        maxDefaultCellNumber = 20,
        addingCellNumber = 20,
        cellClass = TableViewCell,
        cellContentClass = TableViewCellContent,
        cellSelectedClassName = 'selected',
        cellHiddenClassName = 'hide',
        cellFadeOutClassName = 'fadeOut',
        cellFadeOutLeftClassName = 'fadeOutLeft',
        hiddenClassName = 'hide',
        closeAnimationDelay = 0,
        closeAnimationType = TableViewCloseAnimationType.fadeOut,
        closeAnimationCurve = 'easeInSine', 
        cellCloseAnimationType = TableViewCellCloseAnimationType.fadeOutLeft,
        cellCloseAnimationDelay = 10,
        cellCloseAnimationDuration = 400,
        insertCellAnimationType = TableViewInsertCellAnimationType.moveFromLeft,
        insertCellAnimationDuration = 20,
        insertCellAnimationCurve = 'easeInSine',
        insertCellAnimationHiddenClassNameMoveFromLeft = 'hiddenForMoveFromLeft',
        insertCellAnimationHiddenClassNameFadeIn = 'hiddenForFadeIn',
        buttonContainerPosition = TableViewCellButtonContainerPosition.Right,
        deleteCellActionType = TableViewDeleteCellActionType.dispatchDeleteCellEvent,
        deleteCellAnimationType = TableViewDeleteCellAnimationType.fadeOut,
        deleteCellEventName = 'deleteCell',
        deleteCellAnimationDuration = 10,
        deleteCellAnimationDelay = 0,
        deleteCellAnimationCurve = 'easeInSine',
        deleteCellAnimationClassNameMoveToLeft = 'deleteByMoveToLeft',
        deleteCellAnimationClassNameFadeOut = 'deleteByFadeOut',
        ...otherOptions
    } = {}) {
        super(otherOptions);
        this.protocols = protocols;
        this.isHeader = isHeader;
        this.isFooter = isFooter;
        this.loadingType = loadingType;
        this.loaderImage = loaderImage;
        this.gradientViewLoaderConfig = gradientViewLoaderConfig;
        this.maxDefaultCellNumber = maxDefaultCellNumber;
        this.addingCellNumber = addingCellNumber;
        this.cellClass = cellClass;
        this.cellContentClass = cellContentClass; // Corrected the variable name
        this.cellSelectedClassName = cellSelectedClassName;
        this.cellHiddenClassName = cellHiddenClassName;
        this.cellFadeOutClassName = cellFadeOutClassName;
        this.cellFadeOutLeftClassName = cellFadeOutLeftClassName;
        this.hiddenClassName = hiddenClassName;
        this.closeAnimationDelay = closeAnimationDelay;
        this.closeAnimationType = closeAnimationType;
        this.closeAnimationCurve = closeAnimationCurve;
        this.cellCloseAnimationType = cellCloseAnimationType;
        this.cellCloseAnimationDelay = cellCloseAnimationDelay;
        this.cellCloseAnimationDuration = cellCloseAnimationDuration;
        this.insertCellAnimationType = insertCellAnimationType;
        this.insertCellAnimationDuration = insertCellAnimationDuration;
        this.insertCellAnimationCurve = insertCellAnimationCurve;
        this.insertCellAnimationHiddenClassNameFadeIn = insertCellAnimationHiddenClassNameFadeIn;
        this.insertCellAnimationHiddenClassNameMoveFromLeft = insertCellAnimationHiddenClassNameMoveFromLeft;
        this.buttonContainerPosition = buttonContainerPosition;
        this.deleteCellActionType = deleteCellActionType;
        this.deleteCellAnimationType = deleteCellAnimationType;
        this.deleteCellEventName = deleteCellEventName;
        this.deleteCellAnimationDuration = deleteCellAnimationDuration;
        this.deleteCellAnimationCurve = deleteCellAnimationCurve;
        this.deleteCellAnimationClassNameMoveToLeft = deleteCellAnimationClassNameMoveToLeft;
        this.deleteCellAnimationClassNameFadeOut = deleteCellAnimationClassNameFadeOut;
    }
}

const TableViewLoadingType = Object.freeze({
    gradientViewLoader: 'gradientViewLoader',
    circleLoader: 'circleLoader',
})

const TableViewCellButtonContainerPosition = Object.freeze({
    Left: 'Left',
    Right: 'Right'
});

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

const TableViewDeleteCellActionType = Object.freeze({
    deleteImmidiately: 1,
    dispatchDeleteCellEvent: 2,
})

const TableViewDeleteCellAnimationType = Object.freeze({
    noAnimation: 0,
    fadeOut: 1,
    moveToLeft: 2,
})

class TableViewCellContent {
    constructor({
        //id = '',  NOTE: this overrides id. not permitted.
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
        //if (!TableViewCellContent.prototype.isPrototypeOf(this.config.cellContentClass.prototype)) {
        //    throw new Error(`tableViewCellContent in ${this.__id__} config is not a subclass of ${TableViewCellContent.name} but ${this.config.cellContentClass.name}.`);
        //}
        if (!this.config.cellContentClass.prototype.isPrototypeOf(content)) {
            throw Error(`Provided content is not an instance of ${this.config.cellContentClass.name}.`);
        }

        this._content = content;
    }

    get content() { return this._content; }

    set title(title) {
        this._title = title;
        this.$title.textContent = title;
    }

    get title() { this._title; }

    set text(value) {
        this._text = value;
        this.$text.textContent = value;
    }

    get text() { this._text; }

    setContent(content) {
        this.content = content;

        this.title = content.title;
        this.text = content.text;
    }

    _setElements() {
        this.$view = document.createElement('li');
        this.$view.id = this.id;
        this.$view.classList.add('TableViewCell', 'tableViewCell', this.className);
    
        this.$contentWrapper = document.createElement('div');
        this.$contentWrapper.classList.add('contentWrapper');
    
        // Creating the header element for the cell
        this.$header = document.createElement('div');
        this.$header.classList.add('header');
        this.$label = document.createElement('span');
        this.$label.classList.add('label');
        this.$title = document.createElement('h6');
        this.$title.classList.add('title');
        this.$header.appendChild(this.$label);
        this.$header.appendChild(this.$title);
        this.$contentWrapper.appendChild(this.$header);
    
        // Creating the body element for the cell
        this.$body = document.createElement('div');
        this.$body.classList.add('body');
        this.$text = document.createElement('p');
        this.$text.classList.add('text');
        this.$body.appendChild(this.$text);
        this.$contentWrapper.appendChild(this.$body);
    
        // Creating the footer element for the cell
        this.$footer = document.createElement('div');
        this.$footer.classList.add('footer');
        this.$contentWrapper.appendChild(this.$footer);
    
        // Adding interaction buttons container
        this.$buttonContainer = document.createElement('div');
        this.$buttonContainer.classList.add('buttonContainer');
        // Add the delete button
        this.$deleteButton = document.createElement('button');
        this.$deleteButton.innerHTML = SVGIcons.deleteIconSVG; 
        this.$deleteButton.addEventListener('click', this._onDeleteClick.bind(this));
        this.$buttonContainer.appendChild(this.$deleteButton);

        this.$view.appendChild(this.$contentWrapper);
        this.$view.appendChild(this.$buttonContainer);

        this._setButtonContainerPosition();
        this.toggleButtonInteractionMode(false);
    }

    _setButtonContainerPosition() {
        if (this.config.buttonContainerPosition === TableViewCellButtonContainerPosition.Left) {
          this.$buttonContainer.style.order = "1";
        } else {
          this.$buttonContainer.style.order = "0";
        }
    }

    /**
     * Handler for delete button click
     */
    _onDeleteClick(e) {
        // Stop event propagation
        e.stopPropagation();

        // Trigger deletion logic here
        debuglog(`Delete button clicked for cell with ID: ${this.__id__}, index: ${this.index}`);

        // switch action by config.deleteCellAtionType
        switch (this.config.deleteCellActionType) {
            case TableViewDeleteCellActionType.dispatchDeleteCellEvent:
                // Dispatch event
                this.tableView.$view.dispatchEvent(new CustomEvent(this.config.deleteCellEventName, { detail: { index: this.index, cell: this } }));
                break;
            case TableViewDeleteCellActionType.deleteImmediately:
                // Delete immediately
                this.tableView.deleteRowAtIndex(this.index);
                break;
        }
 
    }
    
    // Method to toggle button interaction mode
    toggleButtonInteractionMode(enable) {
        if (enable) {
            this.$buttonContainer.style.display = 'flex';
        } else {
            this.$buttonContainer.style.display = 'none';
        }
    }

    add(index = null) {
        if (typeof index !== 'undefined' && this.tableView.$tableListView.children[index]) {
            this.tableView.$tableListView.insertBefore(this.$view, this.tableView.$tableListView.children[index]);
        } else {
            this.tableView.$tableListView.appendChild(this.$view);
        }
    }

    insert(index, delay, onComplete) {

        // Insert the cell into the table view
        this.add(index);

        // Function to handle the end of the transition
        const handleTransitionEnd = (event) => {
            // NOTE: when delay is 0, this line is sometimes not called
            debuglog('>>>>>>>>>>>>>> Transition COMPLETE');
            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }
            // Removing the event listener to avoid it being called multiple times
            this.$view.removeEventListener('transitionend', handleTransitionEnd);
        };
    
        this.$view.addEventListener('transitionend', handleTransitionEnd);
    
        // Insert animation
        switch (this.config.insertCellAnimationType) {
            case TableViewInsertCellAnimationType.fadeIn:
                this.$view.classLists.add(this.config.insertCellAnimationHiddenClassNameFadeIn)
                console.log("Starting fadeIn transition");
                setTimeout(() => {
                    this.$view.classList.remove(this.config.insertCellAnimationHiddenClassNameFadeIn); // Smoothly slides the new item into view
                }, delay); // Tiny delay to ensure it's added to the DOM before the transition starts
                break;
            case TableViewInsertCellAnimationType.moveFromLeft:
                this.$view.classList.add(this.config.insertCellAnimationHiddenClassNameMoveFromLeft)
                console.log("Starting moveFromLeft transition");
                setTimeout(() => {
                    this.$view.classList.remove(this.config.insertCellAnimationHiddenClassNameMoveFromLeft); // Smoothly slides the new item into view
                }, delay); // Tiny delay to ensure it's added to the DOM before the transition starts
                break;
        }
    }

    delete(animationType, delay, onComplete) {
        const handleTransitionEnd = (event) => {
            // Removing the cell after the transition
            this.$view.remove();
    
            // Callback once the transition is complete
            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }
    
            // Removing the event listener to avoid it being called multiple times
            this.$view.removeEventListener('transitionend', handleTransitionEnd);
        };
    
        this.$view.addEventListener('transitionend', handleTransitionEnd);
    
        switch(animationType) {
            case TableViewDeleteCellAnimationType.noAnimation:
                // No animation. Just remove the cell.
                this.$view.remove();
                this.$view.removeEventListener('transitionend', handleTransitionEnd); // No transition, so remove the listener.
                if (onComplete && typeof onComplete === 'function') {
                    onComplete();
                }
                break;
                
            case TableViewDeleteCellAnimationType.fadeOut:
                setTimeout(() => {
                    this.$view.classList.add(this.config.deleteCellAnimationClassNameFadeOut);
                }, delay); // Tiny delay to ensure it's added to the DOM before the transition starts
                break;
    
            case TableViewDeleteCellAnimationType.moveToLeft:
                setTimeout(() => {
                    this.$view.classList.add(this.config.deleteCellAnimationClassNameMoveToLeft);
                }, delay); // Tiny delay to ensure it's added to the DOM before the transition starts
                break;
    
            default:
                throw new Error(`Invalid tableViewDeleteCellAnimationType: ${animationType}`);
        }
    }

    fadeOut(delay, onComplete) {
        this.$view.animate([
            { opacity: 0 }
        ], {
            duration: this.config.cellCloseAnimationDuration,
            delay: delay,
            easing: this.config.cellCloseAnimationCurve,
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
            duration: this.config.cellCloseAnimationDuration,
            delay: delay,
            easing: this.config.cellCloseAnimationCurve,
            iterations: 1,
            fill: 'forwards'
        }).finished.then(()=> {
            onComplete();
        });
    
        animation.onfinish = onComplete; // Call onComplete when the animation is finished.
    }

    hide() {
        this.$view.classList.add(this.config.cellHiddenClassName);
    }

    show() {
        this.$view.classList.remove(this.config.cellHiddenClassName);
    }

}

const TableViewState = Object.freeze({
    onLoading: 'onLoading',
    onSelected: 'onSelected',
    onCloseStart: 'onCloseStart',
    onCloseComplete: 'onCloseComplete'
});

/**
 * A protocol class for TableView components.
 * This class defines the interface that AlertMessage components should implement.
 */
class TableViewProtocol {
    tableViewCellSelectedAtIndex(selectedIndex, cell) {
        console.log(`${this.__id__}: cell ID:${cell.id} Index:${selectedIndex} clicked`)
        throw new Error('You have to implement this tableViewCellSeletedAtIndex method to the child class!!');
    }
}

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
class TableView extends ViewComponentBase {
    constructor(id, config = new TableViewConfig()) {
        super('', id, config);

        this.__id__ = id;
        this.config = config;

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

        // Loader
        switch (this.config.loadingType) {
            // Circle Loader
            case TableViewLoadingType.circleLoader:
                this.$loader = document.createElement('img');
                this.$loader.classList.add('loader');
                this.$loader.src = this.config.loaderImage;
                this.$loader.style.position = 'absolute';
                this.$loader.style.top = '50%';
                this.$loader.style.left = '50%';
                this.$loader.style.width = this.config.loaderSize;
                this.$loader.style.height = this.config.loaderSize;
                this.$loader.style.transform = 'translate(-50%, -50%)'; // Center the loader
                this.$loader.style.display = 'none';  // Initially hidden
                this.$tableView.appendChild(this.$loader);
                break;
            // Gradient Loader
            case TableViewLoadingType.gradientViewLoader:
                const loaderConfig = this.config.gradientViewLoaderConfig;
                const gradientLoaderConfig = new GradientViewLoaderConfig();
                
                // Assign the properties from the configuration to the gradient loader config.
                for (const key in loaderConfig) {
                    gradientLoaderConfig[key] = loaderConfig[key];
                }

                const loader = new GradientViewLoader(null, 'TableViewGradientLoader', gradientLoaderConfig);
                this.loader = loader;
                this.$loader = loader.$view;
                this.$tableView.appendChild(loader.$view);
                break;
        }
    }

    appendToElementById(elementId) {
        document.getElementById(elementId).appendChild(this.$view)
    }

    insertCell(content, index, delay = 0, onComplete) {
        // First, check if the provided index is valid, and within range.
        if (index < 0 || (this.cells && index > this.cells.length)) {
            throw new Error(`insertCell(): Invalid index: ${index}`);
        }

        // Add the content to this._contents at the specified index
        this._contents.splice(index, 0, content);

        // After adding content to _contents
        let newCell = new this.config.cellClass(this, index, this.config);
        newCell.setContent(content);
        newCell.insert(index, delay, () => {
            console.log('Insert animation finished!');
            onComplete(newCell);
        });
    }

    deleteRowAtIndex(index, onComplete = null) {
        if (index < 0 || index >= this.cells.length) {
            console.error(`Invalid index: ${index}. Cannot delete cell.`);
            return;
        }
    
        const cell = this.cells[index];
        const delay = this.config.deleteCellAnimationDelay;
    
        cell.delete(this.config.deleteCellAnimationType, delay, () => {
            console.log('Delete animation finished!');
            onComplete && onComplete(cell);
        });
    
        // Remove the cell from the cells array and from the contents array
        this.cells.splice(index, 1);
        this._contents.splice(index, 1);
    
        // Update the index of each cell that follows the removed cell
        for (let i = index; i < this.cells.length; i++) {
            this.cells[i].index = i;
        }
    
        console.log(`Cell at index ${index} has been removed.`);
    }

    toggleButtonInteractionModeAtIndex(index, enable) {
        this.cells.forEach((cell) => {
            cell.toggleButtonInteractionMode(!enable);
        });
        this.cells[index].toggleButtonInteractionMode(enable);
    }

    _resetCells() {
        console.log(`${this.__id__} resetCells:`);

        // Reset tableView
        if (!this.$tableListView) {
            console.error(`${this.__id__}.$tableListView is undefined.`)
        }
        this.$tableListView.innerHTML = '';

        //// Check if tableViewCellClass is a subclass of TableViewCellClass
        //if (!TableViewCell.prototype.isPrototypeOf(this.config.cellClass.prototype)) {
        //    throw new Error(`this.config.cellClass does not inherit from TableViewCell. but ${this.config.cellClass}`);
        //}
        // Re initialize cells
        this.cells = this._contents.map((content, i) => {
            let cell = new this.config.cellClass(this, i, this.config);
            cell.setContent(content);
            cell.add();
            return cell;
        });

        console.table(this.cells);
    }

    _setEventHandlers() {
        const _this = this;
        this.cells.forEach((cell, index) => {
            debuglog(`set event for ${cell.id}`);
            cell.$view.addEventListener('click', e => {
                _this.selectedIndex = cell.index;
                _this.state = TableViewState.onSelected;
                _this.tableViewCellSelectedAtIndex(cell.index, cell);
                this.cells.forEach((cell) => {
                    cell.$view.classList.remove(this.config.cellSelectedClassName);
                })
                cell.$view.classList.add(this.config.cellSelectedClassName)
            });
            cell.$view.addEventListener('mouseover', e => {
                _this.$view.dispatchEvent(
                    new CustomEvent(
                        'onmouseover', {detail: {cellId: cell.id, index: cell.index}}
                    ));
            });
            cell.$view.addEventListener('mouseout', e => {
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

    loading(isLoading) {
        if(isLoading) {
            switch (this.config.loadingType) {
                // Circle Loader
                case TableViewLoadingType.circleLoader:
                    this.$tableListView.style.display = 'none';  // Hide the table
                    this.$loader.style.display = 'block';       // Show the loader
                    break;
                // Gradient Loader
                case TableViewLoadingType.gradientViewLoader:
                    this.$tableListView.style.display = 'none';  // Hide the table
                    this.$loader.style.display = 'block';
                    break;
            }
        } else {
            switch (this.config.loadingType) {
                // Circle Loader
                case TableViewLoadingType.circleLoader:
                    this.$tableListView.style.display = 'block'; // Show the table
                    this.$loader.style.display = 'none';        // Hide the loader
                    break;
                // Gradient Loader
                case TableViewLoadingType.gradientViewLoader:
                    this.$tableListView.style.display = 'block'; // Show the table
                    this.$loader.style.display = 'none';
                    break;
            }
        }
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
                    cell.fadeOut(cell.__index__ * this.config.cellCloseAimationDelay, () => {
                        console.log(`Cell ${cell.__id__} faded out after delay`);
                    });
                    break;
                default:
                    break;
            }
        });

        // TableView Animation
        switch (this.config.closeAnimationType) {
            case TableViewCloseAnimationType.noAnimation:
                this.state = TableViewState.onCloseComplete;
                this.dispatchOnCloseCompleteEvent(previousState);
                break;

            case TableViewCloseAnimationType.fadeOut:
                // Fadeout TableView
                this.fadeOut(this.config.closeAnimationDelay, () => {
                    _this.state = TableViewState.onCloseComplete;
                    this.dispatchOnCloseCompleteEvent(previousState);
                });
                break;

            case TableViewCloseAnimationType.delayedFadeOut:
                const numWait = Math.min(this.cells.length, maxCellIndexToAnimate + 1); // +1 because index starts from 0
                const delay = this.config.cellCloseAimationDelay * numWait;
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
            this.config.closeAnimationCurve
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
