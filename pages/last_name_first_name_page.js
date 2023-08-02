/**
 * LastNameFirstNamePage is a subclass of Page that specifically represents a page with text fields for last name and first name, and back/next buttons.
 *
 * @param {string} parent_id - The id of the parent element in which this page is placed.
 * @param {string} page_id - The id of page
 * @param {object} locale - The dictionary containing localized strings.
 * @param {string} lang - The current language. Default is 'en'.
 * @param {string} locale_key_first_name_title - The key for the first name title in the locale dictionary.
 * @param {string} locale_key_first_name_placeholder - The key for the first name placeholder in the locale dictionary.
 * @param {string} locale_key_last_name_title - The key for the last name title in the locale dictionary.
 * @param {string} locale_key_last_name_placeholder - The key for the last name placeholder in the locale dictionary.
 * @param {string} locale_key_title - The key for the page title in the locale dictionary.
 * @param {string} locale_key_back_button - The key for the back button text in the locale dictionary.
 * @param {string} locale_key_next_button - The key for the next button text in the locale dictionary.
 * @param {number} max_text_count - The maximum character count for the text fields. Default is 140.
 * @param {number} init_rows - The initial number of rows in the text fields. Default is 1.
 * @param {bool} hasBackButon - if the BackButton is shown.
 * 
 * @example
 * let myLocale = {
 *  'first_name_text_field_title': {'en': 'First Name', 'fr': 'Prénom'},
 *  'first_name_text_field_placeholder': {'en': 'Enter your first name', 'fr': 'Entrez votre prénom'},
 *  'last_name_text_field_title': {'en': 'Last Name', 'fr': 'Nom'},
 *  'last_name_text_field_placeholder': {'en': 'Enter your last name', 'fr': 'Entrez votre nom'},
 *  'page_title': {'en': 'Signup', 'fr': 'Inscription'},
 *  'back_button_text': {'en': 'Back', 'fr': 'Retour'},
 *  'next_button_text': {'en': 'Next', 'fr': 'Suivant'},
 * };
 * let lastNameFirstNamePage = new LastNameFirstNamePage('signupView', myLocale, 'en');
 */
class LastNameFirstNamePage extends Page {
    constructor(
        parent_id, 
        page_id, 
        locale, 
        lang = 'en',
        max_text_count = 140, 
        init_rows = 1,
        first_name_field_name = 'first_name',
        last_name_field_name = 'last_name',
        validators = [],
        hasBackButton = true,
    ) {
        debuglog(`LastNameFirstNamePage initialize parent_id: ${parent_id}, page_id: ${page_id}`);

        // define default ids and locale keys
        let first_name_component_id = Page.createComponentId(parent_id, page_id, 'TextField', first_name_field_name);
        let last_name_component_id = Page.createComponentId(parent_id, page_id, 'TextField', last_name_field_name);
        let next_button_component_id = Page.createComponentId(parent_id, page_id, 'NextButton', 'next_button');
        let back_button_component_id = Page.createComponentId(parent_id, page_id, 'BackButton', 'back_button');
        let title_component_id = Page.createComponentId(parent_id, page_id, 'Title');

        // Locale keys are generated as {page_id}__{component class name}__{field name}__{role}
        let locale_key_first_name_title = Page.createLocaleKey(page_id, 'TextField', first_name_field_name, 'title');
        let locale_key_first_name_placeholder = Page.createLocaleKey(page_id, 'TextField', first_name_field_name, 'placeholder');
        let locale_key_last_name_title = Page.createLocaleKey(page_id, 'TextField', last_name_field_name, 'title');
        let locale_key_last_name_placeholder = Page.createLocaleKey(page_id, 'TextField', last_name_field_name, 'placeholder');
        let locale_key_title = Page.createLocaleKey(page_id, 'Title', 'title');
        let locale_key_back_button = Page.createLocaleKey(page_id, 'BackButton', 'title');
        let locale_key_next_button = Page.createLocaleKey(page_id, 'NextButton', 'title');
        
        // Initialize the TextFields
        let firstNameField = new TextField(
            parent_id,  // Parent Component ID
            first_name_component_id,  // This TextField Component ID
            first_name_field_name,  // This TextField's field name
            TextFieldType.singleline,  // Type of TextField
            locale.get(locale_key_first_name_title, lang),  // Title for TextField
            locale.get(locale_key_first_name_placeholder, lang),  // Placeholder for TextField
            'div',  // HTML Tag for TextField
            validators,  // Validators for TextField
            max_text_count,  // Maximum number of characters allowed
            init_rows,  // Initial number of rows in the TextField
            false,  // vertical_flex: if the TextField should vertically flex to fill space
            true,  // has_title: if the TextField should have a title
            false  // password_mode: if the TextField is for password input
        );

        let lastNameField = new TextField(
            parent_id,
            last_name_component_id,
            last_name_field_name,
            TextFieldType.singleline,
            locale.get(locale_key_last_name_title, lang),
            locale.get(locale_key_last_name_placeholder, lang),
            'div',
            validators,
            max_text_count,
            init_rows,
            false,
            true,
            false
        );

        // Initialize the Title
        let title = new Title(parent_id, title_component_id, locale.get(locale_key_title, lang));

        // Initialize the Buttons
        let nextButton = new NextButton(parent_id, next_button_component_id, locale.get(locale_key_next_button, lang));

        let components = [title, firstNameField, lastNameField];

        // if the showBackButton is true, add the backButton component
        if (hasBackButton) {
            let backButton = new BackButton(parent_id, back_button_component_id, locale.get(locale_key_back_button, lang));
            components.push(backButton); // add backButton to the components array
        }
        components.push(nextButton);

        // Call the constructor of the base class with possibly added backButton
        super(parent_id, page_id, components); 
    }
}
