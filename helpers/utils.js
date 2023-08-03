
class Utils {
    /**
     * Checks whether a given object is inherited from a specified superclass.
     * 
     * @param {Object} object - The object to check.
     * @param {Function} superClass - The superclass to compare against.
     * @returns {boolean} - True if the object is a subclass of the superclass, false otherwise.
     */
    static isInheritedFrom(object, superClass) {
        let currentProto = Object.getPrototypeOf(object.constructor);

        while (currentProto) {
            if (currentProto.name === superClass.name) {
                return true;
            }
            currentProto = Object.getPrototypeOf(currentProto);
        }
        return false;
    }
}
