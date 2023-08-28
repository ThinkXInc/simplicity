/**
 * Base DataModel Class
 * 
 * Example Usage:
 * 
 *     class User extends UserBase {
 *         constructor(defaults = {}) {
 *             // Call the parent constructor
 *             super(defaults);
 *     
 *             // Additional properties can be set here
 *             this.type = "StandardUser";  // Example additional property
 *         }
 *     
 *         // Additional methods can be added here
 *         // For example:
 *         display() {
 *             console.log(`User: ${this.json()}`);
 *         }
 *     
 *         // Overriding the update method (if needed)
 *         update(onSuccess, onFailed) {
 *             console.log("Updating User with additional logic");
 *             
 *             // Call the parent update method
 *             super.update(onSuccess, onFailed);
 *         }
 *     }
 * 
 *     const userData = {
 *         username: "john_doe",
 *         email: "john@example.com"
 *     };
 * 
 *     const user = new User(userData);
 * 
 *     const onSuccess = (data) => {
 *         console.log('User updated successfully:', data);
 *     };
 * 
 *     const onFailed = (error) => {
 *         console.error('Failed to update user:', error);
 *     };
 * 
 *     user.update(onSuccess, onFailed);
 * 
 */
class UserBase {
    constructor(defaults = {}) {
        // Object.assign won't work well with inherited properties
        // Use the following loop to copy properties instead
        for (let key in defaults) {
            if (defaults.hasOwnProperty(key)) {
                this[key] = defaults[key];
            }
        }
    }
  
    /**
     * Convert object to JSON.
     * @returns {string} JSON representation of the object
     */
    json() {
        return JSON.stringify(this);
    }

    /**
     * Update the server with the current state of the User object.
     * @param {function} onSuccess - Callback function for successful updates
     * @param {function} onFailed - Callback function for failed updates
     */
    update(onSuccess, onFailed) {
        const url = '/v1/users/update';
        const data = this.json();

        Http.post(url, JSON.parse(data), onSuccess, onFailed);
    }
}