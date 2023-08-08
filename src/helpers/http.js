/**
 * Class Http.
 */
class Http {
    /**
     * HTTP POST to submit data.
     * 
     * @param {string} url - The URL to which the POST request should be sent.
     * @param {object} data - The data to be sent with the POST request.
     * @param {function} onsuccess - The callback function to be invoked when the request is successful.
     * @param {function} onfailed - The callback function to be invoked when the request fails.
     * 
     * Example usage:
     * 
     * const url = 'https://example.com/api';
     * const data = {
     *     key1: 'value1',
     *     key2: 'value2'
     * };
     * 
     * const onsuccess = (response) => {
     *     console.log(`Success! Response: ${response}`);
     * };
     * 
     * const onfailed = (error) => {
     *     console.error(`Failed! Error: ${error}`);
     * };
     * 
     * Http.post(url, data, onsuccess, onfailed);
     * 
     */
    static post(url, data, onsuccess, onfailed) {

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
}
