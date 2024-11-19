/**
 * Flashes the text of a given text displaying element.
 *
 * @param {Element} element - The text displaying element.
 * @param {string} propertyName - The name of the property to be modified (e.g. 'innerText', 'value', 'title').
 * @param {string} text - The text to be displayed.
 * @param {number} [duration=30] - The duration between each character flash.
 * @param {number} [delay=0] - The initial delay before the animation starts.
 * @param {boolean} [isCursor=true] - Whether to display the cursor effect using the left half block.
 */
function flashText(element, propertyName, text, duration = 30, delay = 0, cursorChar = '\u258C', isCursor = true, callback) {
    // Ensure the element has the specified property
    if (!(propertyName in element)) {
        throw new Error(`Element ${element} does not have property: ${propertyName}`);
    }

    // Variable to store interval ID
    let flashIntervalId;

    // Initial text
    let currentText = "";
    let index = 0;

    // Function to update text and cursor
    const updateText = () => {
        if (index < text.length) {
            currentText += text[index];
            if (isCursor) {
                element[propertyName] = currentText + cursorChar;
            } else {
                element[propertyName] = currentText;
            }
            index++;
        } else {
            // Remove the cursor and update the property
            element[propertyName] = currentText;
            clearInterval(flashIntervalId); // Clear the interval
            // Call the callback if provided
            if (typeof callback === 'function') {
                callback();
            }
        }
    };

    // Start after the initial delay
    setTimeout(() => {
        flashIntervalId = setInterval(updateText, duration);
    }, delay);
}

/**
 * Truncates a given text to a specified maximum number of characters and appends a suffix if the text is truncated.
 * 
 * @param {string} text - The text to be truncated.
 * @param {number} maxCharacterLength - The maximum number of characters the text should have after truncation.
 * @param {string} [suffix="..."] - The string to append to the truncated text.
 * 
 * @returns {string} - The truncated text with the suffix appended, if applicable.
 * 
 * @example
 * 
 * truncateText('This is a long text.', 5);          // Returns "This ..."
 * truncateText('Short text', 20);                   // Returns "Short text"
 * truncateText('Another example.', 10, '>>>');      // Returns "Another >>>"
 */
function truncateText(text, maxCharacterLength, suffix = "...") {
    if (maxCharacterLength === undefined || maxCharacterLength === null) {
        throw new Error("The maxCharacterLength parameter must be provided.");
    }

    if (text.length <= maxCharacterLength) {
        return text;
    }

    const truncatedTextLength = maxCharacterLength - suffix.length;
    return text.slice(0, truncatedTextLength) + suffix;
}