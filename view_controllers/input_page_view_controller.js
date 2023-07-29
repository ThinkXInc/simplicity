'use strict'
/**
 * @fileoverview simplicity/view_controllers/input_page_view_controller.js
 * 
 * InputPageViewController
 * 
 * This class is the super class of any form interaction view controller
 * such as SignupViewController.
 * 
 * The views are composed of view components below.
 * 
 *  - TextField from textfield.js (text input)
 *  - DropdownButton from dropdown_button.js (select with table)
 *  - RadioButton from radio_button.js (select with radio buttons) *todo
 *  - Title
 *  - Description
 *  - FieldTitle *todo
 *  - FieldDescription *todo
 *  - AlertText
 *  - NextButton
 *  - BackButton
 * 
 * The subclasses of InputPageViewController mainly work on the validation of each form values. 
 * 
 * This class provides with common functions below.
 *  1. The value is retained in the cookie at each page transition
 *  2. The URL is rewritten in JS for each screen transition.
 *  3. So that the value is not lost when the browser reloads or backs.
 * 
 * <code>
 *   class User {
 *      first_name = null;
 *      last_name = null;
 *      country = null;
 *      constractor(first_name, last_name, country) {
 *        this.first_name = first_name;
 *        this.last_name = last_name;
 *        this.country = country;
 *      }
 *   }
 *   class SignupViewController extends InputPageViewController {
 *      constractor(_id, pages, dataModelClass) {
 *        super(_id, pages, dataModelClass)
 *      }
 *   }
 *   let vc = SignupViewController(
 *     'SignupView',
 *     [
 *        # Page 1
 *        [
 *          new Title('signupViewPage1Title', 'You are welcome.'),
 *          new Description('signupViewPage1Description', 'Welcome to this useful website.'),
 *          new FieldTitle('signupViewNameTitle', 'Your Name Here'),
 *          new TextField('sugnupViewFirstNameTextField', TextFieldType.singleline,
 *                        'First Name', 'first_name', 'Satoshi', 100, 1, false),
 *          new TextField('sugnupViewLastNameTextField', TextFieldType.singleline,
 *                        'Last Name', 'last_name', 'Nakamoto', 100, 1, false),
 *          new FieldTitle('signupViewCountryTitle', 'Your Country'),
 *          new FieldDescription('signupViewCountryTitle',
 *                               '"Your Counrty" means where you were born.'),
 *          new DropdownButton(
 *               'countrySelectButton', 'Your Country', 'Please select your country.',
 *               'country',
 *               DropdownMenuType.list, 
 *               DropdownMenuDisplayPositionType.upper,
 *               [
 *                   new ListMenu('Afganistan', 0),
 *                   new ListMenu('Belarus', 1),
 *                   new ListMenu('China', 2),
 *                   new ListMenu('Denmark', 3),
 *                   ...
 *               ]);
 *        ],
 *        # Page 2
 *        [
 *          new Title('signupViewPage2Title', 'You are welcome again.'),
 *          ...
 *        ],
 *        ...
 *     ],
 *     User
 *   )
 * 
 *   // write these on signup.html
 *   <section id={_id} class=inputPageView>
 *     // page 1
 *     <div id=signupViewPage1Title class=inputPageViewPageTitle>...</div>
 *     <div id=signupViewPage1Description class=inputPageViewPageDescription>...</div>
 *     <div id=signupViewFirstNameTextField class=textField>...</div>
 *     <div id=signupViewLastNameTextField class=textField>...</div>
 *     // page 2
 *     <div id=signupViewPage2Title class=inputPageViewPageTitle>...</div>
 *     ...
 *   </section>
 *
 *   // After the initialization, InputPageViewController finally generates 
 *   <section id={_id} class=inputPageView>
 *     <!-- ↓↓↓ these DOM elements are dinamically created ↓↓↓ -->
 *     <div class=inputPageViewContainer>
 *       <ul class=inputPageViewPages>
 *         <li class=inputPageViewPage data-pageIndex=0>
 *           <div id=signupViewPage1Title class=inputPageViewPageTitle>...</div>
 *           <div id=signupViewPage1Description class=inputPageViewPageDescription>...</div>
 *           <div id=signupViewFirstNameTextField class=textField>...</div>
 *           <div id=signupViewLastNameTextField class=textField>...</div>
 *           ...
 *         </li>
 *         <li class=inputPageViewPage data-page-index=1>
 *           <div id=signupViewPage2Title class=inputPageViewPageTitle>...</div>
 *         </li>
 *       </ul>
 *     </div>
 *     <!-- ↑↑↑ these DOM elements are dinamically created ↑↑↑ -->
 *   </section>
 
 * </code>
 * 
 * @author kaz@thinkxinc.com (Kazuki Otsuka)
 **/

const RegexType = Object.freeze({
    email: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
    postalcode: /^(?:[A-Z0-9]+([- ]?[A-Z0-9]+)*)?$/,
    tel: /^[\+]?[(]?[0-9]{2,3}[)]?[-\s\.]?[0-9]{4,6}[-\s\.]?[0-9]{4,6}$/im,
})


const ValidationErrorType = Object.freeze({
    required: 0,
    length: 1,
    format: 2,
    notcorrespond: 3
})


/**
 * InputPageViewController DataModel class.
 * 
 * @param {dict} defaults default key:value of fields retrieved from _restoreValuesFromCookie()
 * @constructor 
 */
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
 
    /**
     * Convert object to json.
     * 
     * @returns {json} convert to json string
     */
    json() {
        return JSON.stringify(this);
    }

}



/**
 * InputPageViewController class.
 * 
 * Usages:
 *  1. Set values of fields
 *      eg.
 *      newValues['name'] = name
 *      this.values = newValues  // automatically store into the cookie strage
 * 
 *      this.setValueForKey('name') = name  // direct insert
 *      x this.values['name'] = name  // not allowed to modify a property directly
 * 
 * @param {string} parent_id - The DOM id where this view is inserted.
 * @param {string} _id - This view's DOM id.
 * @param {list} pages - 2-dimentional array of components. (see the sample above)
 * @param {data model} dataModelClass - data model class to be submit to the server.
 * @param {array} validations - {'componentId': [errorType, "error message key", [arg1, arg2,..]]}
 * @param {dict} locale - locale json
 * @param {string} lang - initial language e.g. ja
 * @property @private
 * @property @public
 * @interface _nextButtonTapped(nextButton)
 * @method @private
 * @method @public
 * @constructor
 */
class InputPageViewController {
    __parent_id__ = null;
    __id__ = null;
    __number_of_pages__ = null;
    __data_model__ = null;
    __loading_element_id__ = "input_page_view_controller_loading";
    __cookie_excludes__ = []; 

    _page = null;
    _values = {};

    _components = [];
    _pageComponents = [];  // [[comp 0 in page 0, comp 1 in page 0, ..], [..],..]
    _pageErrors = [];  // [[[component, 'error message'], []],..]
    _validations = [];  // {'componentId': [errorType, "error message key", [arg1, arg2,..]]}

    _locale = null;
    _lang = null;

    constructor(parent_id, id, pages, dataModelClass, defaults, locale, lang, cookieExcludes=[]) {
        this.__parent_id__ = parent_id;
        this.__id__ = id;

        // Potentially check protocol adherence here
        this._checkProtocolAdherence();

        // setup page components
        if (pages.length == 0) {
            console.error(`${this.__id__} requires a list of pages with components.`)
        }
        pages.forEach((components, i) => {
            if (components.length == 0) {
                console.error(`${this.__id__} page ${i} requires at least 1 component.`)
            }
        })
        this._setElements(pages);

        // set events
        this._setEventHandlers();

        // data model
        this.__data_model__ = dataModelClass;
        this.__cookie_excludes__ = cookieExcludes;
        //this._resetValuesInCookie(); // DEBUG:
        if (defaults == null) {
           defaults = this._restoreValuesFromCookie();
        } else {
           this._setValuesToFields(defaults);
        }
        console.table(defaults);
        this._values = new dataModelClass(defaults);
        console.table(this._values);
        console.log(`data model for ${this.__id__} initialized`);

        // locale
        this._locale = locale;
        this._lang = lang;
        console.log(locale);
        console.log(lang);
        if (this._locale == null) {
            console.warn(`no locale json data found.`);
        } else {
            console.log('locale json data found');
        }
        if (this._lang == null) {
            console.warn(`no language information is given.`);
        } else {
            console.log(`initial language is set as ${lang}`);
        }
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
        const protocolInstance = new protocolClass();
        Object.getOwnPropertyNames(Object.getPrototypeOf(protocolInstance)).forEach(methodName => {
            if (methodName !== "constructor" && typeof this[methodName] !== "function") {
                throw new Error(`InputPageViewController must implement ${methodName} method of ${protocolClass.name}`);
            }
        });
    }

    /**
     * page setter / getter
     * 
     * Display only the page in current state.
     */
    set page(page) {
        const previousPage = this._page;
        console.log(`page changed ${previousPage} -> ${page}`)
        this._page = page;
        // display only the page in current state.
        let $pages = this.$inputPageView.querySelectorAll('.inputPageViewPage')
        $pages.forEach(($page, i) => {
            if (parseInt($page.dataset.pageIndex) == this._page) {
                $page.classList.add('show');
                $page.style.display = "flex";
                $page.style.flexDirection = "column";
            } else {
                $page.classList.remove('show');
                $page.style.display = "none";
            }
        })
        if (!(isNaN(this._page))) {
            // call interface
            this._pageChanged(this._page);
            // update browser's url
            this._updatePageNumberInBrowswerURL(this._page);
        }
    }

    get page() {return this._page}

    /**
     * values setter / getter
     * 
     * NOTICE: 
     * when modify a property in values,
     * use `setValueForKey(key, value)`
     * , instead values[key] = value
     */
    set values(values) {
        const previous = this._values;
        this._values = values;
        console.log(`values changed`);
        console.table(this._values);

        // sync with cookie storage
        this._setValuesToCookies(this._values);
    }

    get values() {return this._values}

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

        this.$parentView = document.getElementById(self.__parent_id__);
        if (this.$inputPageView == null) {
            console.error(
                `The parent element id=${this.__parent_id__} is necessary in HTML.`);
        }

        // create view
        let $inputPageView = document.createElement('div');
        $inputPageView.id = self.__id__;
        $inputPageView.classList.add()
        this.$inputPageView = $inputPageView;
        this.$parentView.prepend($inputPageView)

        // create loading
        let $loading = document.createElement('div');
        $loading.id = this.__loading_element_id__;
        $loading.style.height = '7px';
        $loading.style.width = '100%';
        this.$inputPageView.prepend($loading);
        this.$loading = $loading;
        console.log('loading element created.')

        // create container
        let $container = document.createElement('div');
        $container.id = 'inputPageViewContainer';
        $container.classList.add($container.id);
        this.$inputPageView.appendChild($container);

        // create pages
        console.log(`${pages.length} pages detected.`)
        let $pages = document.createElement('ul');
        $pages.classList.add('inputPageViewPages');
        pages.forEach((components, i) => {
            console.log(`${this.__id__} page ${i} has ${components.length} components.`);

            // create page DOM element
            let $page = document.createElement('li');
            $page.id = `${this.__id__}Page${i}`;
            $page.classList.add('inputPageViewPage');
            $page.dataset.pageIndex = i;

            // set components
            components.forEach((component, j) => {
                if (component.constructor.name == "Wrapper") {
                    let $wrapper = document.createElement('div');
                    $wrapper.id = component.__id__;
                    $wrapper.classList.add('wrapper');
                    $page.appendChild($wrapper)
                    component.components.forEach((componentInWrapper, k) => {
                        this._setPageComponent(componentInWrapper, $wrapper, i, k)
                    })
                } else {
                    this._setPageComponent(component, $page, i, j);
                }
            });
            $pages.appendChild($page);
        });
        $container.appendChild($pages);
    }

    /**
     * Set page component.
     * 
     * @param {object} component 
     * @param {DOM} $parent 
     * @param {number} pageIndex 
     * @param {number} componentIndex 
     */
    _setPageComponent(component, $parent, pageIndex, componentIndex) {
        let _id = component.__id__;
        if (_id == null) {
            console.error(`page ${pageIndex} component ${componentIndex}: no __id__ is set in the instance.`)
        }
        let $elem = document.getElementById(_id);
        if ($elem == null) {
            console.error(`<div id=${_id}> is nucessary in HTML.`);
        }
        $parent.appendChild($elem);

        // Set the viewController for the component
        component.setViewController(this);

        // keep components in the ViewController instance
        this._components.push(component);
        // keep components in matrix with rows as pages
        if (componentIndex == 0) {
            this._pageComponents.push([]);
        }
        this._pageComponents[pageIndex].push(component);
    }

    /**
     * Set event handlers.
     */
    _setEventHandlers() {
        const _this = this;
        window.addEventListener('load', (event) => {
            console.log('** the whole page has been loaded. **');
            _this._viewLoaded();
        })
        window.addEventListener('hashchange', (event) => {
            console.log('hashchange event detected');
            console.log(`url changed. -> ${PageControl.getRelativePath()}`)
            const page = Browswer.getValueFromHash('page', 'int');
            _this.page = page;
        }, false);
    }

    /**
     * update a property of _values
     */
    _setValueForKey(key, value) {
        let values = this._values 
        values[key] = value
        this.values = values
    }

    /**
     * update multiple properties of _values
     * 
     * @param {dict} newValues
     */
    _setValuesForKeys(newValues) {
        let values = this._values 
        Object.keys(newValues).forEach((key) => {
            values[key] = newValues[key]
        })
        this.values = values
    }

    /**
     * Update url ?page= in browser's addressbar.
     * 
     * @param {number} page new page number
     */
    _updatePageNumberInBrowswerURL(page) {
        //browser.updateValueInSearchParams('page', String(page), true);
        if (isNaN(page)) {
            console.error(`invalid page number ${page} of type ${typeof page}`);
            return
        }
        PageControl.updateValueInHash('page', String(page), true);
    }

    /**
     * Set values to Cookie strage.
     * 
     * @description __id__ is prefixed to the save key.  {this.__id__}__{field_name}
     * @param {dict} values {key1: value1, ..} usually this._values
     * @param {number} expires when the cookie will be removed. [days]
     * @param {bool} secure if the cookie transmission requires a secure protocol (https)
     * @param {string} sameSite whether a cookie is sent along with cross-site requests
     */
    _setValuesToCookies(values, expires=3, secure=true, sameSite='strict') {
        const prefix = this.__id__;
        // set all values
        Object.keys(values).forEach((key) => {
            const name = `${prefix}__${key}`
            const value = this._values[key]
            if (value != null && !(this.__cookie_excludes__.includes(key))) {
                // set value if not null
                Cookies.set(
                    name, value,
                    {expires: expires, secure: secure, sameSite: sameSite});
            } else {
                // remove if the value is null
                Cookies.remove(name);
            }
        })
        console.log('cookies saved');
        console.log(Cookies.get());
    }

    /**
     * Get values from Cookie.
     * 
     * @returns {dict} field values {field_name1: value1, ..}
     */
    _getValuesFromCookies() {
        const prefix = this.__id__;
        let valuesInCookie = {};
        this._components.forEach((component) => {
            if (component instanceof TextField || component instanceof DropdownButton) {
                const name = `${prefix}__${component.__field_name__}`;
                const value = Cookies.get(name);
                if (value != null) {
                    valuesInCookie[component.__field_name__] = Cookies.get(name);
                }
            }
            if (component instanceof PositionMap) {
                const name_lat = `${prefix}__${component.__field_name_lat__}`;
                const name_lng = `${prefix}__${component.__field_name_lng__}`;
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
     * Restore values onto components from Cookie.
     * 
     * @returns {dict} values object restored from cookie storage.
     */
    _restoreValuesFromCookie() {
        const valuesInCookie = this._getValuesFromCookies();
        console.table(valuesInCookie);

        // set values to compoents
        this._setValuesToFields(valuesInCookie);

        // store to this._values
        this._storeValues(valuesInCookie);

        return valuesInCookie
    }

    /**
     * Set field values to components from dataModel.
     * 
     * @param {DataModel} dataModel 
     */
    _setValuesToFields(dataModel) {
        // set values to compoents
        this._components.forEach((component) => {
            if (component instanceof TextField || component instanceof DropdownButton) {
                if (!component.__field_name__ in dataModel) {
                    console.warn(`no ${component.__field_name__} field in cookie.`);
                    return
                }
                if (dataModel[component.__field_name__] == null) {
                    console.log(`value of ${component.__field_name__} in cookie is null.`);
                    return
                }
                // set value to fields by the class type
                if (component instanceof TextField) {
                    component.text = dataModel[component.__field_name__];
                }
                if (component instanceof DropdownButton) {
                   component.selectedValue = dataModel[component.__field_name__];
                }
            }
            if (component instanceof PositionMap) {
                if (!component.__field_name_lat__ in dataModel) {
                    console.warn(`no ${component.__field_name_lat__} field in cookie.`);
                    return
                }
                if (!component.__field_name_lng__ in dataModel) {
                    console.warn(`no ${component.__field_name_lng__} field in cookie.`);
                    return
                }
                if (dataModel[component.__field_name_lat__] == null) {
                    console.log(`value of ${component.__field_name_lat__} in cookie is null.`);
                    return
                }
                if (dataModel[component.__field_name_lng__] == null) {
                    console.log(`value of ${component.__field_name_lng__} in cookie is null.`);
                    return
                }
                // set value to fields by the class type
                component.mapCoordinate = new Coordinate(
                    dataModel[component.__field_name_lat__],
                    dataModel[component.__field_name_lng__])
                component.pointerCoordinate = new Coordinate(
                    dataModel[component.__field_name_lat__],
                    dataModel[component.__field_name_lng__])
            }
        })
    }

    
    /**
     * Store values to this._values from dataModel object.
     * 
     * @param {DataModel} dataModel - {'fieldName': val, ..}
     */
    _storeValues(dataModel) {
        // store to this._values
        Object.keys(dataModel).forEach((fieldName) => {
            this._values[fieldName] = dataModel[fieldName];
        });
    }

    /**
     * Initialize Cookie strage.
     * 
     */
    _resetValuesInCookie() {
        const prefix = this.__id__;
        this._components.forEach((component) => {
            if (component instanceof TextField || component instanceof DropdownButton) {
                const name = `${prefix}__${component.__field_name__}`;
                Cookies.remove(name);
                console.log(`${name} removed from cookie.`);
            }
            if (component instanceof PositionMap) {
                const nameLat = `${prefix}__${component.__field_name_lat__}`;
                const nameLng = `${prefix}__${component.__field_name_lng__}`;
                Cookies.remove(nameLat);
                Cookies.remove(nameLng);
                console.log(`${nameLat} removed from cookie.`);
                console.log(`${nameLng} removed from cookie.`);
            }
        })
    }

    /**
     * @interface
     * 
     * Called when the whole page has been loaded.
     * 
     */
    _viewLoaded() {
        // NOTE: override this function
    }

    /**
     * @interface
     * 
     * Called when page changed.
     * @param {Int} page
     */
    _pageChanged(page) {
        // NOTE: override this function
    }

    /**
     * @abstract
     * 
     * This is an abstract method that is called when the next button is tapped. 
     * Subclasses are expected to override this method to provide specific functionality.
     * 
     * @param {NextButton} nextButton - The next button instance that was tapped.
     */
    _nextButtonTapped(nextButton) {
        console.log(`button ${nextButton.__id__} tapped.`);
        // NOTE: override this function
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
    _backButtonTapped(backButton) {
        throw new Error("You have to override the method _backButtonTapped!");
    }

    /**
     * Called when a TextField input changes.
     * This method needs to be overridden by subclasses.
     * @param {TextField} textField - The TextField instance where the input changed.
     * @param {string} value - The new input value.
     */
    _textFieldInputValueChanged(textField, value) {
        if(typeof this._valueChanged !== 'function'){
            throw new Error(`Instance ${this.__id__} must implement the method _valueChanged in subclass!`);
        }
        if(typeof this._setValueForKey !== 'function'){
            throw new Error(`Instance ${this.__id__} must implement the method _setValueForKey in subclass!`);
        }
        console.log(`textField ${textField.__id__} input with value ${value}.`);
        this._valueChanged(textField, value);
        this._setValueForKey(textField.__field_name__, value)
    }

    /**
     * Called when a TextField loses focus (unfocus).
     * This method needs to be overridden by subclasses.
     * @param {TextField} textField - The TextField instance that lost focus.
     * @param {string} value - The current value of the TextField.
     */
    _textFieldUnFocus(textField, value) {
        if(typeof this._unfocused !== 'function'){
            throw new Error(`Instance ${this.__id__} must implement the method _unfocused in subclass!`);
        }
        console.log(`textField ${textField.__id__} onblur with value ${value}.`);
        this._unfocused(textField, value);
    }

    /**
     * @interface
     * 
     * Called when a DropdownButton is selected.
     * 
     * @param {DropdownButton} dropdownButton
     * @param {string} value
     */
    _dropdownButtonSelected(dropdownButton, value) {
        console.log(`dropdownButton ${dropdownButton.__id__} selected with value ${value}.`);
        this._unfocused(dropdownButton, value);
        this._valueChanged(dropdownButton, value);
        // NOTE: override this function
        this._setValueForKey(dropdownButton.__field_name__, value)
    }

    /**
     * @interface
     * 
     * Called when a PositionMap.pointerCoordinate is updated.
     * 
     * @param {Coordinate} newCoordinate 
     */
    _positionMapPointerCoordinateUpdated(positionMap, newCoordinate) {
        console.log(`positionMap ${positionMap.__id__}.pointerCoordinate updated with value ${newCoordinate.lat} ${newCoordinate.lng}`);
        const keyLat = `${positionMap.__field_name_lat__}`;
        const keyLng = `${positionMap.__field_name_lng__}`;
        this._setValuesForKeys(
            {
                [keyLat]: newCoordinate.lat,
                [keyLng]: newCoordinate.lng
            }
        )
        // NOTE: override this function
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
    _valueChanged(component, value) {
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
    _unfocused(component, value) {
        // NOTE: override this function
    }

    /**
     * @interface
     * 
     * Show page alert message.
     * 
     * @param {AlertMessage} alertMessage
     * @param {string} message 
     */
    _setAlertMessage(alertMessageId, message) {
        let alertMessage = this._componentById(alertMessageId);
        if (alertMessage == null) {
            console.error(`AlertMessage component id:${alertMessageId} not found in PageViewController.components`);
        } else {
            console.log(`show alert message ${message} on ${alertMessage.__id__}`);
            alertMessage.message = message;
        }
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
        return component.validate()
    }

    /**
     * Run validation for a page.
     * 
     * @description _validateComponent(component, value) must be implemented.
     * 
     * @param {number} page 
     * @returns {Array} a 2-dim list of all errors found in the page.
     * [[component, 'error message'], ..}
     */
    _validatePage(page) {
        let errors = [];
        this._pageComponents[page].forEach((component, j) => {
            if (component instanceof TextField || component instanceof DropdownButton) {
                const errorMessage = this._validateComponent(component);
                if (errorMessage != null) {
                    errors.push([component, errorMessage]);
                }
            }
        });
        return errors
    }

    /**
     * HTTP POST to submit data.
     * 
     * @param {string} url
     * @param {function} onsuccess
     * @param {function} onfailed
     */
    _post(url, onsuccess, onfailed) {
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
     * Toggle loading.
     * 
     * This function only place or remove <div id=this.__loading_element_id__>.
     * 
     * @param {bool} isLoading
     */
    _loading(isLoading) {
        if (isLoading) {
            this._startLoading(this.$loading);
        } else {
            this._stopLoading(this.$loading);
        }
    }

    /**
     * @interface
     * 
     * @param {DOM element} $loading
     */
    _startLoading($loading) {
    }

    /**
     * @interface
     * 
     * @param {DOM element} $loading
     */
    _stopLoading($loading) {
    }

    /**
     * @interface
     * 
     * @param {string} newUrl 
     */
    _goTo(newUrl) {
        document.location.href = newUrl;
    }

    /**
     * Returns an input component by fieldName.
     * 
     * @param {string} fieldName 
     */
    _componentByFieldName(fieldName) {
        let result;
        this._components.forEach((component) => {
            console.log(component.__field_name__)
            if (component.__field_name__ == fieldName) {
                return component
            }
        })
        if (result == null) {
            console.warn(`input component ${fieldName} not found in component list.`)
        } else {
            return result;
        }
    }

    /**
     * Returns an component by id.
     * 
     * @param {string} __id__
     */
    _componentById(__id__) {
        let result;
        this._components.forEach((component) => {
            if (component.__id__ == __id__) {
                result = component
            }
        })
        if (result == null) {
            console.warn(`component ${__id__} not found in component list.`)
        } else {
            return result;
        }
    }
}