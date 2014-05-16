(function(window, angular) {
    'use strict';

    // Directive specification that is later attached to required inputs.
    var formValidationDirectiveSpecification = ['formValidationRegistration', formValidationDirective];

    // Registering AngularJS module.
    angular.module('ngFormValidation', ['ng'])
        .provider('formValidationDecorations', decorationsProvider)
        .provider('formValidationErrors', errorsProvider)
        .service('formValidationRegistration', [
            'formValidationDecorations', 'formValidationErrors',
            registrationService
        ])
        .directive('input', formValidationDirectiveSpecification)
        .directive('textarea', formValidationDirectiveSpecification)
        .directive('select', formValidationDirectiveSpecification)
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

            // Do not attach to already attached inputs.
            if (!alreadyAttached) {

                // Attaching our services to this input.
                formValidationDecorations.attach(scope, element, attrs, ngModel, ngForm, scopePath);
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
            className: classNameDecorator,
            bootstrap: bootstrapDecorator
        };
        builtInDecorators.default = builtInDecorators.className;

        var decorator = null;

        /**
         * Default traverser implementation.
         */
        var traverser = function(inputElement) {
            return inputElement;
        };

        /**
         * Sets traversing function.
         * @param {function} _traverser
         */
        self.setTraverser = function(_traverser) {
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
         *
         * @todo: #FA-120: angular-validation: re-decorate element only when validation state changes.
         */
        self.$get = function() {
            return {
                attach: function(scope, element, attrs, ngModel, ngForm, scopePath) {

                    /**
                     * Right now, we have to manually remember master value and listen for every
                     * change event in order to get notified when input gets to it's initial value.
                     * Probably, we should optimize this in the future by implementing something like
                     * "ngModel.isChanged" flag and adding watch for it.
                     */

                    // Master value is an initial value for the input.
                    // It is used to determine if input value is changed or not since last
                    // form submission.
                    var masterValue = null;

                    // Traversing DOM to find element that will be decorated.
                    // Called only once for each input.
                    // User-specified traversing function can be used.
                    var decoratedElement = traverser(element);

                    /**
                     * This function will determine input's state and re-decorate it accordingly.
                     *
                     * @param {*} value
                     */
                    var redecorateElement = function(value) {
                        // Comparing master value with current value to determine
                        // if this input was changed.
                        var hasValueChanged = !angular.equals(masterValue, value);

                        // Using default decorator if it's not set.
                        if (null === decorator) {
                            decorator = new builtInDecorators.default();
                        }

                        // If input is invalid.
                        if (ngModel.$invalid) {
                            // Decorating element as invalid.
                            decorator.decorateElement(decoratedElement, false);

                        // If input is valid and value has changed.
                        } else if (hasValueChanged) {
                            // Decorating element as valid.
                            decorator.decorateElement(decoratedElement, true);
                        } else {
                            decorator.clearDecorations(decoratedElement);
                        }
                    };

                    // Watching for input value change and updating the element.
                    scope.$watch(scopePath + '.$modelValue', function(value) {
                        redecorateElement(value);
                    });

                    // Watching for input pristine flag changes to catch it's initial value.
                    scope.$watch(scopePath + '.$pristine', function(pristine) {
                        if (pristine) {
                            masterValue = ngModel.$modelValue;
                        }
                    });

                    // Watching for form's pristine flag changes to redecorate
                    // this element when form is saved or reset.
                    scope.$watch(ngForm.$name + '.$pristine', function(pristine) {
                        if (pristine) {
                            redecorateElement(masterValue);
                        }
                    });
                }
            };
        };
    }

    /**
     * Provider for validation errors service.
     */
    function errorsProvider() {
        var self = this;

        var defaultLanguage = 'en';

        // Detecting client language.
        var language = window.navigator.userLanguage || window.navigator.language || defaultLanguage;

        /**
         * Default traverser implementation.
         * This traverser should return container element to which errors should be added.
         */
        var traverser = function(inputElement) {
            return inputElement.parent();
        };

        var constraintMessages = {
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
         * Returns message for specified constraint in most preferred language
         * with specified constraint parameter in place.
         *
         * @param {string} constraint
         * @param {*} constraintParameter
         *
         * @returns {string}
         */
        var getConstraintMessage = function(constraint, constraintParameter) {

            var message = '';

            var defaultMessages = constraintMessages[defaultLanguage];
            var messages = getElementByPreferredLanguage(constraintMessages, language);
            if (!messages) {
                messages = defaultMessages;
            }

            // If message is missing in this language.
            if (!messages[constraint]) {
                if (messages['generic']) {
                    // Returning generic message.
                    message = messages['generic'];
                } else if (defaultMessages[constraint]) {
                    // Returning message from default language.
                    message = defaultMessages[constraint];
                } else {
                    // Returning generic message from default language.
                    message = defaultMessages['generic'];
                }
            } else {
                // Returning error message.
                message =  messages[constraint];
            }

            return message.replace('{0}', constraintParameter);
        };

        /**
         * Default implementation of error list renderer.
         *
         * @param container        DOM element
         * @param {object} errors  List of errors
         */
        var errorListRenderer = {
            listClassName: 'error-list',
            listElementType: 'ul',

            /**
             * Gets present list element from the specified container.
             *
             * @param {jQuery} container
             * @returns {jQuery|null}
             */
            getListElement: function(container) {
                var self = this;
                var listElement = container.find(self.listElementType + '.' + self.listClassName);
                return (listElement.length > 0 ? listElement : null);
            },

            /**
             * Creates new list element inside of a specified container.
             *
             * @param {jQuery} container
             * @returns {jQuery}
             */
            createListElement: function(container) {
                var self = this;
                var listElement = $('<' + self.listElementType + '>')
                    .addClass(self.listClassName)
                ;
                container.append(listElement);
                return listElement;
            },

            /**
             * Removes specified list element.
             *
             * @param {jQuery} listElement
             */
            removeListElement: function(listElement) {
                listElement.remove();
            },

            /**
             * Gets present list item from the specified list element.
             *
             * @param {jQuery} listElement
             * @param {string} constraint
             * @returns {jQuery|null}
             */
            getListItem: function(listElement, constraint) {
                var self = this;
                var listItem = listElement.find('li.' + self.getListItemClassName(constraint));
                return (listItem.length > 0 ? listItem : null);
            },

            /**
             * Decorates list item.
             * Can be overloaded by end-user to customize error rendering.
             *
             * @param {jQuery} listItem
             */
            listItemDecorator: function(listItem) {
                // Do nothing.
            },

            /**
             * Creates new list item inside of a specified list element.
             *
             * @param {jQuery} listElement
             * @param {string} constraint
             * @param {*} constraintParameter
             *
             * @returns {jQuery}
             */
            createListItem: function(listElement, constraint, constraintParameter) {
                var self = this;
                var message = getConstraintMessage(constraint, constraintParameter);
                var listItem = $('<li>')
                    .addClass(self.getListItemClassName(constraint))
                    .append($('<p>').html(message))
                ;
                self.listItemDecorator(listItem);
                listElement.append(listItem);
                return listItem;
            },

            /**
             * Removes specified list item.
             *
             * @param {jQuery} listItem
             */
            removeListItem: function(listItem) {
                listItem.remove();
            },

            /**
             * Returns class name for list item.
             *
             * @param {string} constraint
             * @returns {string}
             */
            getListItemClassName: function(constraint) {
                return 'constraint-' + constraint;
            },

            /**
             * Renders error list of specified constraints inside of a specified container.
             *
             * @param {jQuery} container
             * @param {object} constraints
             * @param {object} constraintParameters
             */
            render: function(container, constraints, constraintParameters) {
                var self = this;

                var constraintsValid = areConstraintsValid(constraints);

                // Getting existing list element from the container.
                var listElement = self.getListElement(container);

                // If list element is missing and errors are present.
                if (!listElement && !constraintsValid) {
                    // Creating list element.
                    listElement = self.createListElement(container);
                }

                // If list element is present but there are no errors.
                if (listElement && constraintsValid) {
                    // Removing list element.
                    self.removeListElement(listElement);
                }

                // If errors are present.
                if (!constraintsValid) {
                    // Rendering error items.
                    self.renderErrorItems(listElement, constraints, constraintParameters);
                }
            },

            /**
             * Renders list items of specified constraints inside of a specified list element.
             *
             * @param {jQuery} listElement
             * @param {object} constraints
             * @param {object} constraintParameters
             */
            renderErrorItems: function(listElement, constraints, constraintParameters) {
                var self = this;
                angular.forEach(constraints, function(invalid, constraint) {
                    var listItem = self.getListItem(listElement, constraint);

                    // If list item is missing and constraint is invalid.
                    if (!listItem && invalid) {
                        // Creating list item.
                        self.createListItem(listElement, constraint, constraintParameters[constraint]);
                    }

                    // If list item is present, but constraint is valid.
                    if (listItem && !invalid) {
                        // Deleting list item.
                        listItem.remove();
                    }
                });
            }
        };

        /**
         * Sets language code.
         *
         * @param {string} _language  Language code
         */
        self.setLanguage = function(_language) {
            language = _language;
        };

        /**
         * Provides custom implementation of traverser.
         *
         * @param {function} _traverser
         */
        self.setTraverser = function(_traverser) {
            traverser = _traverser;

            // Maintaining chainability.
            return self;
        };

        /**
         * Returns current error list renderer.
         * You can retrieve renderer object and replace it's
         * properties and/or methods for customization.
         *
         * @returns {object}
         */
        self.getErrorListRenderer = function() {
            return errorListRenderer;
        };

        /**
         * Provides custom implementation of error list renderer.
         *
         * @param {function} _errorListRenderer
         * @returns {object}
         */
        self.setErrorListRenderer = function(_errorListRenderer) {
            errorListRenderer = _errorListRenderer;

            // Maintaining chainability.
            return self;
        };

        // Exposing some private functions to API.
        self.areConstraintsValid = areConstraintsValid;
        self.getConstraintMessage = getConstraintMessage;

        self.$get = function() {
            return {
                attach: function(scope, element, attrs, ngModel, ngForm, scopePath) {

                    var constraintParameters = collectConstraintParameters(attrs);

                    // Calling traverser to find proper DOM element for placing error list.
                    var listContainer = traverser(element);

                    // Watching for input value validity change.
                    scope.$watch(scopePath + '.$error', function(constraints) {
                        // Calling error list renderer to actually display the list.
                        errorListRenderer.render(listContainer, constraints, constraintParameters);
                    }, true);
                }
            };
        };
    }

    /**
     * Returns true if specified constraints are all valid, false otherwise.
     *
     * @param {object} constraints
     * @returns {boolean}
     */
    function areConstraintsValid(constraints) {
        var valid = true;
        angular.forEach(constraints, function(constraintInvalid) {
            if (constraintInvalid) {
                valid = false;
                return false;
            }
        });
        return valid;
    }

    /**
     * Returns the list of language codes from the
     * most preferred one to the least preferred.
     *
     * @param {string} languageCode
     * @returns {string[]}
     */
    function getPossibleLanguageCodes(languageCode) {
        var languageCodes = [];
        var parts = languageCode.split('-');
        while (parts.length > 0) {
            languageCodes.push(parts.join('-'));
            parts.pop();
        }
        return languageCodes;
    }

    /**
     *
     * @param registry
     * @param languageCode
     * @returns {*}
     */
    function getElementByPreferredLanguage(registry, languageCode) {
        var element = null;
        angular.forEach(getPossibleLanguageCodes(languageCode), function(languageCode) {
            if (registry[languageCode]) {
                element = registry[languageCode];
                return false;
            }
        });
        return element;
    }

    /**
     * Returns constraint parameters from input directive attributes.
     *
     * @param {object} attrs
     * @returns {object}
     */
    function collectConstraintParameters(attrs)
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
     * @constructor
     */
    function classNameDecorator() {

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
     * @extends classNameDecorator
     */
    function bootstrapDecorator() {

        // Extending classNameDecorator.
        var decorator = new classNameDecorator();

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

        // Setting classnames used in Bootstrap.
        decorator.setValidClassName('has-success');
        decorator.setInvalidClassName('has-error');

        // Returning modified instance.
        return decorator;
    }

})(window, angular);