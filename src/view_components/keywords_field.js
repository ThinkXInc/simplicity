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
 *    <div id="this.__id__" class="textField">
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
 *  const keywordsField = new KeywordsField('parent_id', 'id', ...);
 * 
 *  keywordsField.$textField.addEventListener(keywordsFieldCustomEventSubmit, (event) => {
 *      const keywords = event.detail.keywords;
 *      
 *  });
 */
class KeywordsField extends TextField {
    /**
     * Constructs a new KeywordsField.
     *
     * @param {string} parent_id - The ID of the parent DOM element.
     * @param {string} id - The ID for the keyword field.
     * @param {string} field_name - The name attribute for the input field.
     * @param {string} title - The title of the keyword field.
     * @param {string} locale - The locale for the field (e.g., 'en', 'fr').
     * @param {string} placeholder - The placeholder text for the input.
     * @param {string} lang - The language of the content.
     * @param {function[]} validators - Array of validation functions.
     * @param {number} max_text_length - The maximum length of text allowed in the input.
     * @param {string} pressText - Text indicating the key press action, default is 'press'.
     * @param {string} enterText - Text for the Enter key, default is 'Enter ↵'.
     * @param {boolean} cookieExclude - If true, exclude from cookie storage.
     * @param {boolean} isDefaultValueRestoredFromCookie - If true, restore default value from cookie.
     */
    constructor(
        parent_id,
        id,
        field_name,
        title,
        locale,
        placeholder,
        lang,
        validators,
        max_text_length,
        pressText = 'press',
        enterText = 'Enter ↵',
        cookieExclude = true,
        isDefaultValueRestoredFromCookie = false,
        ) {

        super(
            parent_id, 
            id, 
            field_name, 
            TextFieldType.singleline,
            title, 
            placeholder,
            'div', 
            validators, 
            max_text_length, 
            1,
            false, // vertical_flex
            false,  // has_title
            false,  // password_mode
            null,  // defaultValue
            cookieExclude,   // cookieExclude
            false,  // hasCookiePrefix
            isDefaultValueRestoredFromCookie,  // isDefaultValueRestoredFromCookie
            null, //scrollControlElementId
            false // isCounterDisplayed
        )

        this.__lang__ = lang;
        this.locale = locale;
        this.__max_text_length__ = max_text_length;
        this.__press_text__ = pressText;
        this.__enter_text__ = enterText;

        this._addElements();
        this._addEventHandlers();

        this.keywords = [];
        this.onEdit = false;
        this.materialId = null;
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
        this.submitKeywords();
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
     *    <div id="{this.__id__}" class="textField">
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
     *          <input class="{this.__field_name__}form" name="{this.__field_name__}" type="text" autocomplete="off">
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
    _addElements() {
        const $keywords = document.createElement('ul');
        $keywords.className = keywordsFieldKeywordsClassName;
        this.$inputOuter.appendChild($keywords);
        this.$keywords = $keywords;

        const $press = document.createElement('p');
        $press.className = keywordsFieldPressClassName;
        $press.innerHTML = `${this.__press_text__}<strong>${this.__enter_text__}</strong>`;
        this.$inputOuter.appendChild($press);
        this.$press = $press;
    }

    /**
     * Adds event listeners to the keyword elements.
     * This method listens for delete button clicks and Enter key press events.
     */
    _addEventHandlers() {
        // Handle delete button click
        const $deleteButtons = document.querySelectorAll('.delete');
        $deleteButtons.forEach(($button, index) => {
            $button.addEventListener('click', () => {
                this.removeKeyword(index);
            });
        });

        // Handle Enter key press in the $textArea
        this.$textArea.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') { // 13 is the keyCode for Enter
                const keyword = this.$textArea.value.trim(); // get the input value and trim any whitespace
                if (keyword) { // only if there's a non-empty keyword
                    this.addKeyword(keyword);
                    this.$textArea.value = ''; // Clear the input for the next keyword
                }
            }
        });
    }

    /**
     * Add keyword to list.
     * 
     * @param {*} keyword 
     */
    addKeyword(keyword) {
        // Update the internal list
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
        $keywordItem.appendChild($deleteButton);

        this.$keywords.appendChild($keywordItem);
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
    removeKeyword(index) {
        if (index >= 0 && index < this.keywords.length) {
            // Update the internal list
            this.keywords.splice(index, 1);
    
            // Remove the keyword from the DOM
            const keywordItemToRemove = this.$keywords.childNodes[index];
            this.$keywords.removeChild(keywordItemToRemove);
        } else {
            console.error(`Invalid index ${index} provided to removeKeyword.`);
        }
    }

    /**
     * Clears all keywords from the list.
     */
    clearKeywords() {
        // Update the internal list
        this.keywords = [];

        // Clear all children of the keywords ul
        while (this.$keywords.firstChild) {
            this.$keywords.removeChild(this.$keywords.firstChild);
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

}