(function(window, angular) {
    'use strict';

    // Directive specification that is later attached to required inputs.
    var formValidationDirectiveSpecification = ['formValidationRegistration', formValidationDirective];

    // Registering AngularJS module.
    angular.module('ngFormValidation', ['ng', 'ngInputModified'])
        .provider('formValidationDecorations', decorationsProvider)
        .provider('formValidationErrors', errorsProvider)
        .service('formValidationRegistration', [
            'formValidationDecorations', 'formValidationErrors',
            registrationService
        ])
        .directive('input',    formValidationDirectiveSpecification)
        .directive('textarea', formValidationDirectiveSpecification)
        .directive('select',   formValidationDirectiveSpecification)
    ;

    /**
     * Form validation directive.
     * @param {object} formValidationRegistration
     * @returns {object}
     */
    function formValidationDirective(formValidationRegistration)
    {
        return {
            restrict: 'E',
            require: ['?ngModel', '^?form'],
            priority: 10,
            link: function(scope, element, attrs, controllers) {
                var ngModel = controllers[0];
                var ngForm = controllers[1];
                if (null !== ngModel && null !== ngForm) {
                    formValidationRegistration
                        .register(scope, element, attrs, ngModel, ngForm)
                    ;
                }
            }
        };
    }

    /**
     * Service used to register provided services with input elements.
     * @param {object} formValidationDecorations
     * @param {object} formValidationErrors
     */
    function registrationService(formValidationDecorations, formValidationErrors)
    {
        // List of already attached elements.
        // This really helps with radio buttons for example.
        var attached = [];

        this.register = function(scope, element, attrs, ngModel, ngForm) {

            // Scope path is used to uniquely distinguish between different inputs
            // and to specify the $watch-es.
            var scopePath = ngForm.$name + '["' + ngModel.$name + '"]';

            var alreadyAttached = (attached.indexOf(scopePath) !== -1);

            formValidationDecorations.attach(scope, element, attrs, ngModel, ngForm, scopePath);

            // Do not attach to already attached inputs.
            if (!alreadyAttached) {

                // Attaching our services to this input.
                formValidationErrors.attach(scope, element, attrs, ngModel, ngForm, scopePath);

                // Adding this element to the list of already attached elements.
                attached.push(scopePath);
            }
        };
    }

    /**
 * Provider for decorations service.
 */
function decorationsProvider() {

    var self = this;

    var builtInDecorators = {
        className: ClassNameDecorator,
        bootstrap: BootstrapDecorator
    };
    builtInDecorators.default = builtInDecorators.className;

    var decorator = null;

    /**
     * Default traverser implementation.
     *
     * @param {jQuery} inputElement
     * @returns {*}
     */
    var traverser = function(inputElement) {
        return inputElement;
    };

    /**
     * Sets traversing function.
     * @param {function} _traverser
     */
    self.setTraverser = function(_traverser) {
        //noinspection JSValidateTypes
        traverser = _traverser;

        // Maintaining chainability.
        return self;
    };

    /**
     * Instructs directives to use one of built-in decorators:
     *   - default   (Default decorator, alias of "className")
     *   - className (Applies CSS classes)
     *   - bootstrap (Twitter Bootstrap Forms)
     *
     * Returns decorator instance for optional customization.
     *
     * @param {string} decoratorName
     * @returns {object}
     */
    self.useBuiltInDecorator = function(decoratorName) {
        if ('undefined' === typeof builtInDecorators[decoratorName]) {
            throw new Error('Unknown built-in decorator requested: ' + decoratorName + '.');
        }
        decorator = new builtInDecorators[decoratorName]();

        // Returning new decorator instance for optional customization.
        return decorator;
    };

    /**
     * Returns current decorator.
     *
     * @returns {object}
     */
    self.getDecorator = function() {
        return decorator;
    };

    /**
     * Sets current decorator.
     *
     * @param {object} _decorator
     */
    self.setDecorator = function(_decorator) {
        decorator = _decorator;
    };

    /**
     * Returns the service instance.
     */
    self.$get = function() {
        return {
            attach: function(scope, element, attrs, ngModel, ngForm, scopePath) {

                // Traversing DOM to find element that will be decorated.
                // Called only once for each input.
                // User-specified traversing function can be used.
                var decoratedElement = traverser(element);

                /**
                 * This function will determine input's state and re-decorate it accordingly.
                 */
                var redecorateElement = function() {
                    // Using default decorator if it's not set.
                    if (null === decorator) {
                        decorator = new builtInDecorators.default();
                    }
                    // If input is invalid.
                    if (ngModel.$invalid) {
                        // Decorating element as invalid.
                        decorator.decorateElement(decoratedElement, false);
                    // If input is valid and value has changed.
                    } else if (ngModel.modified) {
                        // Decorating element as valid.
                        decorator.decorateElement(decoratedElement, true);
                    } else {
                        // Removing all decorations if it's valid and not modified.
                        decorator.clearDecorations(decoratedElement);
                    }
                };

                // Re-decorating the element when it's state changes.
                scope.$watch(scopePath + '.$valid',    redecorateElement);
                scope.$watch(scopePath + '.$pristine', redecorateElement);
                scope.$watch(scopePath + '.modified',  redecorateElement);
            }
        };
    };
}
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

/**
 * @constructor
 */
function ClassNameDecorator() {

    var invalidClassName = 'invalid';
    var validClassName   = 'valid';

    return {
        setValidClassName: function(className) {
            validClassName = className;
            return this;
        },

        setInvalidClassName: function(className) {
            invalidClassName = className;
            return this;
        },

        decorateElement: function(element, valid) {
            if (valid) {
                element
                    .removeClass(invalidClassName)
                    .addClass(validClassName)
                ;
            } else {
                element
                    .removeClass(validClassName)
                    .addClass(invalidClassName)
                ;
            }
        },

        clearDecorations: function(element) {
            element
                .removeClass(invalidClassName)
                .removeClass(validClassName)
            ;
        }
    };
}
/**
 * @constructor
 * @extends ClassNameDecorator
 */
function BootstrapDecorator() {

    // Extending ClassNameDecorator.
    var decorator = new ClassNameDecorator();

    var elementClassName = 'has-feedback';
    var iconElementName = 'span';
    var iconClassName = 'form-control-feedback';

    //var iconValidClassName = 'glyphicon glyphicon-ok';
    //var iconInvalidClassName = 'glyphicon glyphicon-remove';

    var iconValidClassName = 'fa fa-check';
    var iconInvalidClassName = 'fa fa-exclamation-circle';

    var useIcons = true;

    // Saving parent function for future calls.
    var classNameDecorate = decorator.decorateElement;
    var classNameClearDecorations = decorator.clearDecorations;

    var getExistingIconElement = function($container) {
        var $iconElement = $container.find(iconElementName + '.' + iconClassName);
        return ($iconElement.length > 0 ? $iconElement : null);
    };

    var createIconElement = function($container) {
        var $iconElement = $('<' + iconElementName + '>')
            .addClass(iconClassName)
        ;
        $container.append($iconElement);
        return $iconElement;
    };

    decorator.decorateElement = function($decoratedElement, valid) {
        // Calling parent function.
        classNameDecorate.apply(this, arguments);

        // Decorating icons.
        if (useIcons) {

            // Making sure class is present for container.
            $decoratedElement.addClass(elementClassName);

            // Looking for existing icon element.
            var $iconElement = getExistingIconElement($decoratedElement);
            if (!$iconElement) {
                // Creating new icon element if it's missing.
                $iconElement = createIconElement($decoratedElement);
            }

            // Making sure proper class is set for icon element.
            if (valid) {
                $iconElement
                    .removeClass(iconInvalidClassName)
                    .addClass(iconValidClassName)
                ;
            } else {
                $iconElement
                    .removeClass(iconValidClassName)
                    .addClass(iconInvalidClassName)
                ;
            }
        }
    };

    decorator.clearDecorations = function($decoratedElement) {
        classNameClearDecorations.apply(this, arguments);
        if (useIcons) {
            var $iconElement = getExistingIconElement($decoratedElement);
            if ($iconElement) {
                $iconElement.remove();
            }
        }
    };

    // Setting classnames used in Bootstrap.
    decorator.setValidClassName('has-success');
    decorator.setInvalidClassName('has-error');

    // Returning modified instance.
    return decorator;
}
/**
 * Default implementation of error list renderer.
 *
 * @constructor
 */
function DefaultErrorListRenderer() {
    return {
        listClassName: 'error-list',
        listElementType: 'ul',
        listItemClassNamePrefix: 'constraint-',
        listItemElementType: 'li',

        /**
         * Used to extract constraint name from class name.
         */
        listItemConstraintRegExp: null,

        extractConstraintNameFromClassName: function(className) {
            if (!this.listItemConstraintRegExp) {
                this.listItemConstraintRegExp = new RegExp(this.listItemClassNamePrefix + '(\\S+)');
            }

            var result = this.listItemConstraintRegExp.exec(className);

            return (result[1] ? result[1] : null);
        },

        /**
         * Gets present list element from the specified container.
         *
         * @param {jQuery} $container
         * @returns {jQuery|null}
         */
        getListElement: function($container) {
            var $listElement = $container.find(this.listElementType + '.' + this.listClassName);
            return ($listElement.length > 0 ? $listElement : null);
        },

        /**
         * Creates new list element inside of a specified container.
         *
         * @param {jQuery} $container
         * @returns {jQuery}
         */
        createListElement: function($container) {
            var $listElement = $('<' + this.listElementType + '>')
                .addClass(this.listClassName)
            ;
            $container.append($listElement);
            return $listElement;
        },

        /**
         * Hides list element.
         *
         * @param {jQuery} $listElement
         */
        hideListElement: function($listElement) {
            hideElement($listElement);
        },

        /**
         * Shows list element.
         *
         * @param {jQuery} $listElement
         */
        showListElement: function($listElement) {
            showElement($listElement);
        },

        /**
         * Returns all existing list items.
         *
         * @param {jQuery} $listElement
         * @returns {jQuery} jQuery collection
         */
        getExistingListItems: function($listElement) {
            return $listElement.find(this.listItemElementType);
        },

        /**
         * Gets present list item from the specified list element
         * for specified constraint.
         *
         * @param {jQuery} $listElement
         * @param {string} constraint
         * @returns {jQuery|null}
         */
        getExistingListItem: function($listElement, constraint) {
            var $listItem = $listElement.find(
                this.listItemElementType + '.' + this.getListItemClassName(constraint)
            );
            return ($listItem.length > 0 ? $listItem : null);
        },

        /**
         * Decorates list item.
         * Can be overloaded by end-user to customize error rendering.
         *
         * @param {jQuery} $listItem
         */
        listItemDecorator: function($listItem) {
            // Do nothing.
        },

        /**
         * Creates new list item inside of a specified list element.
         *
         * @param {jQuery} $listElement
         * @param {string} constraint
         * @param {string} message
         *
         * @returns {jQuery}
         */
        createListItem: function($listElement, constraint, message) {
            // Creating element for list item.
            var $listItem = $('<' + this.listItemElementType + '>')
                .addClass(this.getListItemClassName(constraint))
                .html(message)
            ;

            // Calling decorator to decorate list item
            // before it will be appended to the DOM.
            this.listItemDecorator($listItem);

            // Appending element to the DOM.
            $listElement.append($listItem);

            return $listItem;
        },

        /**
         * Removes specified list item.
         *
         * @param {jQuery} $listItem
         */
        removeListItem: function($listItem) {
            $listItem.remove();
        },

        /**
         * Hides list item.
         *
         * @param {jQuery} $listItem
         */
        hideListItem: function($listItem) {
            hideElement($listItem);
        },

        /**
         * Shows list item.
         *
         * @param {jQuery} $listItem
         */
        showListItem: function($listItem) {
            showElement($listItem);
        },

        /**
         * Returns class name for list item.
         *
         * @param {string} constraint
         * @returns {string}
         */
        getListItemClassName: function(constraint) {
            // noinspection JSPotentiallyInvalidUsageOfThis
            return (this.listItemClassNamePrefix + constraint);
        },

        /**
         * Renders error list of specified constraints inside of a specified container.
         *
         * @param {jQuery} $container
         * @param {object} errorList
         */
        render: function($container, errorList) {

            var hasErrors = !isObjectEmpty(errorList);

            // Getting existing list element from the container.
            var $listElement = this.getListElement($container);

            if (hasErrors) {
                if (!$listElement) {
                    $listElement = this.createListElement($container);
                }

                // Rendering error items.
                this.renderErrorItems($listElement, errorList);

                // Showing list element.
                this.showListElement($listElement);

            } else {
                if ($listElement) {
                    this.hideListElement($listElement);
                }
            }
        },

        /**
         * Renders list items of specified constraints inside of a specified list element.
         *
         * @param {jQuery} $listElement
         * @param {object} errorList
         */
        renderErrorItems: function($listElement, errorList) {
            var self = this;

            // Iterating over list items and removing no longer needed ones.
            angular.forEach(this.getExistingListItems($listElement), function(listItem) {
                var $listItem = $(listItem);

                var className = $listItem.attr('class');

                var constraint = self.extractConstraintNameFromClassName(className);

                if (constraint) {
                    // If this constraint is not in the list of active errors.
                    if (!errorList[constraint]) {
                        // Hiding this list item.
                        self.hideListItem($listItem);
                    }
                } else {
                    // Removing list item if we can't match it.
                    self.removeListItem($listItem);
                }
            });

            // Iterating over errors and showing list items.
            angular.forEach(errorList, function(message, constraint) {
                var $listItem = self.getExistingListItem($listElement, constraint);
                if (!$listItem) {
                    $listItem = self.createListItem($listElement, constraint, message);
                }
                self.showListItem($listItem);
            });
        }
    };
}
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

    /**
 * Returns true if specified object has no properties,
 * false otherwise.
 *
 * @param {object} object
 * @returns {boolean}
 */
function isObjectEmpty(object)
{
    if ('object' !== typeof object) {
        throw new Error('Object must be specified.');
    }

    if ('undefined' !== Object.keys) {
        // Using ECMAScript 5 feature.
        return (Object.keys(object).length === 0);
    } else {
        // Using legacy compatibility mode.
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
}

/**
 * Hides specified element.
 *
 * @param {jQuery} $element
 */
function hideElement($element)
{
    if ('undefined' !== $element.hide) {
        $element.hide();
    } else {

        // Saving old display mode.
        $element.data('oldDisplayMode', $element.css('display'));

        // Hiding the element.
        $element.css('display', 'none');
    }
}

/**
 * Shows specified element.
 *
 * @param {jQuery} $element
 */
function showElement($element)
{
    if ('undefined' !== $element.show) {
        $element.show();
    } else {

        var displayMode = $element.data('oldDisplayMode');
        if (!displayMode) {
            // @todo: Determine default display mode by elements type.
            displayMode = 'block';
        }

        // Showing the element.
        $element.css('display', displayMode);
    }
}

})(window, angular);