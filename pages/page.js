/**
 * Class representing a Page containing multiple view components.
 * Each component should be an instance of ViewComponentBase or Wrapper.
 */
class Page {
    components;

    /**
     * Create a Page instance.
     *
     * @param {string} parent_id
     * @param {string} id
     * @param {Array} components - The array of components to initialize the page with.
     * Each component should be an instance of ViewComponentBase or Wrapper.
     * @throws {Error} Throws an error if the components parameter is not an array or
     * if any element in the components array is not an instance of ViewComponentBase or Wrapper.
     */
    constructor(parent_id, id, components = []) {
        this.__parent_id__ = parent_id;
        this.__id__ = id;

        if (!Array.isArray(components)) {
            throw new Error("Components must be an array.");
        }

        components.forEach(component => {
            if (!(component instanceof ViewComponentBase) && !(component instanceof Wrapper)) {
                throw new Error("All components must be a subclass of ViewComponentBase or Wrapper.");
            }
        });

        this.components = components;
    }
}
