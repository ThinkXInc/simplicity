/**
 * SingleTextInputPage is a subclass of Page that specifically represents a page with a single text field, title, and back/next buttons.
 *
 * @param {string} parent_id - The id of the parent element in which this page is placed.
 * @param {object} locale - The dictionary containing localized strings.
 * @param {string} lang - The current language. Default is 'en'.
 * @param {string} locale_key_field_title - The key for the field title in the locale dictionary.
 * @param {string} locale_key_field_placeholder - The key for the field placeholder in the locale dictionary.
 * @param {string} locale_key_title - The key for the page title in the locale dictionary.
 * @param {string} locale_key_back_button - The key for the back button text in the locale dictionary.
 * @param {string} locale_key_next_button - The key for the next button text in the locale dictionary.
 * @param {number} max_text_count - The maximum character count for the text field. Default is 140.
 * @param {number} init_rows - The initial number of rows in the text field. Default is 1.
 * 
 * @example
 * let myLocale = {
 *  'field_title': {'en': 'Name', 'fr': 'Nom'},
 *  'field_placeholder': {'en': 'Enter your name', 'fr': 'Entrez votre nom'},
 *  'page_title': {'en': 'Signup', 'fr': 'Inscription'},
 *  'back_button_text': {'en': 'Back', 'fr': 'Retour'},
 *  'next_button_text': {'en': 'Next', 'fr': 'Suivant'},
 * };
 * let myPage = new SingleTextInputPage('parentDiv', myLocale, 'en');
 */
class SingleTextInputPage extends Page {
    // Component ids
    __field_component_id__ = 'singleTextField';
    __next_button_component_id__ = 'singleTextFieldPageNextButton';
    __back_button_component_id__ = 'singleTextFieldPageBackButton';
    __title_component_id__ = 'singleTextFieldPageTitle';
    __field_name__ = 'single_text_input_field';

    constructor(parent_id, id, locale, lang = 'en', 
                locale_key_field_title = 'single_text_input_field_title', 
                locale_key_field_placeholder = 'single_text_input_field_placeholder', 
                locale_key_title = 'single_text_input_title',
                locale_key_back_button = 'single_text_input_back_button_text',
                locale_key_next_button = 'single_text_input_next_button_text', 
                max_text_count = 140, init_rows = 1) {
        
        let requiredValidator = new Validator(this.__field_component_id__, ValidationErrorType.required, 'This field is required');
        let lengthValidator = new Validator(this.__field_component_id__, ValidationErrorType.length, 'The length of the text exceeds the limit', [max_text_count]);
        let validators = [requiredValidator, lengthValidator];

        let textField = new TextField(
            parent_id,
            this.__field_component_id__,
            TextFieldType.singleline,
            locale[locale_key_field_title][lang],
            this.__field_name__,
            locale[locale_key_field_placeholder][lang],
            'div',
            validators,
            max_text_count,
            init_rows,
            false,
            true,
            false
        );

        let title = new Title(parent_id, this.__title_component_id__, locale[locale_key_title][lang]);
        let backButton = new BackButton(parent_id, this.__back_button_component_id__, locale[locale_key_back_button][lang]);
        let nextButton = new NextButton(parent_id, this.__next_button_component_id__, locale[locale_key_next_button][lang]);

        let components = [title, textField, backButton, nextButton];

        super(parent_id, id, components);
    }
}
