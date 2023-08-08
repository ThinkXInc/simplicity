/**
 * NOTE: This is an untested draft.
 * 
 * Class representing an Address Input Page containing multiple view components:
 * back button, title, postal code input, city input, province input, address1 input,
 * address2 input, position map, country code dropdown, telephone input, and next button.
 *
 * @extends Page
 *
 * @example
 *
 * // Define localization dictionary
 * const locale = {
 *     'page_2_backbutton_title': { 'en': 'Back' },
 *     'page_2_title': { 'en': 'Address Input' },
 *     //...
 * }
 *
 * // Initialize an instance of AddressInputPage
 * const addressInputPage = new AddressInputPage('signupView', 'addressInputPage', locale, 'en');
 * 
 * // Or with different localization keys
 * const customAddressInputPage = new AddressInputPage(
 *     'signupView', 
 *     'addressInputPage', 
 *     locale, 
 *     'en',
 *     countries,  // data/countries.js
 *     'custom_backbutton_title',
 *     'custom_title',
 *     //...
 * );
 *
 * @param {string} parent_id - The id of the parent component.
 * @param {string} id - The id of this page.
 * @param {Object} locale - A dictionary containing localization text.
 * @param {string} lang - The language to display (default: 'en').
 * @param {Object} countries - A dictionary containing countries data.
 * @param {string} locale_key_title - Localization key for the title text (default: 'page_2_title').
 * @param {string} locale_key_back_button - Localization key for the back button text (default: 'page_2_backbutton_title').
 * @param {string} locale_key_next_button - Localization key for the next button text (default: 'page_2_nextbutton_title').
 * @param {string} locale_key_postal_code_title - Localization key for the postal code title (default: 'page_2_zipcode_title').
 * @param {string} locale_key_postal_code_placeholder - Localization key for the postal code placeholder (default: 'page_2_zipcode_placeholder').
 * @param {string} locale_key_city_title - Localization key for the city title (default: 'page_2_city_title').
 * @param {string} locale_key_city_placeholder - Localization key for the city placeholder (default: 'page_2_city_placeholder').
 * @param {string} locale_key_province_title - Localization key for the province title (default: 'page_2_province_title').
 * @param {string} locale_key_province_placeholder - Localization key for the province placeholder (default: 'page_2_province_placeholder').
 * @param {string} locale_key_address1_title - Localization key for the address1 title (default: 'page_2_address1_title').
 * @param {string} locale_key_address1_placeholder - Localization key for the address1 placeholder (default: 'page_2_address1_placeholder').
 * @param {string} locale_key_address2_title - Localization key for the address2 title (default: 'page_2_address2_title').
 * @param {string} locale_key_address2_placeholder - Localization key for the address2 placeholder (default: 'page_2_address2_placeholder').
 * @param {string} locale_key_position_map_label - Localization key for the position map label (default: 'page_2_positionmap_label').
 * @param {string} locale_key_country_code_title - Localization key for the country code title (default: 'page_2_telcountry_title').
 * @param {string} locale_key_country_code_description - Localization key for the country code description (default: 'page_2_telcountry_description').
 * @param {string} locale_key_tel_title - Localization key for the tel title (default: 'page_2_tel_title').
 * @param {string} locale_key_tel_placeholder - Localization key for the tel placeholder (default: 'page_2_tel_placeholder').
 */
class AddressInputPage extends Page {
    // Component ids
    __back_button_component_id__ = 'addressInputPageBackButton';
    __next_button_component_id__ = 'addressInputPageNextButton';
    __title_component_id__ = 'addressInputPageTitle';
    __postal_code_component_id__ = 'addressInputPagePostalCode';
    __city_component_id__ = 'addressInputPageCity';
    __province_component_id__ = 'addressInputPageProvince';
    __address_1_component_id__ = 'addressInputPageAddress1';
    __address_2_component_id__ = 'addressInputPageAddress2';
    __position_map_component_id__ = 'addressInputPagePositionMap';
    __country_code_component_id__ = 'addressInputPageCountryCode';
    __tel_component_id__ = 'addressInputPageTel';

    constructor(parent_id, id, locale, lang = 'en', 
                countries,
                locale_key_title = 'page_2_title',
                locale_key_back_button = 'page_2_backbutton_title',
                locale_key_next_button = 'page_2_nextbutton_title',
                locale_key_postal_code_title = 'page_2_postal_code_title',
                locale_key_postal_code_placeholder = 'page_2_postal_code_placeholder',
                locale_key_city_title = 'page_2_city_title',
                locale_key_city_placeholder = 'page_2_city_placeholder',
                locale_key_province_title = 'page_2_province_title',
                locale_key_province_placeholder = 'page_2_province_placeholder',
                locale_key_address1_title = 'page_2_address1_title',
                locale_key_address1_placeholder = 'page_2_address1_placeholder',
                locale_key_address2_title = 'page_2_address2_title',
                locale_key_address2_placeholder = 'page_2_address2_placeholder',
                locale_key_position_map_label = 'page_2_positionmap_label',
                locale_key_country_code_title = 'page_2_telcountry_title',
                locale_key_country_code_description = 'page_2_telcountry_description',
                locale_key_tel_title = 'page_2_tel_title',
                locale_key_tel_placeholder = 'page_2_tel_placeholder') {

        let backButton = new BackButton(parent_id, this.__back_button_component_id__, locale[locale_key_back_button][lang]);
        let title = new Title(parent_id, this.__title_component_id__, locale[locale_key_title][lang]);
        let postalCode = new TextField(parent_id, this.__postal_code_component_id__, TextFieldType.singleline, locale[locale_key_postal_code_title][lang], 'postal_code', locale[locale_key_postal_code_placeholder][lang], 30, 1, false);
        let city = new TextField(parent_id, this.__city_component_id__, TextFieldType.singleline, locale[locale_key_city_title][lang], 'city', locale[locale_key_city_placeholder][lang], 40, 1, false);
        let province = new TextField(parent_id, this.__province_component_id__, TextFieldType.singleline, locale[locale_key_province_title][lang], 'province', locale[locale_key_province_placeholder][lang], 40, 1, false);
        let address1 = new TextField(parent_id, this.__address_1_component_id__, TextFieldType.singleline, locale[locale_key_address1_title][lang], 'address1', locale[locale_key_address1_placeholder][lang], 100, 1, false);
        let address2 = new TextField(parent_id, this.__address_2_component_id__, TextFieldType.singleline, locale[locale_key_address2_title][lang], 'address2', locale[locale_key_address2_placeholder][lang], 100, 0, false);
        
        // position map and tel country code need proper classes and handling
        let positionMap = new PositionMap(parent_id, this.__position_map_component_id__, 'lat', 'lng', defaultCoordinate, defaultCoordinate, locale[locale_key_position_map_label][lang]);
        let telCountryCode = new DropdownButton(parent_id, this.__country_code_component_id__, locale[locale_key_country_code_title][lang], locale[locale_key_country_code_description][lang], 'tel_country_code', DropdownMenuType.list, DropdownMenuDisplayPositionType.upperover, countries.dials.map((dial, i) => new ListMenu(`${countries.names[i]} +${dial}`, dial)));

        let tel = new TextField(parent_id, this.__tel_component_id__, TextFieldType.singleline, locale[locale_key_tel_title][lang], 'tel', locale[locale_key_tel_placeholder][lang], 20, 1, false);
        let nextButton = new NextButton(parent_id, this.__next_button_component_id__, locale[locale_key_next_button][lang]);

        let components = [backButton, title, postalCode, city, province, address1, address2, positionMap, telCountryCode, tel, nextButton];
        super(parent_id, id, components);
    }
}

