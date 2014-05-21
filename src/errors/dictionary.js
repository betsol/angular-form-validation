function LanguageStringDictionary()
{
    var fallbackLanguage = 'en';

    // Detecting client language.
    // noinspection JSUnresolvedVariable
    var defaultLanguage = (window.navigator.userLanguage || window.navigator.language || fallbackLanguage);

    /**
     * Registry contains the list of dictionaries for different languages.
     *
     * @type {object}
     */
    var registry = {
        'en': {
            generic   : 'Please enter a correct value',
            required  : 'Please fill in this required field',
            email     : 'Please specify valid E-Mail address',
            minlength : 'Please enter a value not less than {0} characters',
            maxlength : 'Please enter a value not greater than {0} characters',
            number    : 'Please enter a correct number',
            min       : 'Please enter a number not less than {0}',
            max       : 'Please enter a number not greater than {0}',
            pattern   : 'Please enter a correct value according to specified rules',
            url       : 'Please enter a valid URL address'
        },
        'ru': {
            generic   : 'Пожалуйста введите корректное значение',
            required  : 'Пожалуйста заполните это обязательное поле',
            email     : 'Пожалуйста укажите корректный E-Mail адрес',
            minlength : 'Пожалуйста укажите значение не короче {0} символов',
            maxlength : 'Пожалуйста укажите значение не длиннее {0} символов',
            number    : 'Пожалуйста введите корректное число',
            min       : 'Пожалуйста укажите число не меньше чем {0}',
            max       : 'Пожалуйста укажите число не больше чем {0}',
            pattern   : 'Пожалуйста введите значение в соответствии с указанными требованиями',
            url       : 'Пожалуйста укажите корректный URL адрес'
        }
    };

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