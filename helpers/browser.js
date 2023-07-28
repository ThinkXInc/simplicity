'use strict';

/**
 * @fileoverview helpers/browser.js
 * Browser control class.
 * 
 * @author kaz@thinkxinc.com (Kazuki Otsuka)
 */
class Browser {
  /**
   * Update url in address bar.
   * 
   * @public
   * @param {string} path /path/to?key1=val1&key2=val2 or #key=val
   * @param {bool} withHTML whether to push the current html and title into history.
   */
  pushHistoryState(path, withHTML = true) {
    let htmlState = null;

    if (withHTML) {
      const html = this.getHTML();
      const title = document.title;
      htmlState = { html, pageTitle: title };
    }

    window.history.pushState(htmlState, "", path);
  }

  /**
   * Get html in <content>.
   * 
   * @returns {string} html in <document><content>
   */
  getHTML() {
    const html = document.getElementById('content').innerHTML;
    return html;
  }

  /**
   * Get search params string.
   * 
   * @returns {string} ?key1=value1&key2=value2
   */
  getSearchParamsString() {
    return window.location.search;
  }

  /**
   * Get relative path string.
   * 
   * @param {bool} withSearchParams whether to include search params
   * @param {bool} withHash whether to include hash string
   * @returns {string} /path/to?key1=val1&key2=val2#fragment
   */
  getRelativePath(withSearchParams = true, withHash = true) {
    let searchParams = new URLSearchParams(window.location.search);
    return `${window.location.pathname}?${searchParams.toString()}${window.location.hash}`;
  }

  /**
  * Get href string
  * 
  * @returns {string} https://domain.com/path/to?key1=val1&key2=val2
  */
  getURL() {
    return window.location.href;
  }

  /**
   * Get host string
   * 
   * @param withPort whether to add port number like :0000
   * @returns {string} https://domain.com/path/to?key1=val1&key2=val2
   */
  getHost(withPort = true) {
    if (withPort) {
      return window.location.host;
    } else {
      return window.location.hostname;
    }
  }

  /**
   * Get value from search params string /path/to?key=value.
   * 
   * @param {string} key 
   * @param {string} type  {'string', 'int', 'float'}
   * @returns {string/number} value according to the designated type. null if not in url.
   */
  getValueFromSearchParams(key, type = 'string') {
    let searchstring = window.location.search;
    console.log(`get value of ${key} in ${searchstring}`);
    let params = new Proxy(new URLSearchParams(searchstring), {
      get: function get(searchParams, prop) {
        return searchParams.get(prop);
      }
    });
    return this._getValueFromParams(key, type, params);
  }

  /**
   * Update value in query string /path/to?key=value.
   * 
   * @param {string} key target key
   * @param {string} value new value
   * @returns {string} new url string
   */
  updateValueInSearchParams(key, value, withHTML = true) {
    let searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, value);
    let newRelativePath = `${window.location.pathname}?${searchParams.toString()}`;
    this.pushHistoryState(newRelativePath, withHTML);
  }
  
  /**
   * Get value from hash string /path/to?key1=val1#key2=val2
   * 
   * @param {string} key 
   * @param {string} type  {'string', 'int', 'float'}
   * @returns {string/number} value according to the designated type. null if not in url.
   */
  getValueFromHash(key, type = 'string') {
    let searchstring = window.location.hash;
    console.log(`get value of ${key} in ${searchstring}`);
    let params = new Proxy(new URLSearchParams(searchstring.replace("#", "?")), {
      get: function get(searchParams, prop) {
        return searchParams.get(prop);
      }
    });
    return this._getValueFromParams(key, type, params);
  }
  
  /**
   * Update value in hash string /path/to?key1=val1#key2=val2
   * 
   * @param {string} key 
   * @param {string} value 
   * @param {boolean} withHTML 
   */
  updateValueInHash(key, value, withHTML = false) {
    let hash = window.location.hash.replace('#', '');
    let keyVals = (hash === '') ? [] : hash.split('&');
    let newhash = '';
    let foundInHash = false;
    console.log(`update hash ${hash} with key:${key} val:${value}`);
    
    keyVals.forEach((keyval, i) => {
      let [_key, _val] = keyval.split('=');
  
      if (_key === key) {
        foundInHash = true;
        newhash += (i === 0) ? `${_key}=${value}` : `&${_key}=${value}`;
      } else {
        newhash += (i === 0) ? `${_key}=${_val}` : `&${_key}=${_val}`;
      }
    });
  
    if (!foundInHash) {
      newhash += (newhash.length > 0) ? `&${key}=${value}` : `${key}=${value}`;
    }
  
    newhash = `#${newhash}`;
    this.pushHistoryState(newhash, withHTML);
    console.log(`hash string updated #${hash} -> ${newhash}`);
  }
  
  /**
   * Get value from params dict.
   * 
   * @param {string} key 
   * @param {string} type  {'string', 'int', 'float'}
   * @param {dict} params {key: value} dictionary
   * @returns {string/number} value according to the designated type. null if not in url.
   */
  _getValueFromParams(key, type = 'string', params) {
    if (params[key] == null) {
      console.error(`${key} not in the url query string.`);
    }

    console.log(`found ${key} in params. the value is ${params[key]}.`);

    switch (type) {
      case 'string':
        return params[key];
      case 'int':
        return parseInt(params[key]);
      case 'float':
        return parseFloat(params[key]);
      default:
        console.error(`${type} is unrecognized type to read query strings.`);
        return null;
    }
  }
}
