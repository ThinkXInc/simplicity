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
    constructor(id, components = []) {
        debuglog(`Construct ${id}`)
        this.id = id;

        console.log(id);
        console.log(components);
        if (!Array.isArray(components)) {
            console.log(components)
            throw new Error(`Components must be an array, but got ${typeof components}.`);
        }

        //components.forEach(component => {
        //    if (!Utils.isInheritedFrom(component, ViewComponentBase) && !Utils.isInheritedFrom(component, Wrapper)) {
        //        throw new Error(`All components must be a subclass of ViewComponentBase or Wrapper, but got ${component.constructor.name}.`);
        //    }
        //});

        this.components = components;
    }

    setElements(pageIndex) {
        // create page DOM element
        this.$view = document.createElement('div');
        this.$view.id = this.id;
        this.$view.classList.add('inputPageViewPage');
        this.$view.classList.add(this.id);
        this.$view.dataset.pageIndex = pageIndex;
        debuglog(`page elementId=${this.id} is created. (page index ${pageIndex})`)
    
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
     * @param {string} pageId - The ID of the current page.
     * @param {string} component_class_name - The class name of the component.
     * @param {string} [fieldName=""] - Optional. The name of the field, if the component is a form.
     * @param {string} [role=""] - Optional. The role of the component.
     * 
     * @returns {string} The created component ID.
     * 
     * Example:
     * generateComponentId('lastNameFirstNamePage', 'TextField', 'first_name')
     * returns 'lastNameFirstNamePage__TextField__first_name'
     */
    static generateComponentId(pageId, component_class_name, fieldName = "", role = "") {
        let parts = [pageId, component_class_name];
    
        if (fieldName) {
            parts.push(fieldName);
        }
    
        if (role) {
            parts.push(role);
        }
    
        return parts.join("__");
    }
    
    /**
     * Create a locale key with a consistent format.
     * 
     * @param {string} id - The page id 
     * @param {string} component_class_name - The class name of the component.
     * @param {string} [fieldName=""] - Optional. The name of the field, if the component is a form.
     * @param {string} [role=""] - Optional. The role of the component.
     * 
     * @returns {string} The created locale key.
     * 
     * Example:
     * generateLocaleKey('LastNameFirstNamePage', 'TextField', 'first_name', 'title')
     * returns 'LastNameFirstNamePage__TextField__first_name__title'
     */
    static generateLocaleKey(id, component_class_name, fieldName = "", role = "") {
        let parts = [id, component_class_name];

        if (fieldName) {
            parts.push(fieldName);
        }

        if (role) {
            parts.push(role);
        }

        return parts.join("__");
    }
}
