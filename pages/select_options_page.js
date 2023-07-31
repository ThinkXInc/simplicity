/**
 * SelectOptionsPage is a subclass of Page that specifically represents a page with a set of options, title, and back/next buttons.
 *
 * @param {string} parent_id - The id of the parent element in which this page is placed.
 * @param {string} id - The id for the page.
 * @param {array} options - The array of Option objects to present in the page.
 * @param {object} locale - The dictionary containing localized strings.
 * @param {string} lang - The current language. Default is 'en'.
 * @param {string} locale_key_title - The key for the page title in the locale dictionary. Default is 'select_option_title'.
 * @param {string} locale_key_back_button - The key for the back button text in the locale dictionary. Default is 'select_option_back_button_text'.
 * @param {string} locale_key_next_button - The key for the next button text in the locale dictionary. Default is 'select_option_next_button_text'.
 *
 * @example
 *
 * const Gender = Object.freeze({ male: 1, female: 2, others: 3 });
 * signupLocale = {...}
 * const lang = 'en'
 * const options = [
 *  new Option(signupLocale['gender_male_option_title'][lang], Gender.male),
 *  new Option(signupLocale['gender_female_option_title'][lang], Gender.female),
 *  new Option(signupLocale['gender_others_option_title'][lang], Gender.others),
 * ]
 * let selectGenderPage = new SelectOptionPage('signupView', 'selectGenderPage', options, signupLocale, 'en')
 */
class SelectOptionsPage extends Page {
    // Component ids
    __options_component_id__ = 'options';
    __next_button_component_id__ = 'selectOptionsPageNextButton';
    __back_button_component_id__ = 'selectOptionsPageBackButton';
    __title_component_id__ = 'selectOptionsPageTitle';

    constructor(parent_id, id, options, locale, lang = 'en',
                locale_key_title = 'select_options_title',
                locale_key_back_button = 'select_options_back_button_text',
                locale_key_next_button = 'select_options_next_button_text') {
        
        let title = new Title(parent_id, this.__title_component_id__, locale[locale_key_title][lang]);
        let backButton = new BackButton(parent_id, this.__back_button_component_id__, locale[locale_key_back_button][lang]);
        let nextButton = new NextButton(parent_id, this.__next_button_component_id__, locale[locale_key_next_button][lang]);

        let optionField = new OptionField(
            parent_id,
            this.__options_component_id__,
            options, 
            // assuming other required parameters here like HTML tag, validators, etc.
        );

        let components = [title, optionField, backButton, nextButton];

        super(parent_id, id, components);
    }
}
