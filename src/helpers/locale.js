/**
 * The Locale class provides a way to retrieve localized strings from a locale dictionary.
 * It ensures that keys and languages exist in the dictionary before returning a string and
 * throws descriptive errors if they do not. The `get` method also supports string interpolation 
 * to replace placeholders in the message with provided arguments.
 * 
 * @example
 * // Initialize a locale dictionary
 * const localeDict = {
 *   "first_name": {
 *     "en": "First Name",
 *     "es": "Nombre",
 *     "ja": "名"
 *   },
 *   "char_limit": {
 *     "en": "text must be $0 chars."
 *   }
 * };
 *
 * // Initialize a Locale instance with the dictionary
 * const locale = new Locale(localeDict);
 * 
 * // Retrieve the English term for "first_name"
 * console.log(locale.get("first_name", "en"));  // "First Name"
 * 
 * // Use string interpolation to replace $0 with "10" in "char_limit"
 * console.log(locale.get("char_limit", "en", 10));  // "text must be 10 chars."
 * 
 * @class
 */
class Locale {
    /**
     * Create a Locale instance.
     *
     * @param {Object} localeDictionary - The dictionary of localized strings.
     */
    constructor(localeDictionary) {
        this.localeDictionary = localeDictionary;
    }

    /**
     * Retrieve a localized string from the locale dictionary with optional string interpolation.
     * 
     * @param {string} key - The key of the localized string in the dictionary.
     * @param {string} lang - The language code of the localized string.
     * @param {...any} args - Optional arguments to replace placeholders in the localized string.
     * @throws {Error} Throws an error if the key or language is not found in the dictionary.
     * @return {string} The localized string with interpolated values if provided.
     * 
     * @example
     * // Using the locale instance from the class example
     * 
     * // Retrieve the Spanish term for "last_name"
     * console.log(locale.get("last_name", "es"));  // "Apellido"
     * 
     * // Retrieve the English term for "char_limit" with string interpolation
     * console.log(locale.get("char_limit", "en", 10));  // "text must be 10 chars."
     * 
     * // Attempt to retrieve a term for a nonexistent key
     * console.log(locale.get("middle_name", "en"));  // Error: Locale key "middle_name" not found in dictionary.
     * 
     * // Attempt to retrieve a term for a nonexistent language
     * console.log(locale.get("first_name", "de"));  // Error: Language "de" not found for key "first_name" in dictionary.
     */
    get(key, lang, ...args) {
        if (!this.localeDictionary.hasOwnProperty(key)) {
            throw new Error(`Locale key "${key}" not found in dictionary.`);
        }

        if (!this.localeDictionary[key].hasOwnProperty(lang)) {
            throw new Error(`Language "${lang}" not found for key "${key}" in dictionary.`);
        }

        let message = this.localeDictionary[key][lang];

        // Iterate over the arguments and replace placeholders
        args.forEach((arg, index) => {
            const placeholder = `$${index}`;
            message = message.replace(placeholder, arg);
        });

        return message;
    }
}
