// [DEPRECATED]
// simplicity/simplicity.js
// NOTE: This file is for webpack. But webpack is not used now.
// All files in /src are compiled into /dist by gulp. 
// See gulpfile.js and package.json.

// simplicity.js
import './css/simplicity_default.css';

import { countriesISO3166 } from '../src/data/countries.js';

import { debuglog } from '../src/etc/debug_log.js';

import { Http } from '../src/helpers/http.js';
import { Browser } from '../src/helpers/browser.js';
import { Locale } from '../src/helpers/locale.js';
import { Country } from '../src/helpers/country.js';
import { UserPreferences, userPreferences } from '../src/helpers/user_preferences.js'; 
import { Validator, ValidationErrorType } from '../src/helpers/validator.js';
import { Utils } from '../src/helpers/utils.js';

import { ViewComponentBase } from '../src/view_component_bases/view_component_base.js';
import { FormComponentBase } from '../src/view_component_bases/form_component_base.js';
import { LoadingComponentBase, LoadingProtocol } from '../src/view_component_bases/loading_component_base.js';
import { Wrapper } from '../src/view_component_bases/wrapper.js';

import { Title } from '../src/view_components/title.js';
import { NextButton } from '../src/view_components/next_button.js';
import { BackButton } from '../src/view_components/back_button.js';
import { TextFieldType, TextFieldState, TextFieldLoadingState, TextFieldValidationState, TextField, TextFieldProtocol } from '../src/view_components/textfield.js';
import { ListMenu, DropdownMenuType, DropdownMenuDisplayPositionType, DropdownButtonState, DropdownButton, DropdownButtonProtocol } from '../src/view_components/dropdown_button.js';
import { FileUploadViewShowingState, FileUploadViewUploadState, FileType, FileUploadTableViewCell, FileUploadView, FileUploadViewProtocol } from '../src/view_components/file_upload_view';
import { AlertMessageComponentBase, AlertMessageProtocol } from '../src/view_component_bases/alert_message_component_base';
import { AlertMessage } from '../src/view_components/alert_message.js';

import { Page } from '../src/view_component_bases/page.js';
import { LastNameFirstNamePage } from '../src/pages/last_name_first_name_page.js';
import { SingleTextInputPage } from '../src/pages/single_text_input_page';

import { InputPageViewController, InputPageViewControllerProtocol, InputPageViewDataModel } from '../src/view_controllers/input_page_view_controller.js';


const simplicity = {
    countriesISO3166,

    debuglog,

    Browser,
    Http,
    UserPreferences,
    userPreferences,
    Locale,
    Utils,
    Country,
    Validator,
    ValidationErrorType,

    ViewComponentBase,
    FormComponentBase,
    LoadingComponentBase,
    LoadingProtocol,

    Wrapper,
    Title,
    TextFieldType,
    TextFieldState,
    TextFieldLoadingState,
    TextFieldValidationState,
    TextField,
    TextFieldProtocol,
    DropdownButton,
    DropdownButtonProtocol,
    ListMenu,
    DropdownMenuType,
    DropdownMenuDisplayPositionType,
    DropdownButtonState,
    FileUploadViewShowingState, 
    FileUploadViewUploadState, 
    FileType, 
    FileUploadTableViewCell, 
    FileUploadView, 
    FileUploadViewProtocol,
    NextButton,
    BackButton,
    AlertMessageComponentBase,
    AlertMessageProtocol,
    AlertMessage,

    Page,
    LastNameFirstNamePage,
    SingleTextInputPage,

    InputPageViewController,
    InputPageViewDataModel,
    InputPageViewControllerProtocol,
 
    // other exports...
};

export default simplicity;

window.debuglog = simplicity.debuglog;
window.UserPreferences = simplicity.UserPreferences;
window.userPreferences = simplicity.userPreferences;

window.Browser = simplicity.Browser;
window.Http = simplicity.Http;
window.Locale = simplicity.Locale;
window.Utils = simplicity.Utils;
window.Country = simplicity.Country;
window.countriesISO3166 = simplicity.countriesISO3166;

window.Validator = simplicity.Validator;
window.ValidationErrorType = simplicity.ValidationErrorType;

window.ViewComponentBase = simplicity.ViewComponentBase;
window.FormComponentBase = simplicity.FormComponentBase;
window.LoadingComponentBase = simplicity.LoadingComponentBase;
window.LoadingProtocol = simplicity.LoadingProtocol;

window.Wrapper = simplicity.Wrapper;
window.Title = simplicity.Title;
window.TextFieldType = simplicity.TextFieldType;
window.TextFieldState = simplicity.TextFieldState;
window.TextFieldLoadingState = simplicity.TextFieldLoadingState;
window.TextFieldValidationState = simplicity.TextFieldValidationState;
window.TextField = simplicity.TextField;
window.TextFieldProtocol = simplicity.TextFieldProtocol;
window.ListMenu = simplicity.ListMenu;
window.DropdownMenuType = simplicity.DropdownMenuType;
window.DropdownMenuDisplayPositionType = simplicity.DropdownMenuDisplayPositionType;
window.DropdownButtonState = simplicity.DropdownButtonState;
window.DropdownButton = simplicity.DropdownButton;
window.DropdownButtonProtocol = simplicity.DropdownButtonProtocol;
window.FileUploadViewShowingState = simplicity.FileUploadViewShowingState;
window.FileUploadViewUploadState = simplicity.FileUploadViewUploadState;
window.FileType = simplicity.FileType; 
window.FileUploadTableViewCell = simplicity.FileUploadTableViewCell; 
window.FileUploadView = simplicity.FileUploadView;
window.FileUploadViewProtocol = simplicity.FileUploadViewProtocol;
window.NextButton = simplicity.NextButton;
window.BackButton = simplicity.BackButton;
window.AlertMessageComponentBase = AlertMessageComponentBase;
window.AlertMessageProtocol = AlertMessageProtocol;
window.AlertMessage = AlertMessage;
 
window.Page = simplicity.Page;
window.LastNameFirstNamePage = simplicity.LastNameFirstNamePage;
window.SingleTextInputPage = simplicity.SingleTextInputPage;

window.InputPageViewController = simplicity.InputPageViewController;
window.InputPageViewDataModel = simplicity.InputPageViewDataModel;
window.InputPageViewControllerProtocol = simplicity.InputPageViewControllerProtocol;
//