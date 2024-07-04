// Define custom event name
const keywordsFieldCustomEventSubmit = 'keywordsSubmit'
// Define class names as constants
const keywordsFieldKeywordsClassName = 'keywords';
const keywordsFieldKeywordClassName = 'keyword';
const keywordsFieldLabelClassName = 'label';
const keywordsFieldDeleteClassName = 'delete';
const keywordsFieldPressClassName = 'press';

/**
 * `KeywordsField` is an extension of the `TextField` class to handle keywords.
 * It allows adding, removing, and managing keywords in an interactive manner.
 * This class interacts with the DOM to create visual elements and manage the keyword state.
 * 
 * save as the format:
 * 
 *    keywords = ["Keyword 1", "Keyword 2", ... ]
 * 
 * html:
 *    <div id="this.id" class="textField">
 *      <div class="inputOuter">
 *          <h6 class="title">{this.__title__}</h6>
 *          <ul class="keywords">
 *              <li class="keyword">
 *                  <p class="label">Keyword 1</p>
 *                  <button class="delete">
 *                      <svg><!-- delete icon here --></svg>
 *                  </span>
 *              </li>
 *          </ul>
 *          <input class="keywordform" name="keyword" type="text" autocomplete="off">
 *          <div class="footer">
 *              <span class="indicator"></span>
 *              <span class="message"></span>
 *              <span class="counter"></span>
 *          </div>
 *          <p class="press">press<strong>Enter ↵</strong></p>
 *      </div>
 *   </div>
 * 
 * Usage:
 *  const keywordsField = new KeywordsField('id', ...);
 * 
 *  keywordsField.$textField.addEventListener(keywordsFieldCustomEventSubmit, (event) => {
 *      const keywords = event.detail.keywords;
 *      
 *  });
 */
class KeywordsField extends TextField {
    constructor({
        id,
        fieldName,
        maxTextLength,
        validators = [],
        type = TextFieldType.singleline,
        pressText = 'press',
        enterText = 'Enter ↵',
        title = "",
        placeholder = "",
        cookieExclude = true,
        isDefaultValueRestoredFromCookie = false,
        shouldMapTextToDeleteButtonBGColor = false,
        constantDeleteButtonBGColorSaturation = 31,
        constantDeleteButtonBGColorLightness = 38,
        initRows = 1,
        verticalFlex = false,
        hasTitle = true,
        passwordMode = false,
        defaultValue = null,
        hasCookiePrefix = false,
        scrollControlElementId = null,
        isCounter = false
    }) {
        
        super({ id, fieldName, type, defaultValue, validators, maxTextLength, initRows, verticalFlex, hasTitle, title, placeholder, passwordMode, cookieExclude, hasCookiePrefix, isDefaultValueRestoredFromCookie, scrollControlElementId, isCounter });

        this.id = id,

        this.pressText = pressText;
        this.enterText = enterText;
        this.shouldMapTextToDeleteButtonBGColor = shouldMapTextToDeleteButtonBGColor;
        this.constantDeleteButtonBGColorLightness = constantDeleteButtonBGColorSaturation;
        this.constantDeleteButtonBGColorLightness = constantDeleteButtonBGColorLightness;

        this.createElements();
        this._addEventHandlers();

        this.keywords = [];
        this.onEdit = false;
        this.materialId = null;
        this.scopeIndex = null;
    }

    /**
     * Returns the locale key for the placeholder.
     *
     * @param {string} id - The ID used to construct the locale key.
     * @returns {string} The locale key for the placeholder.
     */
    static getLocaleKeyPlaceholder(id) {
        return `${id}__text__placeholder`;
    }
    
    /**
     * Sets the keywords property.
     *
     * @param {string[]} keywords - An array of keywords.
     */
    set keywords(keywords) {
        this._keywords = keywords;
    }

    /**
     * Gets the keywords property.
     *
     * @returns {string[]} The array of keywords.
     */
    get keywords() {return this._keywords; }


    /**
     * Add keywords list.
     * 
     *  html:
     *    <div id="{this.id}" class="textField">
     *      <div class="inputOuter">
     *          <h6 class="title">{this.__title__}</h6>
     *          <ul class="keywords">
     *              <li class="keyword">
     *                  <p class="label">Keyword 1</p>
     *                  <button class="delete">
     *                      <svg><!-- delete icon here --></svg>
     *                  </span>
     *              </li>
     *          </ul>
     *          <input class="{this.fieldName}form" name="{this.fieldName}" type="text" autocomplete="off">
     *          <div class="footer">
     *              <span class="indicator"></span>
     *              <span class="message"></span>
     *              <span class="counter"></span>
     *          </div>
     *          <p class="press">press<strong>Enter ↵</strong></p>
     *      </div>
     *   </div>
     * 
     */
    createElements() {
        // Add class name
        this.$textField.classList.add('KeywordsField');

        // Create the $keywords element
        const $keywords = document.createElement('ul');
        $keywords.className = keywordsFieldKeywordsClassName;
        this.$inputOuter.prepend($keywords);  // Using prepend to add $keywords as the first child
        this.$keywords = $keywords;

        // Create the $press element
        const $press = document.createElement('p');
        $press.className = keywordsFieldPressClassName;
        $press.innerHTML = `${this.pressText}<strong>${this.enterText}</strong>`;
        this.$inputWrapper.appendChild($press);  // This will add $press to the end of the container
        this.$press = $press;
    }

    _updatePressVisibility() {
        if (this.$textArea.value.length > 0 && document.activeElement === this.$textArea) {
            debuglog('show press');
            this.$press.classList.add('show');
        } else {
            debuglog('remove press');
            this.$press.classList.remove('show');
        }
    }

    /**
     * Adds event listeners to the keyword elements.
     * This method listens for delete button clicks and Enter key press events.
     */
    _addEventHandlers() {
        // Text area focus
        this.$textArea.addEventListener('focus', () => {
            this._updatePressVisibility();
            this.$textField.classList.add('focus');
        });

        // Text area blur
        this.$textArea.addEventListener('blur', () => {
            this._updatePressVisibility();
            this.$textField.classList.remove('focus');
            
            // Remove scope class when focus is out
            if (this.scopeIndex !== null) {
                this.$keywords.childNodes[this.scopeIndex].classList.remove('scope');
                this.scopeIndex = null;
            }
        });

        // Handle Enter key press in the $textArea
        this.$textArea.addEventListener('keyup', (event) => {
            this._updatePressVisibility();
            if (event.key === 'Enter') { // 13 is the keyCode for Enter
                const keyword = this.$textArea.value.trim(); // get the input value and trim any whitespace
                if (keyword) { // only if there's a non-empty keyword
                    this.addKeyword(keyword, true);
                    this.$textArea.value = ''; // Clear the input for the next keyword
                }
            }
        });

        this.$textArea.addEventListener('keydown', (event) => {
            this._updatePressVisibility();
            if (event.key === 'Backspace') {
                if (this.$textArea.value === '') {
                    // Add 'scope' class to the last keyword
                    if (this.scopeIndex === null) {
                        this.scopeIndex = this.keywords.length - 1;
                        if (this.scopeIndex >= 0) {
                            this.$keywords.childNodes[this.scopeIndex].classList.add('scope');
                        }
                    } 
                    // Remove the scoped keyword
                    else {
                        this.removeKeyword(this.scopeIndex, true);
                        this.scopeIndex = null;
                    }
                } else {
                    // Remove scope class when other keys are pushed
                    if (this.scopeIndex !== null) {
                        this.$keywords.childNodes[this.scopeIndex].classList.remove('scope');
                        this.scopeIndex = null;
                    }
                }
            } else {
                // Remove scope class when other keys are pushed
                if (this.scopeIndex !== null) {
                    this.$keywords.childNodes[this.scopeIndex].classList.remove('scope');
                    this.scopeIndex = null;
                }
            }
        });

        // Focus any area is clicked
        this.$textField.addEventListener('click', (event) => {
            if (document.activeElement !== this.$textArea) {
                this.$textArea.focus();
                event.stopPropagation(); // Prevent event from propagating to child elements
            }
        });
    }

    /**
     * Set keywords
     * 
     * @param {[String]} keywords 
     */
    setKeywords(keywords) {
        this.clearKeywords();
        keywords.forEach((keyword) => {
            this.addKeyword(keyword);
        })
    }

    /**
     * Add keyword to list.
     * 
     * @param {*} keyword 
     */
    addKeyword(keyword, submit=false) {
        // Update the internal list
        const index = this.keywords.length;
        this.keywords.push(keyword);

        // Create new DOM element and add to keywords ul
        const $keywordItem = document.createElement('li');
        $keywordItem.className = keywordsFieldKeywordClassName;
    
        const $keywordLabel = document.createElement('p');
        $keywordLabel.className = keywordsFieldLabelClassName;
        $keywordLabel.textContent = keyword;
        $keywordItem.appendChild($keywordLabel);
    
        const $deleteButton = document.createElement('button');
        $deleteButton.className = keywordsFieldDeleteClassName;
        $deleteButton.type = 'button'; // Indicate it's a button for user-interaction (not a submit button)
        $deleteButton.innerHTML = SVGIcons.cancelIconSVG;
        if(this.shouldMapTextToDeleteButtonBGColor) {
            $deleteButton.style.backgroundColor = this.textToHSL(keyword);
        }
        $deleteButton.addEventListener('click', () => {
            debuglog(`keyword ${index} delete button clicked.`)
            this.removeKeyword(index, true);
        });

        $keywordItem.appendChild($deleteButton);

        this.$keywords.appendChild($keywordItem);

        if(submit) {
            this.submitKeywords();
        }
    }

    /**
     * Removes the last keyword from the list.
     */
    popKeyword() {
        // Update the internal list
        if (this.keywords.length > 0) {
            this.keywords.pop();

            // Remove the last child of the keywords ul
            this.$keywords.removeChild(this.$keywords.lastChild);
        }
    }

    /**
     * Remove a keyword from the list at a given index.
     * 
     * @param {number} index - The index of the keyword to be removed.
     */
    removeKeyword(index, submit=false) {
        if (index >= 0 && index < this.keywords.length) {
            // Update the internal list
            this.keywords.splice(index, 1);
    
            // Remove the keyword from the DOM
            const keywordItemToRemove = this.$keywords.childNodes[index];
            this.$keywords.removeChild(keywordItemToRemove);
        } else {
            console.error(`Invalid index ${index} provided to removeKeyword.`);
        }

        if(submit) {
            this.submitKeywords();
        }
    }

    /**
     * Clears all keywords from the list.
     */
    clearKeywords(submit=false) {
        // Update the internal list
        this.keywords = [];

        // Clear all children of the keywords ul
        while (this.$keywords.firstChild) {
            this.$keywords.removeChild(this.$keywords.firstChild);
        }

        if(submit) {
            this.submitKeywords();
        }
    }

    /**
     * Dispatches a custom event with the current list of keywords.
     */
    submitKeywords() {
        const _this = this;
        let event = new CustomEvent(keywordsFieldCustomEventSubmit, {
            detail: { keywords: _this.keywords }
        });
        console.log(`Dispatching custom event by ${this.$textField.id}:`, keywordsFieldCustomEventSubmit);
        _this.$textField.dispatchEvent(event);
    }

    /**
     * Enables or disables user interactions.
     *
     * @param {boolean} disable - If true, disables user interactions; if false, enables them.
     */
    disableInteractions(disable) {
        // 1. Prevent input to this.$textArea
        this.$textArea.disabled = disable;
    
        // 2. Prevent click on the deleteButtons
        const deleteButtons = this.$view.querySelectorAll('.delete');
        deleteButtons.forEach(button => {
            if (disable) {
                button.setAttribute('disabled', 'disabled'); // If the button is a real <button> or <input> element
                button.style.pointerEvents = 'none';         // For other elements like <span> or <div>
            } else {
                button.removeAttribute('disabled');
                button.style.pointerEvents = '';
            }
        });
    }

    textToHSL(text) {
        // Compute a hash from the text
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
    
        // Convert the hash into an integer between 0 and 360
        const range = 360
        let hue = hash % (range + 1);
        if (hue < 0) {
            hue += range;
        }
    
        const saturation = this.constantDeleteButtonBGColorSaturation;
        const lightness = this.constantDeleteButtonBGColorLightness; 
    
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}