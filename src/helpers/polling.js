class PollingConfig {
    constructor() {
        this.maxRetryCount = 5;
        this.initialDelay = 3000;
        this.initialInterval = 500;
        this.maxInterval = 5000;
        this.backOffFactor = 1.5;
    }
}

class PollingManager {
    constructor(config = new PollingConfig()) {
        this.shouldStopPolling = false;
        this.config = config;
    }

    startPolling(request, requestArgs, expectedKey, onComplete, onFailure) {
        const performPolling = (retryCount, pollingInterval, params) => {
            if (this.shouldStopPolling || retryCount >= params.maxRetryCount) {
                if (retryCount >= params.maxRetryCount) {
                    onFailure("Max retry reached. Stopping polling.");
                }
                onComplete();
                return;
            }
    
            const onSuccessHandler = (res) => {

                if (!this._pollingResponseHandler(res, expectedKey, onComplete, onFailure)) {
                    const nextPollingInterval = Math.min(pollingInterval * params.backOffFactor, params.maxInterval);
                    setTimeout(() => performPolling(++retryCount, nextPollingInterval, params), nextPollingInterval);
                }
            };
    
            const onFailureHandler = (error) => {
                onFailure(error);
            };
    
            // Adjusting the request call here
            request(...requestArgs, onSuccessHandler, onFailureHandler);
        };
    
        setTimeout(() => performPolling(0, this.config.initialInterval, this.config), this.config.initialDelay);
    }

    _pollingResponseHandler(responseData, expectedKey, onComplete, onFailure) {
        if (this.shouldStopPolling) {
            onFailure("Already titles are retrieved. skip.");
            return true;
        }

        if (!responseData) {
            onFailure("Unexpected behavior in retrieveMaterialResults.");
            this.shouldStopPolling = true;
            return true;
        }

        const expectedValue = responseData[expectedKey];

        // NOTE: This doesn't allow even the empty string.
        // If the empty string is allowed, change to `expectedValue == null` 
        // and we need to disable the "reqired" option in title.
        // The 7B model sometimes miss title.
        if (!expectedValue) { // check if it exists or is non-empty
            if (responseData.success && responseData.success.message || responseData.code == 202) {
                console.log("Still waiting for processing...");
                return false;
            } else {
                onFailure(`Received empty or no value for ${this.expectedKey}. Stopping polling.`);
                this.shouldStopPolling = true;
                return true;
            }
        } else {
            console.log(`Successfully fetched results: ${expectedValue}`);
            this.shouldStopPolling = true;
            onComplete(responseData);
            return true;
        }

    }
}
//class PollingManager {
//    constructor(config = new PollingConfig()) {
//        this.shouldStopPolling = false;
//        this.config = config;
//    }
//
//    /**
//     * Starts polling using the provided request function and arguments.
//     * 
//     * @param {function} request - The function to call during each polling cycle.
//     * @param {array} requestArgs - The arguments to pass to the request function.
//     * @param {function} onComplete - Callback function to be executed when polling stops.
//     */
//    startPolling(request, requestArgs, onComplete) {
//        const performPolling = (retryCount, pollingInterval, params) => {
//            // Check for stopping conditions
//            if (this.shouldStopPolling || retryCount >= params.maxRetryCount) {
//                console.log(this.shouldStopPolling ? "Stopping polling." : "Max retry reached. Stopping polling.");
//                onComplete();  // Callback when polling is complete
//                return;
//            }
//
//            request(...requestArgs);
//
//            const nextPollingInterval = Math.min(pollingInterval * params.backOffFactor, params.maxInterval);
//
//            setTimeout(() => performPolling(++retryCount, nextPollingInterval, params), nextPollingInterval);
//        };
//
//        setTimeout(() => performPolling(0, this.config.initialInterval, this.config), this.config.initialDelay);
//    }
//
//
//    /**
//     * Abstract response handler for polling related responses.
//     *
//     * @param {object} responseData - The data portion of the API response.
//     * @param {string} expectedProperty - Expected property in the response data.
//     * @param {function} onSuccess - Callback function to be executed when the expected data is found.
//     */
//    pollingResponseHandler(responseData, expectedProperty, onSuccess) {
//        if (this.shouldStopPolling) {
//            console.warn(`already ${expectedProperty} is retrieved. skip.`);
//            return;
//        }
//
//        if (!responseData) {
//            console.error("Unexpected behavior in retrieveMaterialResults.");
//            this.shouldStopPolling = true;  // Stop the polling
//            return;
//        }
//
//        if (responseData.hasOwnProperty(expectedProperty) && responseData[expectedProperty] === null) {
//            console.warn(`Received null value for ${expectedProperty}. Stopping polling.`);
//            this.shouldStopPolling = true;  // Stop the polling
//            return;
//        }
//
//        if (!Array.isArray(responseData[expectedProperty])) {
//            if (responseData.success && responseData.success.message) {
//                console.log("Still waiting for processing...");
//            } else {
//                console.error("Unexpected behavior in retrieveMaterialResults.");
//                this.shouldStopPolling = true;  // Stop the polling
//            }
//            return;
//        }
//
//        this.shouldStopPolling = true;  // Stop the polling
//        onSuccess(responseData);
//    }
//}