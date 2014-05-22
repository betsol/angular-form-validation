function LanguageStringDictionary()
{
    var fallbackLanguage = 'en';

    // Detecting client language.
    // noinspection JSUnresolvedVariable
    var defaultLanguage = (window.navigator.userLanguage || window.navigator.language || fallbackLanguage);

    // @@include('errors/dictionary/registry.js')

    /**
     * Derives all possible language codes from the specified one.
     * Returns the list of language codes from the most preferred
     * one to the least preferred.
     *
     * @param {string} languageCode
     * @returns {string[]}
     */
    var deriveLanguageCodes = function (languageCode) {
        var languageCodes = [];
        var parts = languageCode.split('-');
        while (parts.length > 0) {
            languageCodes.push(parts.join('-'));
            parts.pop();
        }
        return languageCodes;
    };

    /**
     * Returns dictionary for specified language.
     *
     * @param language
     * @returns {*}
     */
    var getDictionaryForLanguage = function (language) {
        var dictionary = null;
        var languageCodes = deriveLanguageCodes(language);
        for (var key in languageCodes) {
            if (languageCodes.hasOwnProperty(key)) {
                var languageCode = languageCodes[key];
                if (registry[languageCode]) {
                    dictionary = registry[languageCode];
                    break;
                }
            }
        }
        return dictionary;
    };

    return {
        /**
         * Returns specified message in most preferred language
         * with specified parameter in place.
         *
         * @param {string} name
         * @param {array|undefined} parameters
         * @param {string|undefined} language
         *
         * @returns {string}
         */
        'getString': function (name, parameters, language) {

            if ('undefined' === typeof language) {
                language = defaultLanguage;
            }

            var message = '';

            // Accessing registry directly, no need for fancy logic here.
            // Fallback language is always present in registry as it is.
            var fallbackDictionary = registry[fallbackLanguage];

            // Getting most preferred dictionary for specified language.
            var dictionary = getDictionaryForLanguage(language);

            // If string is missing from this dictionary.
            if (!dictionary[name]) {
                if (dictionary['generic']) {
                    // Returning generic message.
                    message = dictionary['generic'];
                } else if (fallbackDictionary[name]) {
                    // Returning message from fallback dictionary.
                    message = fallbackDictionary[name];
                } else {
                    // Returning generic message from fallback dictionary.
                    message = fallbackDictionary['generic'];
                }
            } else {
                // Returning error message.
                message = dictionary[name];
            }

            // Filling in parameters.
            if ('undefined' !== typeof parameters) {
                for (var i in parameters) {
                    if (parameters.hasOwnProperty(i)) {
                        message = message.replace('{' + i + '}', parameters[i]);
                    }
                }
            }

            return message;
        }
    };
}