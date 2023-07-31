'use strict';

/**
 * Country class to handle operations related to country data.
 * 
 * This class depends on `countriesISO3166` which is expected to be in the following format:
 * 
 * {
 *   "alpha2": ["AF", "..."],
 *   "numeric": ["004", "..."],
 *   "dial": ["93", "..."],
 *   "en": ["Afghanistan", "..."],
 *   "zh": ["\u963f\u5bcc\u6c57", "..."],
 *   "fr": ["Afghanistan", "..."],
 *   "ja": [],
 *   "ru": ["\u0410\u0444\u0433\u0430\u043d\u0438\u0441\u0442\u0430\u043d", "..."]
 * }
 * 
 */
class Country {
  constructor() {
    this.countriesISO3166 = countriesISO3166;
    this.LANG_KEYS = ['ja', 'en', 'zh', 'fr', 'es', 'ru', 'ar'];
    this.DEFAULT_LANG = 'en';
  }

  /**
   * Returns names list in designated language.
   * 
   * @param {string} lang - eg. ja, en, .. 
   * @returns {Array} - eg. ['Afghanistan', 'Albania',..]
   */
  countryNames(lang) {
    var _lang = !this.LANG_KEYS.includes(lang) ? this.DEFAULT_LANG : lang;
    var country_names = this.countriesISO3166[_lang];
    return country_names;
  }

  /**
   * Returns ISO3166-1-numeric list.
   * 
   * @returns {Array} - eg. [4, 8,..]
   */
  countryNumerics() {
    var country_numerics = this.countriesISO3166['numeric'];
    return country_numerics;
  }

  /**
   * Returns dial country code list.
   * 
   * @param {string} lang - eg. ja, en, .. 
   * @returns {Array} - eg. ['93', '355', ..]
   */
  countryDials(lang) {
    var _lang = !this.LANG_KEYS.includes(lang) ? this.DEFAULT_LANG : lang;
    var country_dials = this.countriesISO3166['dial'];
    return country_dials;
  }

  /**
   * Returns ISO3166 alpha2 country code
   * 
   * @returns {Array} - eg. 
   */
  countryCodes() {
    var country_codes = this.countriesISO3166['alpha2'];
    return country_codes;
  }

  /**
   * Returns [names, dials, codes] data defined above.
   * 
   * @param {string} lang - eg. ja, en, .. 
   * @returns {object} countries
   *  - countries.names  # (name, numeric)
   *  - countries.dials  # (name, dial, numeric)
   *  - countries.codes  # (alpha2)
   */
  countriesFormData(lang) {
    var names = this.countryNames(lang);
    var numerics = this.countryNumerics();
    var dials = this.countryDials(lang);
    var codes = this.countryCodes();

    let countriesData = names.map((name, i) => ({
      name: name,
      numeric: numerics[i],
      dial: dials[i],
      code: codes[i]
    }));

    return countriesData;
  }
}