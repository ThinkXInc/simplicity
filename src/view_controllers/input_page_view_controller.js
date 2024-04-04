'use strict';
/**
 * @fileoverview simplicity/view_controllers/input_page_view_controller.js
 * 
 * InputPageViewController
 * 
 * This class serves as the base class for all form interaction view controllers,
 * such as the SignupViewController.
 * 
 * It constructs views using the following components:
 * 
 *  - TextField: text input from textfield.js
 *  - DropdownButton: select with table from dropdown_button.js
 *  - RadioButton: select with radio buttons from radio_button.js *todo
 *  - Title: title of the form field or page
 *  - Description: description of the form field or page
 *  - FieldTitle: title of a specific field *todo
 *  - FieldDescription: description of a specific field *todo
 *  - AlertText: alert or error message text
 *  - NextButton: button for navigating to the next page
 *  - BackButton: button for navigating to the previous page
 * 
 * Subclasses of InputPageViewController primarily focus on the validation of each form value.
 * 
 * This class provides the following common functionalities:
 *  1. Values are retained in the cookie during each page transition.
 *  2. The URL is rewritten using JavaScript for each screen transition.
 *  3. Values are not lost when the browser reloads or navigates back.
 * 
 * @author kaz@thinkxinc.com (Kazuki Otsuka)
 **/

class InputPageViewDataModel {
    // TODO:
    //  inherit constructor in child class by 
    //  super(defaults);
    // 
    // NOTE:
    //  Object.assign(this, defaults);
    //  doesn't refer to the child object.

    //constructor(defaults = {}) {
    //    Object.assign(this, defaults);
    //}
    json() {
        return JSON.stringify(this);
    }
}

class InputPageViewControllerConfig {
    constructor({
        dataModelClass = InputPageViewDataModel, // Default to a generic data model if not specified
        url = '',
        loading = false,
        alertMessage = null, // Set up inside the constructor if null
        defaultPageIndex = 0,
        isEnterButtonToNext = true,
        isPageIndexInHash = false,
        preventDefaultPageControl = false
    } = {}) {
        this.dataModelClass = dataModelClass;
        this.url = url;
        this.loading = loading;
        this.alertMessage = alertMessage;
        this.defaultPageIndex = defaultPageIndex;
        this.isEnterButtonToNext = isEnterButtonToNext;
        this.isPageIndexInHash = isPageIndexInHash;
        this.preventDefaultPageControl = preventDefaultPageControl;
    }
}

class InputPageViewControllerProtocol {
    completeSubmission() {
        throw new Error('Subclasses must override this method');
    }
}

class InputPageViewController {
    _pageIndex = null;  // Current page index
    _values = {};  // Object for storing form values
    
    _pages = [];
    _components = [];  // Array for storing all form components
    _pageComponents = [];  // [[comp 0 in page 0, comp 1 in page 0, ..], [..],..]
    
    _locale = null;  // Locale text dictionary 
    _lang = null;  // Language of the user

    constructor(id, pages, locale, lang, config = new InputPageViewControllerConfig()) {
        this.id = id;
        this.pages = pages;
        this.locale = locale;
        this.lang = lang;

        // Use destructuring to apply configuration properties to the instance
        Object.assign(this, {
            submitUrl: config.url,
            alertMessage: config.alertMessage || new AlertMessage(`${id}__AlertMessage`),
            isEnterButtonToNext: config.isEnterButtonToNext,
            isPageIndexInHash: config.isPageIndexInHash,
            preventDefaultPageControl: config.preventDefaultPageControl,
        });


        // Potentially check protocol adherence here
        this._checkProtocolAdherence();
        this._checkProtocolAdherenceForSubClass();

        // setup page components
        this._setElements(pages);

        // set events
        this._setEventHandlers();

        // data model
        this.dataModel = config.dataModelClass;
        //this._resetValuesInCookie(); // DEBUG:

        // defalut values are set to each component
        console.table(this._values);
        console.log(`data model for ${this.id} initialized`);

        // locale
        console.log(locale);
        console.log(lang);
        if (this.locale == null) {
            console.warn(`no locale json data found.`);
        } else {
            console.log('locale json data found');
        }
        if (this.lang == null) {
            console.warn(`no language information is given.`);
        } else {
            console.log(`initial language is set as ${lang}`);
        }

        // loading
        this.loading = config.loading

        // start page index
        this.pageIndex = config.defaultPageIndex;
    }

    /**
     * This method checks the adherence of the InputPageViewController to the defined protocols.
     * The protocols checked are: NextButtonProtocol, BackButtonProtocol, TextFieldProtocol, and DropdownButtonProtocol.
     * If a required method from a protocol is not implemented, it will throw an error.
     */
    _checkProtocolAdherence() {
        this._checkProtocolAdherenceForClass(NextButtonProtocol);
        this._checkProtocolAdherenceForClass(BackButtonProtocol);
        this._checkProtocolAdherenceForClass(TextFieldProtocol);
        this._checkProtocolAdherenceForClass(DropdownButtonProtocol);
        this._checkProtocolAdherenceForClass(PositionMapProtocol);
        this._checkProtocolAdherenceForClass(FileUploadViewProtocol);
        this._checkProtocolAdherenceForClass(LoadingProtocol);
    }

    /**
     * This method checks the adherence of the InputPageViewController to a given protocol class.
     * It creates an instance of the protocol class, iterates over its methods, and checks that each is implemented in the InputPageViewController.
     * If a required method is not implemented, it will throw an error.
     * 
     * @param {Object} protocolClass - The protocol class to check adherence to.
     * @throws {Error} If a required method from the protocol class is not implemented.
     */
    _checkProtocolAdherenceForClass(protocolClass) {
        Object.getOwnPropertyNames(protocolClass.prototype).forEach(methodName => {
            if (methodName !== "constructor" && typeof this[methodName] !== "function") {
                throw new Error(`InputPageViewController must implement ${methodName} method of ${protocolClass.name}`);
            }
        });
    }

    /**
     * Checks if all methods from InputPageViewControllerProtocol are implemented.
     */
    _checkProtocolAdherenceForSubClass() {
        Object.getOwnPropertyNames(InputPageViewControllerProtocol.prototype).forEach(methodName => {
            if (methodName !== "constructor" && typeof this[methodName] !== "function") {
                throw new Error(`Subclasses must implement ${methodName} method of InputPageViewControllerProtocol`);
            }
        });
    }

    /**
     * pageIndex setter / getter
     * 
     * Display only the pageIndex in current state.
     */
    set pageIndex(pageIndex) {
        const previousPageIndex = this._pageIndex;
        debuglog(`pageIndex changed ${previousPageIndex} -> ${pageIndex}`)
        this._pageIndex = pageIndex;
        // display only the page in current state.
        let $pages = this.$inputPageView.querySelectorAll('.inputPageViewPage')
        $pages.forEach(($page, i) => {
            if (parseInt($page.dataset.pageIndex) == this._pageIndex) {
                if (!this.preventDefaultPageControl) {$page.classList.add('show')};
                $page.style.display = "flex";
                $page.style.flexDirection = "column";
            } else if (!this.preventDefaultPageControl) {
                $page.classList.remove('show');
                $page.style.display = "none";
            }
        })
        if (!(isNaN(this._pageIndex))) {
            // call interface
            this.pageIndexChanged(this._pageIndex);
            // update browser's url
            if (this.isPageIndexInHash) {
                this._updatePageIndexInBrowswerURL(this._pageIndex);
            }
        }
    }

    get pageIndex() {return this._pageIndex}

    /**
     * values  getter
     */
    get values() {
        let _values = {};
        this._components.forEach((component, i) => {
            if (component.__field_name__) {
                _values[component.__field_name__] = component.value;
            }
        });
        return new this.dataModel(_values);
    }

    /**
     * errors setter / getter
     */
    set errors(errors) {
        const previous = this._errors;
        this._errors = errors;
        console.log(`errors changed`);
        console.table(this._errors);
    }

    get errors() {return this._errors}


    /**
     * DOM nodes as variables.
     */
    _setElements(pages) {
        if (pages.length == 0) {
            console.error(`${this.id} requires a list of pages with components.`)
        }

        // create view
        let $inputPageView = document.getElementById(this.id);
        if ($inputPageView == null) {
            console.error(
                `The id=${this.id} is necessary in HTML.`);
        }
        $inputPageView.id = this.id;
        $inputPageView.classList.add('inputPageView')
        this.$inputPageView = $inputPageView;
        this.$view = $inputPageView;

        // create container
        let $container = document.createElement('div');
        $container.id = 'inputPageViewContainer';
        $container.classList.add($container.id);
        this.$inputPageView.appendChild($container);

        // loading
        if(this.loading != null) {
            this.loading.addToParent(this.$view);
        }

        // create pages
        console.log(`${pages.length} pages detected.`)
        let $pagesContainer = document.createElement('div');
        $pagesContainer.classList.add('inputPageViewPages');

        pages.forEach((page, i) => {
            console.log(`${this.id} page ${i} has ${page.components.length} components.`);
   
            page.setElements(i);

            page.components.forEach((component, j) => {
                this._setPageComponent(component, page, i, j);
            });
    
            $pagesContainer.appendChild(page.$view);
        });
        $container.appendChild($pagesContainer);

        // alert message
        this.alertMessage.addTo($container);
    }

    /**
     * Set page component.
     * 
     * @param {object} component 
     * @param {DOM} $page 
     * @param {number} pageIndex 
     * @param {number} componentIndex 
     */
    _setPageComponent(component, page, pageIndex, componentIndex) {
        if (component.constructor.name == "Wrapper") {
            let $wrapper = document.createElement('div');
            $wrapper.id = component.id;
            $wrapper.classList.add('wrapper');
            component.components.forEach((componentInWrapper, k) => {
                this._setPageComponent(componentInWrapper, $wrapper, pageIndex, k);
                componentInWrapper.addTo($wrapper.id);
                componentInWrapper.setPageIndex(pageIndex);
            });
        } else {
            let _id = component.id;
            if (_id == null) {
                console.error(`page ${pageIndex} component ${componentIndex} (${component}): no id is set in the instance.`);
            }
    
            // Set the viewController for the component
            component.setViewController(this);
            component.addToPage(page);
    
            // keep components in the ViewController instance
            this._components.push(component);
            // keep components in matrix with rows as pages
            if (componentIndex == 0 && this._pageComponents[pageIndex] == null) {
                this._pageComponents[pageIndex] = [];
            }
            this._pageComponents[pageIndex].push(component);
        }
    }

    /**
     * Set event handlers.
     */
    _setEventHandlers() {
        const _this = this;
        window.addEventListener('load', (event) => {
            console.log('** the whole page has been loaded. **');
            _this.viewDidLoad();
        })
        window.addEventListener('hashchange', (event) => {
            console.log('hashchange event detected');
            console.log(`url changed. -> ${Browser.getRelativePath()}`)
            const page = Browswer.getValueFromHash('page', 'int');
            _this.pageIndex = page;
        }, false);
        if(this.isEnterButtonToNext) {
            window.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    // "Enter" was pressed, call nextButtonTapped()
                    this._nextButtonAction();
                    event.preventDefault(); // to prevent form submission or other default behavior
                }
            });
        }
    }

    /**
     * Update url ?page= in browser's addressbar.
     * 
     * @param {number} page new page number
     */
    _updatePageIndexInBrowswerURL(page) {
        //browser.updateValueInSearchParams('page', String(page), true);
        if (isNaN(page)) {
            console.error(`invalid page number ${page} of type ${typeof page}`);
            return
        }
        Browser.updateValueInHash('page', String(page), true);
    }

    /**
     * TODO: needs refactoring
     * 
     * Get values from Cookie.
     * 
     * @returns {dict} field values {field_name1: value1, ..}
     */
    getValuesFromCookies() {
        let valuesInCookie = {};
        this._components.forEach((component) => {
            if (component instanceof TextField || component instanceof DropdownButton) {
                const name = `${component.__field_name__}`;
                const value = Cookies.get(name);
                if (value != null) {
                    valuesInCookie[component.__field_name__] = Cookies.get(name);
                }
            }
            if (component instanceof PositionMap) {
                const name_lat = `${component.__field_name_lat__}`;
                const name_lng = `${component.__field_name_lng__}`;
                const value_lat = Cookies.get(name_lat);
                const value_lng = Cookies.get(name_lng);
                if (value_lat != null) {
                    valuesInCookie[component.__field_name_lat__] = Cookies.get(name_lat);
                }
                if (value_lng != null) {
                    valuesInCookie[component.__field_name_lng__] = Cookies.get(name_lng);
                }
            }
        })
        console.log('-------- cookie strage ------');
        console.table(valuesInCookie);
        return valuesInCookie
    }

    /**
     * Initialize Cookie storage.
     * *For debug purpose.
     */
    _resetValuesInCookie() {
        this._components.forEach((component) => {
            if (Utils.isInheritedFrom(component, FormComponentBase)) {
                component._removeValueInCookies();
                console.log(`${component.__field_name__} removed from cookie.`);
            }
        });
        console.log(`Reset all cookies for ${this.id}.`);
    }

    /**
     * @interface
     * 
     * Called when the whole page has been loaded.
     * 
     */
    viewDidLoad() {
        // NOTE: override this function
    }

    /**
     * @interface
     * 
     * Called when pageIndex changed.
     * @param {Int} pageIndex
     */
    pageIndexChanged(pageIndex) {
        // NOTE: override this function
    }

    /**
     * Method that is called when the next button is tapped.
     * If it's not the last page, this function validates the current page and moves to the next one if validation passes.
     * If it's the last page, this function submits the form values.
     * This method can be overridden by subclasses to provide specific functionality.
     *
     * @param {NextButton} nextButton - The next button instance that was tapped.
     */
    nextButtonTapped(nextButton) {
        console.debug(`Button ${nextButton.id} tapped.`);
        console.log(this.values);
        console.log(this.getValuesFromCookies());
        
        this._nextButtonAction();
    }

    _nextButtonAction() {
        // If not the last page, navigate to the next page. If it is the last page, submit the data.
        const isLastPage = this.pageIndex == this.pages.length - 1;
        if (isLastPage) {
            this._submitData(this.submitUrl);
        } else {
            this._navigateToNextPage();
        }
    }

    /**
     * Validates the current page and if validation passes, navigates to the next page.
     * Manages loading animation during these processes.
     */
    _navigateToNextPage() {
        this.startLoading();

        // Validate current page
        const errors = this._validatePage(this.pageIndex);
        if (errors.length > 0) {
            this.stopLoading();
            return; // Return early if there are validation errors
        }

        // If validation passes, move to the next page
        this.pageIndex += 1;
        this.stopLoading();
    }

    /**
     * Navigate to the page that contains the specified component.
     * 
     * If the component has a pageIndex, it updates the current pageIndex. 
     * Otherwise, it logs an error.
     *
     * @param {Object} component - The component object that the method will navigate to its page.
     */
    _navigateToPageOf(component) {
        if ('pageIndex' in component) {
            this.pageIndex = component.pageIndex;
        } else {
            console.error(`The component doesn't have a pageIndex. Unable to navigate.`);
        }
    }

    /**
     * Validates all pages and if validation passes, submits the form.
     * Manages loading animation during these processes.
     */
    _submitData(url) {
        this.startLoading();

        // Validate all pages and stop loading if there's an error.
        if (this.pages.some((page, i) => this._validatePage(i).length > 0)) {
            this.stopLoading();
            return; // Return early if there are validation errors
        }

        console.log(`[Field values] ${JSON.stringify(this.values)}`);
        this._submit(url, this.values);
        this.stopLoading();
    }

    /**
     * Handles successful form submission.
     * 
     * @param {Object} res The response from the server.
     * 
     * Example Success Response:
     * {
     *   'data': user.response_json(),
     *   'user_id': user_id,
     *   'success': {
     *       'code': 201,
     *       'message': 'new user created.'
     *   }
     * }
     * 
     * Example Error Response:
     * {
     *   'data': user.response_json(),
     *   'error': {
     *     'key': 'user_id',
     *     'code': ErrorCode.BAD_REQUEST.value,
     *     'reason': 'BAD_REQUEST',
     *     'message': 'The user_id is invalid.'
     *   }
     * }
     */
    _onSubmitSuccess(res) {
        // Success object returned.
        if (!('error' in res)) {
            console.log(`[success] ${res.code} ${res.message}`);
            this.alertMessage.hide()

            setTimeout(() => { this.stopLoading(); }, 1000);
            // Reset cookie storage
            //this._resetValuesInCookie();
            this.completeSubmission();

        // Error object returned.
        } else {
            console.log(`[error] ${res.error.code} ${res.error.reason}`);

            // Handle by error types
            let isFirstErrorHandled = false;
            res.errors.forEach((error) => {
                console.warn(`[field_name] ${error.field_name} [message] ${error.message}`);
            
                let component = this.componentByFieldName(error.field_name);
                component.alert(true, error.message);
            
                if (!isFirstErrorHandled) {
                    this._navigateToPageOf(component);
                    isFirstErrorHandled = true;
                }
            });
        }
    }

    /**
     * Handles errors during form submission.
     * 
     * @param {Object} error The error object from the fetch promise.
     * 
     * Example Error Object:
     * {
     *   'type': 'fetch_error',
     *   'message': 'Network request failed'
     * }
     */
    _onSubmitError(error) {
        console.warn('↑↑↑↑ API request error');
        setTimeout(() => { this.stopLoading(); }, 1000);
    }


    _submit(url, values) {
        // Send data
        Http.post(
            url, 
            values, 
            this._onSubmitSuccess.bind(this),
            this._onSubmitError.bind(this)
        );
    }

    /**
     * Method to be overridden in subclass, defining what to do after a successful form submission.
     * 
     * For example, to redirect to another page:
     * 
     * completeSubmission() {
     *     // URL to redirect to after successful form submission
     *     const url = 'https://example.com/success_page';
     *     Browser.goTo(url);
     * }
     */
    completeSubmission() {
        // Uncomment and modify the following lines in the subclass
        /*
        // URL to redirect to after successful form submission
        const url = '/success_page';
        Browser.goTo(url);
        */
        throw new Error('You have to implement the method completeSubmission()!');
    }

    /**
     * Called when the back button is tapped. Classes extending InputPageViewController
     * and implementing BackButtonProtocol should override this method to provide
     * their own functionality when the back button is clicked.
     *
     * @abstract
     * @param {BackButton} backButton - The back button that was tapped.
     * @throws {Error} Will throw an error if the method is not overridden in a child class.
     */
    backButtonTapped(backButton) {
        debuglog(`button ${backButton.id} tapped.`);
        if (this.pageIndex > 0) {
            this.pageIndex = this.pageIndex - 1;
        }
    }

    /**
     * Called when a TextField input changes.
     * This method needs to be overridden by subclasses.
     * @param {TextField} textField - The TextField instance where the input changed.
     * @param {string} value - The new input value.
     */
    textFieldInputValueChanged(textField, value) {
        if(typeof this.valueChanged !== 'function'){
            throw new Error(`Instance ${this.id} must implement the method valueChanged in subclass!`);
        }
        console.log(`textField ${textField.id} input with value ${value}.`);
        this.valueChanged(textField, value);
        //this._setValueForKey(textField.__field_name__, value)
        //if(typeof this._setValueForKey !== 'function'){
        //    throw new Error(`Instance ${this.id} must implement the method _setValueForKey in subclass!`);
        //}
    }

    /**
     * Called when a TextField loses focus (unfocus).
     * This method needs to be overridden by subclasses.
     * @param {TextField} textField - The TextField instance that lost focus.
     * @param {string} value - The current value of the TextField.
     */
    textFieldOnBlur(textField, value) {
        if(typeof this.unfocused !== 'function'){
            throw new Error(`Instance ${this.id} must implement the method unfocused in subclass!`);
        }
        console.log(`textField ${textField.id} onblur with value ${value}.`);
        this.unfocused(textField, value);
    }

    /**
     * @interface
     * 
     * Called when a DropdownButton is selected.
     * 
     * @param {DropdownButton} dropdownButton
     * @param {string} value
     */
    dropdownButtonSelected(dropdownButton, value) {
        console.log(`dropdownButton ${dropdownButton.id} selected with value ${value}.`);
        this.unfocused(dropdownButton, value);
        this.valueChanged(dropdownButton, value);
        // NOTE: override this function
        //this._setValueForKey(dropdownButton.__field_name__, value)
    }

    /**
     * @interface
     * 
     * Called when a PositionMap.pointerCoordinate is updated.
     * 
     * @param {Coordinate} newCoordinate 
     */
    positionMapPointerCoordinateUpdated(positionMap, newCoordinate) {
        console.log(`positionMap ${positionMap.id}.pointerCoordinate updated with value ${newCoordinate.lat} ${newCoordinate.lng}`);
        const keyLat = `${positionMap.__field_name_lat__}`;
        const keyLng = `${positionMap.__field_name_lng__}`;
        this.valueChanged(positionMap, newCoordinate);
        //this._setValuesForKeys(
        //    {
        //        [keyLat]: newCoordinate.lat,
        //        [keyLng]: newCoordinate.lng
        //    }
        //)
        // NOTE: override this function
    }

    /**
     * @interface
     * FileUploadView protocol
     */
    fileUploadViewStateChange(fileUploadView, state) {
    }
    fileUploadViewFileUploaded(fileUploadView, file) {
    }
    fileUploadViewFocusChange(fileUploadView, focus) {
    }
    fileUploadViewFileRemoved(fileUploadView, cell) {
    }

    /**
     * @interface
     * 
     * Called when a TextField is input changed or,
     * Called when a DropdownButton is selected.
     * 
     * @param {TextField/DropdownButton} component
     * @param {string} value
     */
    valueChanged(component, value) {
        // NOTE: override this function
    }

    /**
     * @interface
     * 
     * Called when a TextField is blur(unfocus) or,
     * Called when a DropdownButton is selected.
     * 
     * @param {TextField/DropdownButton} component
     * @param {string} value
     */
    unfocused(component, value) {
        // NOTE: override this function
    }

    /**
     * @interface
     * 
     * Run validation for a single component.
     * 
     * @param {ViewComponentBase} component - The component to validate.
     * @return {string|null} - The error message if validation fails, or null if it passes.
     */
    _validateComponent(component) {
        debuglog(`Validating component: ${component.id}`)
        return component.validate()
    }

    /**
     * Run validation for a page.
     * 
     * @description _validateComponent(component, value) must be implemented.
     * 
     * @param {number} pageIndex
     * @returns {Array} a 2-dim list of all errors found in the page.
     * [[component, 'error message'], ..}
     */
    _validatePage(pageIndex) {
        let errors = [];
        this._pageComponents[pageIndex].forEach((component, j) => {
            if (component instanceof TextField || component instanceof DropdownButton) {
                const errorMessage = this._validateComponent(component);
                if (errorMessage != null) {
                    errors.push([component, errorMessage]);
                }
            }
        });
        console.log(`Page ${pageIndex} validated: ${errors.length} errors found.`)
        return errors
    }

    /**
     * HTTP POST to submit data.
     * 
     * @param {string} url
     * @param {function} onsuccess
     * @param {function} onfailed
     */
    post(url, onsuccess, onfailed) {
        fetch(
            url,
            {
                method: 'POST',
                headers: {
                    //'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Type': 'application/json',
            },
            // DataModel object as this._values
            body: this._values.json()
        })
        .then(response => response.json())
        .then(data => {
            console.info(`${url} response received:`, data);
            onsuccess(data);
        })
        .catch((error) => {
            console.info(`${url} request failed:`, error);
            onfailed(error);
        })
    }

    /**
     * @method
     * Start loading. Implement this in subclass.
     */
    startLoading() {
        debuglog(`start loading.. ${this.loading.id}`)
        if (this.loading == null) {
            console.warn(`no loading is set in ${this.id}`);
            return
        }
        this.loading.startLoading();
    }

    /**
     * @method
     * Stop loading. Implement this in subclass.
     */
    stopLoading() {
        debuglog(`stop loading. ${this.loading.id}`)
        if (this.loading == null) {
            console.warn(`no loading is set in ${this.id}`);
            return
        }
        this.loading.stopLoading();
    }

    /**
     * @interface
     * 
     * @param {string} newUrl 
     */
    goTo(newUrl) {
        document.location.href = newUrl;
    }

    /**
     * Returns an input component by fieldName.
     * 
     * @param {string} fieldName 
     */
    componentByFieldName(fieldName) {
        for (let component of this._components) {
            if (component.__field_name__ === fieldName) {
                debuglog(`componentByFieldName found component by ${fieldName}`);
                return component;
            }
        }
        console.warn(`input component ${fieldName} not found in component list.`);
        return null;  // Return null when the component is not found
    }

    /**
     * Returns a component by id.
     * 
     * @param {string} id
     */
    componentById(id) {
        for (let component of this._components) {
            if (component.id === id) {
                debuglog(`componentByFieldName found component by ${id}`);
                return component;
            }
        }
        console.warn(`component ${id} not found in component list.`);
        return null;  // Return null when the component is not found
    }

}

