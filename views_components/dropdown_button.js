'use strict'
/**
 * @fileoverview business/view_components/dropdown_button.js
 * Dropdown button component class.
 * 
 * usage:
 * <code>
 * </code>
 * 
 * @author kaz@thinkxinc.com (Kazuki Otsuka)
 */

const DropdownButtonState = Object.freeze({ onclose: 1, onopen: 2, onselected: 3 });
const DropdownMenuType = Object.freeze({ list: 1, widelist: 2, calendar: 3 });
const DropdownMenuDisplayPositionType = Object.freeze({ bottom: 1, bottomover: 2, upper: 3, upperover: 4 });

/**
 * Dropdown list Data Model.
 */
class ListMenu {
    title = null;
    value = null; // value of enum
    constructor(title, value) {
        this.title = title;
        this.value = value;
        if (this.title == null || this.value == null) {
            console.error('both title and value of ListMenu are necessary but null.')
        }
    }
}


/**
 * Dropdownbutton component class.
 * @constructor
 * @classdesc `<div class=dropdownButton id={id}></ul>` is necessary in HTML.
 * usage:
 * `<code>`
 * 
 *     <div class="dropdownButton">
 *         <div class="dropdownButtonClickable cf">
 *             <h6 class="description">Description here</h6>
 *             <span class="title">Title here</span>
 *             <img class="downarrow" src="/img/icons/arrow-down.png" srcset="/img/icons/arrow-down@2x.png 2x" />
 *             <div class="footer cf"></div>
 *         </div>
 *         <ul class="listmenu">
 *             <li class="listitem" data-value="item1" data-title="Item 1">Item 1</li>
 *             <li class="listitem" data-value="item2" data-title="Item 2">Item 2</li>
 *             <!-- More list items go here -->
 *         </ul>
 *     </div>
 * 
 * 
 *     // Creating list menu items
 *     let listMenuItems = [
 *         {title: 'Afganistan', value: 12},
 *         {title: 'Belarus', value: 73},
 *         {title: 'China', value: 981},
 *         // More list items go here...
 *     ];
 *     
 *     // Defining a validator
 *     let validator = new Validator(
 *         dropdownButton, 
 *         ValidationErrorType.required, 
 *         "This field is required."
 *     );
 *     
 *     let dropdownButton = new DropdownButton(
 *         'parent_id_here', // parent_id
 *         'countrySelectButton', // id
 *         'Your Country', // title
 *         'Please select your country.', // description
 *         'country', // field_name
 *         DropdownMenuType.list, // type
 *         DropdownMenuDisplayPositionType.upper, // position
 *         listMenuItems, // listMenuItems
 *         'div', // htmlTag (optional)
 *         [validator] // validators (optional)
 *     );
 *     
 *     // Set the initial state
 *     dropdownButton.state = DropdownButtonState.onclose;
* 
 * `</code>`
 * @param {string} id - The DOM id where this view is inserted.
 * @param {string} title - displayed title.
 * @param {string} desctiption - displayed description.
 * @param {DropdownMenuType} type - {list|widelist|calender}. (list: 100% width options list, widelist: list of any width, calendar: calendar)
 * @param {DropdownMenuDisplayPositionType} position - {bottom|bottomover|upper|upperover} 
 * @param {[ListMenu]} listMenuItems - list of ListMenu with title, value.
 */
class DropdownButton {

    __description__ = null;
    __field_name__ = null;
    __items__ = null;
    __menu_position__ = DropdownMenuDisplayPositionType.upper;
    __width__ = null;  // TODO: widelist

    _state = DropdownButtonState.onclose;
    _selectedValue = null;
    _title = null;

    constructor(parent_id, id, field_name, title, description, type, position, listMenuItems, htmlTag='div', validators=[]) {
        super(parent_id, id, '', htmlTag, validators);

        this.__description__ = description;
        this.__field_name__ = field_name;
        this.__type__ = type;
        this.__items__ = listMenuItems;
        this.__menu_position__ = position;

        this._title = title;
    }


    /* setters */

    /**
     * state setter.
     */
    set state(state) {
        const previousState = this._state;
        this._state = state;
        switch (state) {
            case DropdownButtonState.onclose:
                console.log(`DropdownButton state changed -> onclose`);
                this._removeClosingUnderSheet();
                this.$toggleItem.style.display = 'none';
                break
            case DropdownButtonState.onopen:
                console.log(`DropdownButton state changed -> onopen`);
                console.log(this.$toggleItem);
                this.$toggleItem.style.display = 'block';
                console.log(this.__menu_position__);
                if (this.__menu_position__ == DropdownMenuDisplayPositionType.bottom) {
                    this.$toggleItem.style.top = `${this.$view.offsetTop + this.$view.offsetHeight}px`;
                } else if (this.__menu_position__ == DropdownMenuDisplayPositionType.bottomover) {
                    this.$toggleItem.style.top = `${this.$view.offsetTop}px`;
                } else if (this.__menu_position__ == DropdownMenuDisplayPositionType.upper) {
                    this.$toggleItem.style.top = `${this.$view.offsetTop - this.$listMenu.offsetHeight}px`;
                } else if (this.__menu_position__ == DropdownMenuDisplayPositionType.upperover) {
                    this.$toggleItem.style.top = `${this.$view.offsetTop - this.$listMenu.offsetHeight - this.$view.offsetHeight}px`;
                } else {
                    console.error(`${this.__menu_position__} is unknown position.`);
                }
                // add click outside -> close event
                this._addClosingUnderSheet(this, this.$listMenu);
                break
            case DropdownButtonState.onselected:
                console.log(`DropdownButton state changed -> onselected`);
                // NOTE: not in use so far
                break
        }
    }
 
    /**
     * selectedValue setter / getter.
     */
    set selectedValue(selectedValue) {
        const previousState = this._selectedValue;
        this._selectedValue = selectedValue;
        if (selectedValue != null) {
            const item = this.__items__.find((item) => item.value == selectedValue);
            if (item == null) {
                console.error(`${selectedValue} is not in items. see below.`);
                console.table(this.__items__);}
            else {
                this._setTitle(item.title);
            }
        }
        const event = new CustomEvent(
            'selected', {detail: {value: selectedValue, id: this.__id__}});
        this.$view.dispatchEvent(event);
    }

    get selectedValue() {return this._selectedValue;}

    /**
     * value setter / getter.
     */
    set value(value) {
        super.value(value)
        this.selectedValue = value;
    }

    get value() {
        return this.selectedValue;
    }
 

    /* private methods */

    /**
     * DOM nodes as variables.
     */
    _setElements(title, htmlTag) {
        // Set up basic elements via parent class.
        super._setElements(title, htmlTag);
        this.$view.classList.add('dropdownButton');

        // Create and configure dropdown button clickable container.
        let $dropdownButtonClickable = document.createElement('div');
        $dropdownButtonClickable.className = "dropdownButtonClickable cf";
        this.$view.append($dropdownButtonClickable);

        // Create and configure description.
        let $description = document.createElement('h6');
        $description.className = "description";
        $description.textContent = this.__description__;
        $dropdownButtonClickable.appendChild($description);

        // Create and configure title.
        let $title = document.createElement('span');
        $title.className = "title";
        $title.textContent = this._title;
        $dropdownButtonClickable.appendChild($title);

        // Create and configure down arrow image.
        let $downArrowImg = document.createElement('img');
        $downArrowImg.className = "downarrow";
        $downArrowImg.src = "/img/icons/arrow-down.png";
        $downArrowImg.srcset = "/img/icons/arrow-down@2x.png 2x";
        $dropdownButtonClickable.appendChild($downArrowImg);

        // set list menu
        if (type == DropdownMenuType.list || type == DropdownMenuType.widelist) {
            const $listMenu = document.createElement('ul');
            $listMenu.className = 'listmenu';
            $listMenu.style.display = 'none';
            this.$view.appendChild($listMenu);
        }

        // set list menu items
        if (type == DropdownMenuType.list || type == DropdownMenuType.widelist) {
            this._setListMenuItems(listMenuItems);
        }

        // Assign class properties to corresponding HTML elements for easy access.
        this.$title = this.$view.querySelector('.title');
        this.$dropdownButtonClickable = this.$view.querySelector('.dropdownButtonClickable');
        if (this.__type__ == DropdownMenuType.list || this.__type__ == DropdownMenuType.widelist) {
            this.$listMenu = this.$view.querySelector('.listmenu');
            this.$toggleItem = this.$listMenu;
        }

        // Log warnings for missing HTML elements.
        if (!this.$title) console.warn(`<span class=title></span> is necessary in HTML.`);
        if (!this.$dropdownButtonClickable) console.warn(`<div class=dropdownButtonClickable></div> is necessary in HTML.`);
        if (this.__type__ == DropdownMenuType.list || this.__type__ == DropdownMenuType.widelist) {
            if (!this.$listMenu) console.warn(`<ul class=listmenu></ul> is necessary in HTML.`);
        }
    }

    /**
     * Initialize the layout for display.
     */
    _initLayout() {
    }

    /**
     * Set list menu items (type: list, widelist).
     * @param {ListMenu} items - list of ListMenu with (title, value)
     */
    _setListMenuItems(items) {
        console.log(`set ${items.length} list menu items into ${this.__id__}.`)
        if (IS_DEBUG) { console.table(items) };
        items.forEach((item) => {
            let $item = document.createElement('li');
            $item.className = "listitem";
            $item.dataset.value = item.value;
            $item.dataset.title = item.title;
            $item.textContent = item.title;
            this.$listMenu.append($item);
        });
    }

    /**
     * Set selected title.
     * @param {string} title - 
     */
    _setTitle(title) {
        console.log(`set ${title} as title.`)
        this.$title.innerHTML = title;
    }

    /**
     * Set event handlers.
     */
    _setEventHandlers() {
        const _this = this;
        this.$dropdownButtonClickable.addEventListener('click', e => {
            console.log(`[event] button ${_this.__id__} clicked`)
            if (_this._state == DropdownButtonState.onclose) {
                _this.state = DropdownButtonState.onopen;
                e.stopPropagation();
            }
            else if (_this._state == DropdownButtonState.onopen) {
               _this.state = DropdownButtonState.onclose;
            }
            else {
                console.error(`unknown current state of ${_this.__id__} ${_this._state}`)
            }
        });
        this.$listMenu.addEventListener('click', e => {
            console.log(`[event] list menu ${_this.__id__} clicked`)
            const hoveredItem = this.$listMenu.querySelector(':hover');
            const selectedValue = hoveredItem.dataset.value;
            console.log(hoveredItem);
            console.table(hoveredItem.dataset);
            console.log(`selected value: ${selectedValue}`);
            this._selectedValue = selectedValue;
            this._setTitle(hoveredItem.dataset.title);
            this.state = DropdownButtonState.onclose;
            // TODO: delete when unnecessary for the long term 
            // // dispatch event
            // const event = new CustomEvent('selected', {detail: {id: this.__id__, value: selectedValue}});
            // this.$view.dispatchEvent(event);

            if(this.viewController && typeof this.viewController._dropdownButtonSelected === "function"){
                this.viewController._dropdownButtonSelected(this, selectedValue);
            } else {
                console.error('ViewController not set or _dropdownButtonSelected not a function');
            }
        });
    }

    /**
     * Add the element that changes state to close when clicked.
     * 
     * @description This function is reusable for similar cases
     * by changing lines `modify this`.
     * @param {DropdownButton} this - the instance of the UI component.
     * @param {Element} $before - the element where this sheet is inserted.
     */
    _addClosingUnderSheet(_this, $before) {
        let under = document.createElement('span');
        under.id = this.__id__ + '-under';
        under.style.position = 'absolute';
        under.style.width = `${screen.width + 1000}px`;
        under.style.height = `${screen.height + 1000}px`;
        //under.style.background = 'rgb(0,0,0,0.2)'; // visible test
        under.style.top = '0px';
        under.style.left = '0px';
        under.style.zIndex = 1;
        this.$view.insertBefore(under, $before); // modify this
        const __this = _this;
        under.addEventListener('click', e => {
            if (__this._state == DropdownButtonState.onopen) { // modify this
                __this.state = DropdownButtonState.onclose; // modify this
                e.currentTarget.remove();
            } else {
                console.log('nothing happens.')
            }
        }, {capture: true, once: true});
    }

    /**
     * Remove undersheet element when close.
     */
    _removeClosingUnderSheet() {
        document.getElementById(this.__id__ + '-under').remove();
    }

    /* public functions */

    /**
     * Add/Remove alert.
     * 
     * @param {bool} onAlert 
     * @param {string} message
     */
    alert(onAlert, message) {
        // TODO: modify to ensure alertId is set by the format
        const alertId = this.__id__ + '_alert';
        let $parent = this.$view;
        let $footer = $parent.querySelector('.footer');
        if (onAlert) {
            // add alert to css
            $parent.classList.add('alert');
            let $alertMessage = document.getElementById(alertId);

            if (!$alertMessage) {
                // if no alertMessage exists, add new alert message
                $alertMessage = document.createElement('p');
                $alertMessage.classList.add('alertMessage');
                $alertMessage.id = alertId;
                $footer.appendChild($alertMessage);
            };
            $alertMessage.innerText = message;

        } else {
            // return if alertMessage is already removed
            let $alertMessage = document.getElementById(alertId);
            if (document.getElementById(alertId) == null) { 
                return 
            } else {
                // remove alert
                $parent.classList.remove('alert');
                if ($alertMessage) {
                    $footer.removeChild($alertMessage);
                }
            }
        }
    }
}

class DropdownButtonProtocol {
    /**
     * Called when a DropdownButton is selected.
     *
     * @param {DropdownButton} dropdownButton
     * @param {string} value
     * @throws {Error} If the method is not overridden in the implementing class.
     */
    dropdownButtonSelected(dropdownButton, value) {
        throw new Error(`The class ${this.constructor.name} must implement _dropdownButtonSelected method!`);
    }
}
