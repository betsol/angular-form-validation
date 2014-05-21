/**
 * Provider for validation errors service.
 */
function errorsProvider() {
    var self = this;

    var traverser;
    var language;
    var dictionary;
    var errorListRenderer;

    /**
     * Sets custom implementation of traverser.
     *
     * @param {function} _traverser
     */
    self.setTraverser = function (_traverser) {
        // noinspection JSValidateTypes
        traverser = _traverser;

        // Maintaining chainability.
        return self;
    };

    /**
     * Sets language code.
     *
     * @param {string} _language  Language code
     */
    self.setLanguage = function (_language) {
        language = _language;

        // Maintaining chainability.
        return self;
    };

    /**
     * Sets custom implementation of dictionary.
     *
     * @param {object} _dictionary
     * @returns {errorsProvider}
     */
    self.setDictionary = function (_dictionary) {
        dictionary = _dictionary;

        // Maintaining chainability.
        return self;
    };

    /**
     * Sets custom implementation of error list renderer.
     *
     * @param _errorListRenderer
     */
    self.setErrorListRenderer = function (_errorListRenderer) {
        errorListRenderer = _errorListRenderer;

        // Maintaining chainability.
        return self;
    };

    /**
     * Returns current error list renderer.
     * You can retrieve default renderer object and override it's
     * properties and/or methods for customization.
     *
     * @returns {object}
     */
    self.getDefaultErrorListRenderer = function () {
        return new DefaultErrorListRenderer();
    };

    self.$get = function () {

        if (!traverser) {
            // Using default traverser if it's not specified.
            traverser = defaultErrorsTraverser;
        }

        if (!dictionary) {
            // Using default dictionary if it's not specified.
            dictionary = new LanguageStringDictionary();
        }

        if (!errorListRenderer) {
            // Using default error list renderer if it's not specified.
            errorListRenderer = new DefaultErrorListRenderer();
        }

        return {
            attach: function ($scope, $element, attrs, ngModel, ngForm, scopePath) {

                var constraintParameters = collectConstraintParameters(attrs);

                // Calling traverser to find proper DOM element for placing error list.
                var $listContainer = traverser($element);

                // Watching for input value validity change.
                $scope.$watch(scopePath + '.$error', function (constraints) {

                    var errorList = {};
                    angular.forEach(constraints, function(invalid, name) {
                        if (invalid) {
                            var parameters;
                            if (constraintParameters[name]) {
                                parameters = [constraintParameters[name]];
                            }
                            errorList[name] = dictionary.getString(name, parameters, language);
                        }
                    });

                    // Calling error list renderer to actually display the list.
                    errorListRenderer.render($listContainer, errorList);
                }, true);
            }
        };
    };
}

/**
 * Returns constraint parameters from input directive attributes.
 *
 * @param {object} attrs
 * @returns {object}
 */
function collectConstraintParameters (attrs)
{
    var parameters = {};

    if (attrs['ngMinlength']) {
        parameters['minlength'] = parseInt(attrs['ngMinlength']);
    }

    if (attrs['ngMaxlength']) {
        parameters['maxlength'] = parseInt(attrs['ngMaxlength']);
    }

    if (attrs['min']) {
        parameters['min'] = parseFloat(attrs['min']);
    }

    if (attrs['max']) {
        parameters['max'] = parseFloat(attrs['max']);
    }

    return parameters;
}

/**
 * Default traverser implementation.
 * This traverser should return container element to which errors should be added.
 *
 * @param {jQuery} $element
 * @returns {jQuery}
 */
function defaultErrorsTraverser($element) {
    return $element.parent();
}

// @@include('errors/renderers/default.js')
// @@include('errors/dictionary.js')
