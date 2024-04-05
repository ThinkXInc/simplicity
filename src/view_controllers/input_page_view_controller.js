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
        isAllPageShown = false,
        isEnterButtonToNext = true,
        isPageIndexInHash = false,
        pageIndexKeyInHash = 'page',
        preventDefaultPageControl = false
    } = {}) {
        this.dataModelClass = dataModelClass;
        this.url = url;
        this.loading = loading;
        this.alertMessage = alertMessage;
        this.defaultPageIndex = defaultPageIndex;
        this.isAllPageShown = isAllPageShown;
        this.isEnterButtonToNext = isEnterButtonToNext;
        this.isPageIndexInHash = isPageIndexInHash;
        this.pageIndexKeyInHash = pageIndexKeyInHash;
        this.preventDefaultPageControl = preventDefaultPageControl;
    }
}

class InputPageViewControllerProtocol {
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
        this.config = config;

        // Use destructuring to apply configuration properties to the instance
        Object.assign(this, {
            submitUrl: config.url,
            alertMessage: config.alertMessage || new AlertMessage(`${id}__AlertMessage`),
            isEnterButtonToNext: config.isEnterButtonToNext,
            isPageIndexInHash: config.isPageIndexInHash,
            preventDefaultPageControl: config.preventDefaultPageControl,
        });

        // Potentially check protocol adherence here
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

        if (this.locale == null) {
            console.error(`${id} no locale json data found.`);
        } else {
            console.log(`${id} locale json data found`);
        }
        if (this.lang == null) {
            console.error(`${id} no language information is given.`);
        } else {
            console.log(`${id} initial language is set as ${lang}`);
        }

        this.loading = config.loading
        if(!this.config.isAllPageShown) {
            this.pageIndex = config.defaultPageIndex;
        } else {
            this.showAllPages();
        }
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
        this.showPageOnly(pageIndex);
    }

    get pageIndex() {return this._pageIndex}

    /**
     * values  getter
     */
    get values() {
        let _values = {};
        this._components.forEach((component, i) => {
            if (component.fieldName) {
                _values[component.fieldName] = component.value;
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
        })

        window.addEventListener('hashchange', (event) => {
            console.log('hashchange event detected');
            console.log(`url changed. -> ${Browser.getRelativePath()}`)
            const page = Browswer.getValueFromHash(this.config.pageIndexKeyInHash, 'int');
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
        Browser.updateValueInHash(this.config.pageIndexKeyInHash, String(page), true);
    }

    showPageOnly(pageIndex) {
        let $pages = this.$inputPageView.querySelectorAll('.inputPageViewPage')
        $pages.forEach(($page, i) => {
            if (parseInt($page.dataset.pageIndex) == pageIndex) {
                this.showPage($page);
            } else if (!this.preventDefaultPageControl) {
                this.hidePage($page);
            }
        })
    }

    showAllPages() {
        let $pages = this.$inputPageView.querySelectorAll('.inputPageViewPage')
        $pages.forEach(($page, i) => {
            this.showPage($page);
        })
    }

    hideAllPages() {
        let $pages = this.$inputPageView.querySelectorAll('.inputPageViewPage')
        $pages.forEach(($page, i) => {
            this.hidePage($page);
        })
    }

    showPage($page) {
        if (!this.preventDefaultPageControl) {$page.classList.add('show')};
        $page.style.display = "flex";
        $page.style.flexDirection = "column";
    }

    hidePage($page) {
        $page.classList.remove('show');
        $page.style.display = "none";
    }

    /**
     * TODO: needs refactoring
     * 
     * Get values from Cookie.
     * 
     * @returns {dict} field values {fieldName1: value1, ..}
     */
    getValuesFromCookies() {
        let valuesInCookie = {};
        this._components.forEach((component) => {
            if (component instanceof TextField || component instanceof DropdownButton) {
                const name = `${component.fieldName}`;
                const value = Cookies.get(name);
                if (value != null) {
                    valuesInCookie[component.fieldName] = Cookies.get(name);
                }
            }
            if (component instanceof PositionMap) {
                const name_lat = `${component.fieldNameLat}`;
                const name_lng = `${component.fieldNameLng}`;
                const value_lat = Cookies.get(name_lat);
                const value_lng = Cookies.get(name_lng);
                if (value_lat != null) {
                    valuesInCookie[component.fieldNameLat] = Cookies.get(name_lat);
                }
                if (value_lng != null) {
                    valuesInCookie[component.fieldNameLng] = Cookies.get(name_lng);
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
    resetValuesInCookie() {
        this._components.forEach((component) => {
            if (Utils.isInheritedFrom(component, FormComponentBase)) {
                component._removeValueInCookies();
                console.log(`${component.fieldName} removed from cookie.`);
            }
        });
        console.log(`Reset all cookies for ${this.id}.`);
    }

    /**
     * Validates the current page and if validation passes, navigates to the next page.
     * Manages loading animation during these processes.
     */
    navigateToNextPage() {
        this.startLoading();

        // Validate current page
        const errors = this.validatePage(this.pageIndex);
        if (errors.length > 0) {
            this.stopLoading();
            return; // Return early if there are validation errors
        }

        // If validation passes, move to the next page
        this.incrementPageIndex();
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
    navigateToPageOf(component) {
        if ('pageIndex' in component) {
            this.pageIndex = component.pageIndex;
        } else {
            console.error(`The component doesn't have a pageIndex. Unable to navigate.`);
        }
    }

    submit(url, values, onsuccess, onerror) {
        Http.post(
            url, 
            values, 
            onsuccess.bind(this),
            onerror.bind(this)
        );
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
        this.decrementPageIndex();
    }

    incrementPageIndex() {
        this.pageIndex += 1;
    }

    decrementPageIndex() {
        if (this.pageIndex > 0) {
            this.pageIndex = this.pageIndex - 1;
        }
    }

    /**
     * @interface
     * 
     * Run validation for a single component.
     * 
     * @param {ViewComponentBase} component - The component to validate.
     * @return {string|null} - The error message if validation fails, or null if it passes.
     */
    validateComponent(component) {
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
    validatePage(pageIndex) {
        let errors = [];
        this._pageComponents[pageIndex].forEach((component, j) => {
            if (component instanceof TextField || component instanceof DropdownButton) {
                const errorMessage = this.validateComponent(component);
                if (errorMessage != null) {
                    errors.push([component, errorMessage]);
                }
            }
        });
        console.log(`Page ${pageIndex} validated: ${errors.length} errors found.`)
        return errors
    }

    validateAllPages() {
        // Validate all pages and stop loading if there's an error.
        if (this.pages.some((page, i) => this.validatePage(i).length > 0)) {
            return false; // Return early if there are validation errors
        }
        return true;
    }

    /**
     * HTTP POST to submit data.
     * 
     * @param {string} url
     * @param {function} onsuccess
     * @param {function} onfailed
     */
    post(url, values, onsuccess, onfailed) {
        fetch(
            url,
            {
                method: 'POST',
                headers: {
                    //'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Type': 'application/json',
            },
            body: values // this._values.json()
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
            if (component.fieldName === fieldName) {
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

