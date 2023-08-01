/**
 * A class for Wrapper components.
 * 
 * NOTE: <div class=wrapper> is created in the constructor of 
 *       InputPageViewController after this function is called.
 * 
 * <code>
 *       new Wrapper(
 *             'theParentView',
 *             'firstNameLastNameWrapper',
 *             [
 *                new TextField('firstName'),
 *                new TextField('lastName')
 *             ]
 *        );
 * </code>
 *
 * @constructor
 * @param {string} parent_id - The id of the parent element.
 * @param {string} id - The id for the new element.
 * @param {Array} components - view components
 */
class Wrapper extends ViewComponentBase {
    components;

    constructor(parent_id, id, components, htmlTag='div') {
        super(parent_id, id, '', htmlTag);

        if (!Array.isArray(components)) {
            throw new Error(`Components must be an array, but got ${typeof components}.`);
        }

        components.forEach(component => {
            if (!(component instanceof ViewComponentBase)) {
                throw new Error("All components must be a subclass of ViewComponentBase.");
            }
        });

        this.components = components;
    }

    /**
     * Overrides the _setElements method in the base class.
     */
    _setElements(text, htmlTag) {
        super._setElements(text, htmlTag);

        this.$view.classList.add('wrapper');
    }

    /**
     * Set the event handler for the button. If the view controller is set and the method 
     * backButtonTapped exists in the view controller, this method will be called when the button is clicked.
     */
    _setEventHandlers() {
    }


}