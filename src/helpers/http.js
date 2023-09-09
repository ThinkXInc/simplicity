/**
 * Class Http.
 */
class Http {

    /**
     * HTTP GET to fetch data.
     * 
     * @param {string} url - The URL from which data should be fetched.
     * @param {function} onSuccess - The callback function to be invoked when the request is successful.
     * @param {function} onFailed - The callback function to be invoked when the request fails.
     * 
     * Example usage:
     * 
     * const url = 'https://example.com/api/data';
     * 
     * const onSuccess = (response) => {
     *     console.log(`Success! Response: ${response}`);
     * };
     * 
     * const onFailed = (error) => {
     *     console.error(`Failed! Error: ${error}`);
     * };
     * 
     * Http.get(url, onSuccess, onFailed);
     * 
     */
    static get(url, onSuccess, onFailed) {

        debuglog('------> GET Request Initiated');  // DEBUG:
        console.log(`[Requesting data from] ${url}`);
        console.log('<------ GET Request Initiated');  // DEBUG:

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                // HTTP 404 or other non-ok status
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            console.info(`${url} response received:`, data);
            onSuccess(data);
        })
        .catch((error) => {
            console.info(`${url} request failed:`, error);
            onFailed(error);
        })
    }

    /**
     * HTTP POST to submit data.
     * 
     * @param {string} url - The URL to which the POST request should be sent.
     * @param {object} data - The data to be sent with the POST request.
     * @param {function} onSuccess - The callback function to be invoked when the request is successful.
     * @param {function} onFailed - The callback function to be invoked when the request fails.
     * 
     * Example usage:
     * 
     * const url = 'https://example.com/api';
     * const data = {
     *     key1: 'value1',
     *     key2: 'value2'
     * };
     * 
     * const onSuccess = (response) => {
     *     console.log(`Success! Response: ${response}`);
     * };
     * 
     * const onFailed = (error) => {
     *     console.error(`Failed! Error: ${error}`);
     * };
     * 
     * Http.post(url, data, onSuccess, onFailed);
     * 
     */
    static post(url, data, onSuccess, onFailed) {

        debuglog('------> Request Payload');  // DEBUG:
        console.log(`[Request data] ${JSON.stringify(data)}`);
        console.log('<------ Request Payload');  // DEBUG:

        fetch(
            url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
        .then(response => {
            if (!response.ok) {
                // HTTP 404 or other non-ok status
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            console.info(`${url} response received:`, data);
            onSuccess(data);
        })
        .catch((error) => {
            console.info(`${url} request failed:`, error);
            onFailed(error);
        })
    }
}
