'use strict';

const DropdownButtonState = Object.freeze({ onclose: 1, onopen: 2, onselected: 3 });
const DropdownMenuType = Object.freeze({ list: 1, widelist: 2, calendar: 3 });
const DropdownMenuDisplayPositionType = Object.freeze({ bottom: 1, bottomover: 2, upper: 3, upperover: 4 });


// Prepare SVG as a data URI (you can inline it directly or load from a separate file)
const defaultArrowSvg = 
`<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="arrow" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
	 viewBox="0 0 30 30" style="enable-background:new 0 0 30 30;" xml:space="preserve">
<style type="text/css">
	.st0{fill:none;stroke:#666666;stroke-width:2.3;stroke-miterlimit:10;}
</style>
<path class="st0" d="M3,10.2l11.4,9.6c4.2-3.2,8.3-6.4,12.5-9.6"/>
</svg>`;

const DropdownButtonDefaultArrowIconPath = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultArrowSvg)}`;

const defaultSelectedSvg = 
`<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 50.3 50.3" xml:space="preserve" style="enable-background:new 0 0 50.3 50.3;">
<style type="text/css">
    .st2{fill:none;stroke:#000;stroke-width:5;stroke-miterlimit:10;}
</style>
<g id="ok">
    <polyline class="st2" points="10.2,26.8 20.9,37 42,14.2"/>
</g>
</svg>`;

const DropdownButtonDefaultSelectedIconPath = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultSelectedSvg)}`;



/**
 * ListItem class
 * Represents a single item in the dropdown menu.
 * 
 * usage:
 *   new ListItem({title: "Afghanistan", value: 12})
 */
class ListItem {
    constructor({ title, value, description }) {
        this.title = title;
        this.description = description;
        this.value = value;
        if (this.title == null || this.value == null) {
            console.error('both title and value of ListItem are necessary but null.');
        }
    }
}

/**
 * Usage:
 * ```
 * const listMenuItems = [
 *     new ListItem({title: 'Afghanistan', value: 12}),
 *     new ListItem({title: 'Belarus', value: 73}),
 *     new ListItem({title: 'China', value: 981}),
 * ];
 * 
 * let validator = new Validator(
 *     dropdownButton, 
 *     ValidationErrorType.required, 
 *     "This field is required."
 * );
 * 
 * let dropdownButton = new DropdownButton({
 *     id: 'countrySelectButton',
 *     fieldName: 'country',
 *     title: 'Your Country',
 *     description: 'Please select your country.',
 *     type: DropdownMenuType.list,
 *     position: DropdownMenuDisplayPositionType.upper,
 *     items: listMenuItems,
 *     htmlTag: 'div',
 *     validators: [validator]
 * });
 */
class DropdownButton {

    constructor({
        id,
        fieldName,
        items = [],
        title = '',
        description = '',
        type = DropdownMenuType.list,
        position = DropdownMenuDisplayPositionType.upper,
        validators = [],
        htmlTag = 'div',
        arrowIconPath = DropdownButtonDefaultArrowIconPath,  // Add a new parameter for the arrow icon
        hasSelectedIcon = false,
        selectedIconPath = DropdownButtonDefaultSelectedIconPath, 
        //selectedIconColor = '#19690D', 
        isMultiSelect = false,
        multiSelectDisplayTitle = '$0 selected', // New parameter for multi-selection display
        descriptionClipLength = 30, 
    } = {}) {

        this.id = id;
        this.fieldName = fieldName;
        this.items = items;
        this.title = title;
        this.description = description;
        this.type = type;
        this.position = position;
        this.validators = validators;
        this.htmlTag = htmlTag;
        this.arrowIconPath = arrowIconPath; // store the arrow icon path
        this.hasSelectedIcon = hasSelectedIcon;
        this.selectedIconPath = selectedIconPath;
        //this.selectedIconColor = selectedIconColor;

        this.descriptionClipLength = descriptionClipLength;

        this.isMultiSelect = isMultiSelect;
        this.multiSelectDisplayTitle = multiSelectDisplayTitle;

        this._selectedValue = isMultiSelect ? [] : null;

        this._state = DropdownButtonState.onclose;
        this._createElements();
        this._setEventHandlers();
    }

    /* setters and getters */

    set state(state) {
        const previousState = this._state;
        this._state = state;
        switch (state) {
            case DropdownButtonState.onclose:
                console.log(`DropdownButton state changed -> onclose`);
                this._removeClosingUnderSheet();
                if (this.$toggleItem) this.$toggleItem.style.display = 'none';
                break;

            case DropdownButtonState.onopen:
                console.log(`DropdownButton state changed -> onopen`);
                if (this.$toggleItem) this.$toggleItem.style.display = 'block';

                if (this.position == DropdownMenuDisplayPositionType.bottom) {
                    this.$toggleItem.style.top = `${this.$view.offsetTop + this.$view.offsetHeight}px`;
                } else if (this.position == DropdownMenuDisplayPositionType.bottomover) {
                    this.$toggleItem.style.top = `${this.$view.offsetTop}px`;
                } else if (this.position == DropdownMenuDisplayPositionType.upper) {
                    this.$toggleItem.style.top = `${this.$view.offsetTop - this.$listMenu.offsetHeight}px`;
                } else if (this.position == DropdownMenuDisplayPositionType.upperover) {
                    this.$toggleItem.style.top = `${this.$view.offsetTop - this.$listMenu.offsetHeight - this.$view.offsetHeight}px`;
                } else {
                    console.error(`${this.position} is unknown position.`);
                }
                // add click outside -> close event
                this._addClosingUnderSheet(this, this.$listMenu);
                break;

            case DropdownButtonState.onselected:
                console.log(`DropdownButton state changed -> onselected`);
                // NOTE: not in use so far
                break;
        }
    }

    get state() {
        return this._state;
    }

    set selectedValue(newVal) {
        const previousValue = this._selectedValue;
        if (!this.isMultiSelect) {
            // Single selection
            if (newVal != null) {
            } else {
                console.error(`${newVal} is null.`);
            }
            this._selectedValue = newVal;
            const item = this.items.find(item => String(item.value) === String(newVal));
            if (item == null) {
                console.error(`${newVal} is not in items. see below.`);
                console.table(this.items);
            } else {
                this._setTitle(item.title);
            }
        } else {
            // Multi-selection: assume newVal is an array of item values, or handle toggling yourself
            if (Array.isArray(newVal)) {
                this._selectedValue = newVal;
                if (this._selectedValue.length === 1) {
                    // Only one item selected set the item's title
                    const item = this.items.find(item => String(item.value) === String(newVal[0]));
                    if (item) {
                        this._setTitle(item.title);
                    }
                } else {
                    const count = Array.isArray(this._selectedValue) ? this._selectedValue.length : 0;
                    const displayTitle = this.multiSelectDisplayTitle.replace('$0', count);
                    this._setTitle(displayTitle);
                }
            } else {
                console.warn(`[DropdownButton] newVal should be an array when isMultiSelect=true. Received: ${newVal}`);
            }
        }

        this._updateSelectionStyles();
        
        const event = new CustomEvent('selected', { detail: { value: newVal, id: this.id } });
        this.$view.dispatchEvent(event);
    }

    get selectedValue() { return this._selectedValue; }

    set value(v) { this.selectedValue = v; }
    get value() { return this.selectedValue; }

    get stringValue() {
        if (!this.isMultiSelect) {
            return this._selectedValue ? String(this._selectedValue) : '';
        }
        if (Array.isArray(this._selectedValue)) {
            return this._selectedValue.join(',');
        }
        return '';
    }

    /* private methods */

    _createElements() {
        this.$view = document.createElement(this.htmlTag);
        this.$view.id = this.id;
        this.$view.classList.add('spl-DropdownButton');

        // Create and configure clickable area
        let $dropdownButtonClickable = document.createElement('div');
        $dropdownButtonClickable.className = "spl-DropdownButtonClickable spl-cf";
        this.$view.appendChild($dropdownButtonClickable);

        // Create and configure description
        let $description = document.createElement('h6');
        $description.className = "spl-description";
        $description.textContent = this.description;
        $dropdownButtonClickable.appendChild($description);

        // Create and configure title
        let $title = document.createElement('span');
        $title.className = "spl-title";
        $title.textContent = this.title;
        $dropdownButtonClickable.appendChild($title);

        // Create and configure down arrow image
        let $downArrowImg = document.createElement('img');
        $downArrowImg.className = "spl-downarrow";
        $downArrowImg.src = this.arrowIconPath;  // Use the initialized arrowIconPath
        $dropdownButtonClickable.appendChild($downArrowImg);

        // Create footer area
        let $footer = document.createElement('div');
        $footer.className = 'spl-footer spl-cf';
        $dropdownButtonClickable.appendChild($footer);
        this.$footer = $footer;

        // set list menu if type is list or widelist
        if (this.type == DropdownMenuType.list || this.type == DropdownMenuType.widelist) {
            const $listMenu = document.createElement('ul');
            $listMenu.className = 'spl-listmenu';
            $listMenu.style.display = 'none';
            this.$view.appendChild($listMenu);
            this.$listMenu = $listMenu;
            this.$toggleItem = this.$listMenu;
            this._setListMenuItems(this.items);
        }

        // Assign class properties to corresponding elements for easy access
        this.$title = this.$view.querySelector('.spl-title');
        this.$dropdownButtonClickable = this.$view.querySelector('.spl-DropdownButtonClickable');

        if (!this.$title) console.warn(`<span class=title></span> is necessary in HTML.`);
        if (!this.$dropdownButtonClickable) console.warn(`<div class=dropdownButtonClickable></div> is necessary in HTML.`);
        if ((this.type == DropdownMenuType.list || this.type == DropdownMenuType.widelist) && !this.$listMenu) {
            console.warn(`<ul class=listmenu></ul> is necessary in HTML.`);
        }
    }

    _setListMenuItems(items) {
        console.log(`set ${items.length} list menu items into ${this.id}.`)
        items.forEach((item) => {
            let $item = document.createElement('li');
            $item.className = "spl-listitem";
            $item.dataset.value = item.value;
            $item.dataset.title = item.title;
            $item.dataset.description = item.description;

            // -- create a container for the text lines
            let $titleWrap = document.createElement('div');
            $titleWrap.className = 'spl-listitem-title-wrap';
        
            // main title
            let $titleText = document.createElement('div');
            $titleText.className = 'spl-listitem-title';
            $titleText.textContent = item.title;
            $titleWrap.appendChild($titleText);

            // optional description (below the title)
            if (item.description) {
                let $descText = document.createElement('div');
                $descText.className = 'spl-listitem-description';

                // If we want to truncate it
                if (this.descriptionClipLength > 0 &&
                    item.description.length > this.descriptionClipLength) {
                    $descText.textContent = 
                        item.description.substring(0, this.descriptionClipLength) + '...';
                } else {
                    $descText.textContent = item.description;
                }

                $titleWrap.appendChild($descText);
            }
            $item.appendChild($titleWrap);

            if (this.hasSelectedIcon){ 
                let $checkIcon = document.createElement('img');
                $checkIcon.className = 'spl-selected-icon';
                $checkIcon.src = this.selectedIconPath;
                $checkIcon.style.width = '16px';  // or whatever
                $checkIcon.style.visibility = 'hidden';  // hide by default
                $item.appendChild($checkIcon);
            }



            this.$listMenu.append($item);
        });
    }

    _setTitle(title) {
        console.log(`set ${title} as title.`)
        this.$title.innerHTML = title;
    }

    _setEventHandlers() {
        const _this = this;
        if (this.$dropdownButtonClickable) {
            this.$dropdownButtonClickable.addEventListener('click', e => {
                if (_this._state == DropdownButtonState.onclose) {
                    _this.state = DropdownButtonState.onopen;
                    e.stopPropagation();
                }
                else if (_this._state == DropdownButtonState.onopen) {
                    _this.state = DropdownButtonState.onclose;
                }
            });
        }

        if (this.$listMenu) {
            this.$listMenu.addEventListener('click', e => {
                const hoveredItem = this.$listMenu.querySelector(':hover');
                if (!hoveredItem) return;

                const clickedValue = hoveredItem.dataset.value;
                const clickedTitle = hoveredItem.dataset.title;
                
                if (!this.isMultiSelect) {
                    // Single select logic (original)
                    this._selectedValue = clickedValue;
                    this._setTitle(clickedTitle);
                    this.state = DropdownButtonState.onclose;

                    // Fire "selected" event
                    const event = new CustomEvent('selected', { detail: { value: clickedValue, id: this.id } });
                    this.$view.dispatchEvent(event);
                } else {
                    // Multi-select: toggle this item’s presence in _selectedValue array
                    if (!Array.isArray(this._selectedValue)) this._selectedValue = [];
                    
                    const index = this._selectedValue.indexOf(clickedValue);
                    if (index >= 0) {
                        // Already selected => unselect
                        this._selectedValue.splice(index, 1);
                        this._setStyleSelect(hoveredItem, false)
                    } else {
                        // Not selected => select
                        this._selectedValue.push(clickedValue);
                        this._setStyleSelect(hoveredItem, true)
                    }
                    
                    if (this._selectedValue.length === 1) {
                        const item = this.items.find(item => String(item.value) === String(this._selectedValue[0]));
                        if (item) {
                            this._setTitle(item.title);
                        }
                    } else {
                        // Update the displayed title. For example, “2 selected”
                        const count = Array.isArray(this._selectedValue) ? this._selectedValue.length : 0;
                        if (!this.multiSelectDisplayTitle) {
                            console.error('no this.multiSelectDisplayTitle set in DropdownButton.')
                        }
                        const displayTitle = this.multiSelectDisplayTitle.replace('$0', count);
                        this._setTitle(displayTitle);
                    }

                    // Remain open for more selections
                    // (If you want the dropdown to close after each selection, remove the line below)
                    this.state = DropdownButtonState.onopen;

                    // Fire "selected" event
                    const event = new CustomEvent('selected', { detail: { value: this.value, id: this.id } });
                    this.$view.dispatchEvent(event);
                }
            });
        }
    }

    _setStyleSelect($item, select) {
        if (select) {
            $item.classList.add('spl-selected');
            let $icon = $item.querySelector('.spl-selected-icon');
            if ($icon) $icon.style.visibility = 'visible';
        } else {
            $item.classList.remove('spl-selected');
            let $icon = $item.querySelector('.spl-selected-icon');
            if ($icon) $icon.style.visibility = 'hidden';
        }
    }

    _updateSelectionStyles() {
        // If you don’t have a list menu, bail out.
        if (!this.$listMenu) return;
    
        // 1. Un-select everything first.
        const $listItems = this.$listMenu.querySelectorAll('.spl-listitem');
        $listItems.forEach($item => {
            this._setStyleSelect($item, false);
        });
    
        // 2. Now select the relevant items.
        if (!this.isMultiSelect) {
            // Single selection
            const $match = this.$listMenu.querySelector(`.spl-listitem[data-value="${this._selectedValue}"]`);
            if ($match) {
                this._setStyleSelect($match, true);
            }
        } else {
            // Multi-selection
            if (Array.isArray(this._selectedValue)) {
                this._selectedValue.forEach(val => {
                    const $match = this.$listMenu.querySelector(`.spl-listitem[data-value="${val}"]`);
                    if ($match) {
                        this._setStyleSelect($match, true);
                    }
                });
            }
        }
    }

    _addClosingUnderSheet(_this, $before) {
        let under = document.createElement('span');
        under.id = this.id + '-under';
        under.style.position = 'fixed';//'absolute';
        under.style.width = '100%';//`${screen.width + 1000}px`;
        under.style.height = '100%';//`${screen.height + 1000}px`;
        under.style.top = '0px';
        under.style.left = '0px';
        under.style.zIndex = 1;
        this.$view.insertBefore(under, $before);
        const __this = _this;
        under.addEventListener('click', e => {
            if (__this._state == DropdownButtonState.onopen) {
                __this.state = DropdownButtonState.onclose;
                e.currentTarget.remove();
            } else {
                console.log('nothing happens.')
            }
        }, { capture: true, once: true });
    }

    _removeClosingUnderSheet() {
        const underElements = document.querySelectorAll(`[id^="${this.id}-under"]`); // Select all elements with id starting with `${this.id}-under`
        underElements.forEach($under => {
            $under.remove(); // Remove each element
        });
    }

    /* public functions */

    /**
     * Add/Remove alert.
     * @param {boolean|string} onAlert - If false, no alert. If string, show that message as alert.
     * @param {string} [message] - Alert message to display.
     */
    alert(onAlert, message) {
        const alertId = this.id + '_alert';
        let $parent = this.$view;
        let $footer = $parent.querySelector('.spl-footer');
        if (onAlert && typeof onAlert === 'string') {
            message = onAlert;
            onAlert = true;
        }

        if (onAlert) {
            // add alert to css
            $parent.classList.add('spl-alert');
            let $alertMessage = document.getElementById(alertId);

            if (!$alertMessage) {
                // if no alertMessage exists, add new alert message
                $alertMessage = document.createElement('p');
                $alertMessage.classList.add('spl-alertMessage');
                $alertMessage.id = alertId;
                $footer.appendChild($alertMessage);
            }
            $alertMessage.innerText = message;

        } else {
            // return if alertMessage is already removed
            let $alertMessage = document.getElementById(alertId);
            if ($alertMessage == null) { 
                return;
            } else {
                // remove alert
                $parent.classList.remove('spl-alert');
                if ($alertMessage) {
                    $footer.removeChild($alertMessage);
                }
            }
        }
    }

    setViewController(viewController) {
        this.viewController = viewController;
    }

    mount(selectorOrElement) {
        let container;

        if (typeof selectorOrElement === 'string') {
            container = document.querySelector(selectorOrElement);
            if (!container) {
                console.error(`No element found with selector ${selectorOrElement}`);
                return;
            }
        } else if (selectorOrElement instanceof Element) {
            container = selectorOrElement;
        } else {
            console.error('Invalid input: selector must be a string or a DOM element');
            return;
        }
        container.appendChild(this.$view);
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
