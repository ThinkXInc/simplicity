/**
 * SingleTextInputPage is a subclass of Page that specifically represents a page with a single text field, title, and back/next buttons.
 *
 * @param {string} pageId - The id of this page.
 * @param {object} locale - The dictionary containing localized strings.
 * @param {string} lang - The current language. Default is 'en'.
 * @param {string} fieldName - The name of the field, used to create component id and locale keys. Default is 'single_text_input_field'.
 * @param {number} max_text_length - The maximum character count for the text field. Default is 140.
 * @param {number} init_rows - The initial number of rows in the text field. Default is 1.
 * @param {Array} validators - An array of Validator objects that should be used to validate the TextField. Default is an empty array.
 * @param {bool} hasBackButon - if the BackButton is shown.
 * 
 * @example
 * let myLocale = new Locale({
 *  'parentDiv__SingleTextInputPage__single_text_input_field__TextField__title': {'en': 'Name', 'fr': 'Nom'},
 *  'parentDiv__SingleTextInputPage__single_text_input_field__TextField__placeholder': {'en': 'Enter your name', 'fr': 'Entrez votre nom'},
 *  'parentDiv__SingleTextInputPage__Title__title': {'en': 'Signup', 'fr': 'Inscription'},
 *  'parentDiv__SingleTextInputPage__BackButton__title': {'en': 'Back', 'fr': 'Retour'},
 *  'parentDiv__SingleTextInputPage__NextButton__title': {'en': 'Next', 'fr': 'Suivant'},
 * });
 * let requiredValidator = new Validator(ValidationErrorType.required, 'This field is required');
 * let lengthValidator = new Validator(ValidationErrorType.length, 'The length of the text exceeds the limit', [140]);
 * let myPage = new SingleTextInputPage('parentDiv', 'SingleTextInputPage', myLocale, 'en', 'single_text_input_field', 140, 1, [requiredValidator, lengthValidator]);
 */
class SingleTextInputPage extends Page {
    constructor(pageId, locale, lang = 'en', 
                fieldName = 'single_text_input_field', 
                max_text_length = 140, init_rows = 1, validators = [],
                hasBackButton = true,
                ) {
        debuglog(`SingleTextInputPage initialize : pageId: ${pageId}`);
        // define default ids and locale keys
        let field_component_id = Page.generateComponentId(pageId, 'TextField', fieldName);
        let next_button_component_id = Page.generateComponentId(pageId, 'NextButton', 'next_button');
        let back_button_component_id = Page.generateComponentId(pageId, 'BackButton', 'back_button');
        let title_component_id = Page.generateComponentId(pageId, 'Title');
        
        // Locale keys are generated as {pageId}__{component class name}__{field name}__{role}
        let locale_key_field_title = Page.createLocaleKey(pageId, 'TextField', fieldName, 'title');
        let locale_key_field_placeholder = Page.createLocaleKey(pageId, 'TextField', fieldName, 'placeholder');
        let locale_key_title = Page.createLocaleKey(pageId, 'Title', 'title');
        let locale_key_back_button = Page.createLocaleKey(pageId, 'BackButton', 'title');
        let locale_key_next_button = Page.createLocaleKey(pageId, 'NextButton', 'title');

        let textField = new TextField(
            field_component_id,
            fieldName,
            TextFieldType.singleline,
            locale.get(locale_key_field_title, lang),
            locale.get(locale_key_field_placeholder, lang),
            'div',
            validators,
            max_text_length,
            init_rows,
            false,
            true,
            false
        );


        let title = new Title(title_component_id, locale.get(locale_key_title, lang));
        let nextButton = new NextButton(next_button_component_id, locale.get(locale_key_next_button, lang));

        let components = [title, textField]; // backButton removed from here

        // if the showBackButton is true, add the backButton component
        if (hasBackButton) {
            let backButton = new BackButton(back_button_component_id, locale.get(locale_key_back_button, lang));
            components.push(backButton); // add backButton to the components array
        }
        components.push(nextButton);

        super(pageId, components);
    }
}