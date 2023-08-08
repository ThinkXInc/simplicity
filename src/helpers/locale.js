/**
 * The Locale class provides a way to retrieve localized strings from a locale dictionary.
 * It ensures that keys and languages exist in the dictionary before returning a string and
 * throws descriptive errors if they do not.
 * 
 * @example
 * // Initialize a locale dictionary
 * const localeDict = {
 *   "first_name": {
 *     "en": "First Name",
 *     "es": "Nombre",
 *     "ja": "名"
 *   },
 *   "last_name": {
 *     "en": "Last Name",
 *     "es": "Apellido",
 *     "ja": "姓"
 *   }
 * };
 *
 * // Initialize a Locale instance with the dictionary
 * const locale = new Locale(localeDict);
 * 
 * // Retrieve the English term for "first_name"
 * console.log(locale.get("first_name", "en"));  // "First Name"
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
     * Retrieve a localized string from the locale dictionary.
     * 
     * @param {string} key - The key of the localized string in the dictionary.
     * @param {string} lang - The language code of the localized string.
     * @throws {Error} Throws an error if the key or language is not found in the dictionary.
     * @return {string} The localized string.
     * 
     * @example
     * // Using the locale instance from the class example
     * 
     * // Retrieve the Spanish term for "last_name"
     * console.log(locale.get("last_name", "es"));  // "Apellido"
     * 
     * // Attempt to retrieve a term for a nonexistent key
     * console.log(locale.get("middle_name", "en"));  // Error: Locale key "middle_name" not found in dictionary.
     * 
     * // Attempt to retrieve a term for a nonexistent language
     * console.log(locale.get("first_name", "de"));  // Error: Language "de" not found for key "first_name" in dictionary.
     */
    get(key, lang) {
        if (!this.localeDictionary.hasOwnProperty(key)) {
            throw new Error(`Locale key "${key}" not found in dictionary.`);
        }

        if (!this.localeDictionary[key].hasOwnProperty(lang)) {
            throw new Error(`Language "${lang}" not found for key "${key}" in dictionary.`);
        }

        return this.localeDictionary[key][lang];
    }
}
