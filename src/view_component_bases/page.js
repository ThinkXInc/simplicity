/**
 * Represents a page consisting of a collection of components. 
 * Each component must be an instance of ViewComponentBase or Wrapper.
 *
 * @extends ViewComponentBase
 * 
 * @param {string} id - The unique identifier for the page.
 * @param {Array} components - An array of components that make up the page.
 * 
 * @throws {Error} If the components parameter is not an array or if any component 
 * is not a subclass of ViewComponentBase or Wrapper.
 */
class Page {
    components;

    /**
     * Create a Page instance.
     *
     * @param {string} parent_id
     * @param {string} page_id
     * @param {Array} components - The array of components to initialize the page with.
     * Each component should be an instance of ViewComponentBase or Wrapper.
     * @throws {Error} Throws an error if the components parameter is not an array or
     * if any element in the components array is not an instance of ViewComponentBase or Wrapper.
     */
    constructor(parent_id, page_id, components = []) {
        debuglog(`Construct ${page_id}`)
        this.__parent_id__ = parent_id;
        this.__id__ = page_id;

        console.log(components);
        if (!Array.isArray(components)) {
            throw new Error(`Components must be an array, but got ${typeof components}.`);
        }

        components.forEach(component => {
            if (!Utils.isInheritedFrom(component, ViewComponentBase) && !Utils.isInheritedFrom(component, Wrapper)) {
                throw new Error(`All components must be a subclass of ViewComponentBase or Wrapper, but got ${component.constructor.name}.`);
            }
        });

        this.components = components;
    }

    setElements(pageIndex) {
        // create page DOM element
        this.$view = document.createElement('div');
        this.$view.id = this.__id__;
        this.$view.classList.add('inputPageViewPage');
        this.$view.classList.add(this.__id__);
        this.$view.dataset.pageIndex = pageIndex;
    
        // set page index
        this.setPageIndex(pageIndex);
    }

    /**
     * Set page index. 
     * 
     * This method is called before page components are set in the view controller.
     * @param {int} pageIndex 
     */
    setPageIndex(pageIndex) {
        this.pageIndex = pageIndex;
    }

    /**
     * Create a component ID with a consistent format.
     * 
     * @param {string} parent_id - The ID of the parent component.
     * @param {string} page_id - The ID of the current page.
     * @param {string} component_class_name - The class name of the component.
     * @param {string} [field_name=""] - Optional. The name of the field, if the component is a form.
     * @param {string} [role=""] - Optional. The role of the component.
     * 
     * @returns {string} The created component ID.
     * 
     * Example:
     * createComponentId('signupView', 'lastNameFirstNamePage', 'TextField', 'first_name')
     * returns 'signupView__lastNameFirstNamePage__TextField__first_name'
     */
    static createComponentId(parent_id, page_id, component_class_name, field_name = "", role = "") {
        let parts = [parent_id, page_id, component_class_name];
    
        if (field_name) {
            parts.push(field_name);
        }
    
        if (role) {
            parts.push(role);
        }
    
        return parts.join("__");
    }
    
    /**
     * Create a locale key with a consistent format.
     * 
     * @param {string} page_id - The page id 
     * @param {string} component_class_name - The class name of the component.
     * @param {string} [field_name=""] - Optional. The name of the field, if the component is a form.
     * @param {string} [role=""] - Optional. The role of the component.
     * 
     * @returns {string} The created locale key.
     * 
     * Example:
     * createLocaleKey('LastNameFirstNamePage', 'TextField', 'first_name', 'title')
     * returns 'LastNameFirstNamePage__TextField__first_name__title'
     */
    static createLocaleKey(page_id, component_class_name, field_name = "", role = "") {
        let parts = [page_id, component_class_name];

        if (field_name) {
            parts.push(field_name);
        }

        if (role) {
            parts.push(role);
        }

        return parts.join("__");
    }
}
