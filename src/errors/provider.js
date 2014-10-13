/**
 * Provider for validation errors service.
 */
function errorsProvider() {

    var self = this;

    var traverser;
    var language;
    var dictionary;

    var builtInErrorListRenderers = {
        default: DefaultErrorListRenderer,
        bootstrap: BootstrapErrorListRenderer
    };

    var errorListRenderer = null;

    /**
     * Instructs directives to use one of built-in error list renderers:
     *   - default   (Default renderer)
     *   - bootstrap (Bootstrap 3)
     *
     * Returns error list renderer instance for optional customization.
     *
     * @param {string} rendererName
     * @returns {object}
     */
    self.useBuiltInErrorListRenderer = function(rendererName) {
        if ('undefined' === typeof builtInErrorListRenderers[rendererName]) {
            throw new Error('Unknown built-in error list renderer requested: ' + rendererName + '.');
        }
        errorListRenderer = new builtInErrorListRenderers[rendererName]();

        // Returning new renderer instance for optional customization.
        return errorListRenderer;
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
     * Sets custom implementation of traverser.
     *
     * @param {function} _traverser
     */
    self.useTraverser = function (_traverser) {

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
     * Builds list of errors from constraints and constraint parameters.
     *
     * @param {object} constraints
     * @param {object} constraintParameters
     * @returns {object}
     */
    self.buildErrorListFromConstraints = function(constraints, constraintParameters) {
        var errorList = {};
        angular.forEach(constraints, function(invalid, name) {
            if (invalid) {
                var parameters;
                if (name in constraintParameters) {
                    parameters = [constraintParameters[name]];
                }
                errorList[name] = dictionary.getString(name, parameters, language);
            }
        });
        return errorList;
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
            self.useBuiltInErrorListRenderer('default');
        }

        return {

            attach: function ($scope, $element, attrs, ngModel, ngForm, scopePath) {

                var constraintParameters = collectConstraintParameters(attrs);

                // Calling traverser to find proper DOM element for placing error list.
                var $listContainer = traverser($element);

                var updateState = function() {
                    if ((ngModel.$dirty || ngModel.validationForced) && ngModel.$invalid) {

                        // Building the list of errors.
                        var errorList = self.buildErrorListFromConstraints(ngModel.$error, constraintParameters);

                        // Calling error list renderer to actually display the list.
                        errorListRenderer.render($listContainer, errorList);

                    } else {

                        // Calling error list renderer to hide the list.
                        errorListRenderer.clear($listContainer);
                    }
                };

                // Watching for input value validity change.
                $scope.$watch(scopePath + '.$error', updateState, true);

                // Watching for pristine/dirty state change.
                $scope.$watch(scopePath + '.$pristine', updateState);

                // Watching for validation force.
                $scope.$watch(scopePath + '.validationForced', updateState);
            },

            /**
             * @param {string} formName
             * @param {string} inputName
             * @param {object|array} errorList
             * @param {boolean} temp
             */
            renderErrorList: function(formName, inputName, errorList, temp) {

                var $element = getInputByName(formName, inputName);

                var $listContainer = traverser($element);

                // When temporary errors are rendered
                // we need to watch for a single change of the input value
                // in order to remove temporary errors.
                if (temp) {
                    $element.one('input', function() {
                        errorListRenderer.clearTemporary($listContainer);
                    });
                }

                errorListRenderer.render($listContainer, errorList, temp);
            },

            /**
             * Returns active error list renderer.
             *
             * @returns {object}
             */
            getErrorListRenderer: function() {
                return errorListRenderer;
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
// @@include('errors/renderers/bootstrap.js')
// @@include('errors/dictionary.js')
