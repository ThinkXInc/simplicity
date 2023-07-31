/**
 * A class for Wrapper components.
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
        // Call the constructor of the base class
        super(parent_id, id, '', htmlTag);

        // components
        this.components = components;
   }

    /**
     * Overrides the _setElements method in the base class.
     */
    _setElements(text, htmlTag) {
        super._setElements(text, htmlTag);

        this.$view.classList.add('wrapper');

        // NOTE: <div class=wrapper> is created in the constructor of 
        // InputPageViewController after this function is called.
        //this.$wrapper = document.getElementById(this.__id__);
        //if (this.$wrapper == null) {
        //    console.warn(
        //        `<div id=${this.__id__} class=wrapper></div> is necessary in HTML.`);
        //}
    }

    /**
     * Set the event handler for the button. If the view controller is set and the method 
     * backButtonTapped exists in the view controller, this method will be called when the button is clicked.
     */
    _setEventHandlers() {
    }


}