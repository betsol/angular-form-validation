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
        .service('formValidationHelper', [
            'formValidationDecorations', 'formValidationErrors',
            helperService
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

            // Adding common functions.
            commonFunctions(ngForm, ngModel);

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
     * Adds common functions to form and model controllers.
     *
     * @param {object} ngForm
     * @param {object} ngModel
     */
    function commonFunctions(ngForm, ngModel)
    {
        // Form force validation.
        if ('undefined' === typeof ngForm.forceValidation) {
            ngForm.forceValidation = function(validationForced) {
                // Calling force validation for every child form element.
                angular.forEach(ngForm, function(item) {
                    if ('function' === typeof item.forceValidation) {
                        item.forceValidation(validationForced);
                    }
                });
            };
        }

        // Input force validation.
        if ('undefined' === typeof ngModel.forceValidation) {
            ngModel.validationForced = false;
            ngModel.forceValidation = function(validationForced) {
                this.validationForced = validationForced;
            };
        }
    }

    function helperService(formValidationDecorations, formValidationErrors)
    {
        return {
            showErrors: function(formName, ngModel, errorMessages, temp) {
                formValidationDecorations.decorateElement(formName, ngModel, false, temp);
                formValidationErrors.renderErrorList(formName, ngModel.$name, errorMessages, temp);
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

        // Maintaining chainability.
        return self;
    };

    /**
     * Returns the service instance.
     */
    self.$get = function() {

        // Using default decorator if it's not set.
        if (null === decorator) {
            decorator = new builtInDecorators.default();
        }

        return {
            attach: function($scope, $element, attrs, ngModel, ngForm, scopePath) {

                var self = this;
                var handler = function() {
                    self.redecorateElement(ngModel, $element);
                };

                // Re-decorating the element when it's state changes.
                $scope.$watch(scopePath + '.$valid',           handler);
                $scope.$watch(scopePath + '.$pristine',        handler);
                $scope.$watch(scopePath + '.modified',         handler);
                $scope.$watch(scopePath + '.validationForced', handler);
            },

            /**
             * This function will determine input's state and re-decorate it accordingly.
             *
             * @param {object} ngModel
             * @param {jQuery} $element
             */
            redecorateElement: function(ngModel, $element) {
                if (ngModel.$dirty || ngModel.validationForced) {
                    // If input is invalid.
                    if (ngModel.$invalid) {
                        // Decorating element as invalid.
                        decorator.decorateElement($element, false);
                        // If input is valid and value has changed.
                    } else if (ngModel.modified) {
                        // Decorating element as valid.
                        decorator.decorateElement($element, true);
                    } else {
                        // Removing all decorations if it's valid and not modified.
                        decorator.clearDecorations($element);
                    }
                } else {
                    // Removing all decorations if it's pristine.
                    decorator.clearDecorations($element);
                }
            },

            /**
             * Decorates element as valid or invalid according to the specified value.
             * Element is specified by form and element names.
             *
             * @param {string} formName
             * @param {object} ngModel
             * @param {boolean} valid
             * @param {boolean} temp
             */
            decorateElement: function(formName, ngModel, valid, temp) {

                var self = this;

                var $element = getInputByName(formName, ngModel.$name);

                // When temporary decorations are rendered
                // we need to watch for a single change of the input value
                // in order to remove them.
                if (temp) {
                    $element.one('input', function() {
                        self.redecorateElement(ngModel, $element);
                    });
                }

                decorator.decorateElement($element, valid);
            }
        };
    };
}

/**
 * @constructor
 */
function ClassNameDecorator() {

    var validClassName   = 'valid';
    var invalidClassName = 'invalid';

    var traverser;

    return {

        /**
         * Returns decorated element by specified element.
         * Uses traverser if possible.
         *
         * @param {jQuery} $inputElement
         * @returns {jQuery}
         */
        getDecoratedElement: function($inputElement) {
            if ('function' === typeof traverser) {
                return traverser($inputElement);
            } else {
                return $inputElement;
            }
        },

        /**
         * Sets valid class name.
         *
         * @param {string} className
         * @returns {ClassNameDecorator}
         */
        setValidClassName: function(className) {
            validClassName = className;
            return this;
        },

        /**
         * Sets invalid class name.
         *
         * @param {string} className
         * @returns {ClassNameDecorator}
         */
        setInvalidClassName: function(className) {
            invalidClassName = className;
            return this;
        },

        /**
         * Instructs decorator to use specified traverser.
         *
         * @param {function} _traverser
         * @returns {ClassNameDecorator}
         */
        useTraverser: function(_traverser) {
            traverser = _traverser;
            return this;
        },

        /**
         * Decorates specified element.
         *
         * @param {jQuery} $inputElement
         * @param {boolean} valid
         */
        decorateElement: function($inputElement, valid) {

            var $decoratedElement = this.getDecoratedElement($inputElement);
            if (null === $decoratedElement) {
                console.log('Missing decorated element for input element', $inputElement);
                return;
            }

            if (valid) {
                $decoratedElement
                    .removeClass(invalidClassName)
                    .addClass(validClassName)
                ;
            } else {
                $decoratedElement
                    .removeClass(validClassName)
                    .addClass(invalidClassName)
                ;
            }
        },

        /**
         * Removes all decorations from the specified element.
         *
         * @param {jQuery} $inputElement
         */
        clearDecorations: function($inputElement) {

            var $decoratedElement = this.getDecoratedElement($inputElement);
            if (null === $decoratedElement) {
                console.log('Missing decorated element for input element', $inputElement);
                return;
            }

            $decoratedElement
                .removeClass(invalidClassName)
                .removeClass(validClassName)
            ;
        }
    };
}
/**
 * Input decorator for Bootstrap 3.
 *
 * @constructor
 * @extends ClassNameDecorator
 */
function BootstrapDecorator() {

    var validClassName = 'has-success';
    var invalidClassName = 'has-error';
    var elementClassName = 'has-feedback';
    var iconElementType = 'span';
    var iconClassName = 'form-control-feedback';
    var formGroupClassName = 'form-group';
    var formGroupRadioClassName = 'radio';
    var formGroupCheckboxClassName = 'checkbox';

    var iconLibrary = 'glyphicons';
    var useIcons = true;
    var iconClasses = {
        glyphicons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove'
        },
        fontawesome: {
            valid: 'fa fa-check',
            invalid: 'fa fa-exclamation-circle'
        }
    };
    var noIconElementTypes = ['checkbox', 'radio'];

    /**
     * This traverser will walk from the input element
     * up to the form group element and return it.
     *
     * @param $inputElement
     * @returns {jQuery|null}
     */
    var formGroupTraverser = function($inputElement) {

        var $decoratedElement = null;

        angular.forEach([
            formGroupClassName,
            formGroupCheckboxClassName,
            formGroupRadioClassName
        ], function(className) {
            if (null === $decoratedElement) {
                $decoratedElement = getParentElementByClassName(
                    $inputElement, className
                );
            }
        });

        return $decoratedElement;
    };

    var iconValidClassName;
    var iconInvalidClassName;

    // Creating ClassNameDecorator's instance to extend it.
    var classNameDecorator = new ClassNameDecorator();

    // Setting default class names used in Bootstrap.
    classNameDecorator.setValidClassName(validClassName);
    classNameDecorator.setInvalidClassName(invalidClassName);
    classNameDecorator.useTraverser(formGroupTraverser);

    var bootstrapDecorator = {

        //-----------------------//
        // CONFIGURATION SECTION //
        //-----------------------//

        /**
         * Specifies whether to use icons.
         *
         * @param {boolean} _useIcons
         * @returns {BootstrapDecorator}
         */
        useIcons: function(_useIcons) {
            useIcons = _useIcons;
            // noinspection JSValidateTypes
            return this;
        },

        /**
         * Specifies name of the icon library to use.
         *
         * @param {string} _iconLibrary
         * @returns {BootstrapDecorator}
         */
        useIconLibrary: function(_iconLibrary) {
            iconLibrary = _iconLibrary;
            // noinspection JSValidateTypes
            return this;
        },

        /**
         * Sets icon valid class name.
         *
         * @param {string} className
         * @returns {BootstrapDecorator}
         */
        setIconValidClassName: function(className) {
            iconValidClassName = className;
            // noinspection JSValidateTypes
            return this;
        },

        /**
         * Sets icon invalid class name.
         *
         * @param className
         * @returns {BootstrapDecorator}
         */
        setIconInvalidClassName: function(className) {
            iconInvalidClassName = className;
            // noinspection JSValidateTypes
            return this;
        },

        //-------------//
        // API SECTION //
        //-------------//

        /**
         * Returns icon class name according to specified state.
         *
         * @param {boolean} valid
         * @returns {string}
         */
        getIconClassName: function(valid) {
            if (valid) {
                if ('undefined' !== typeof iconValidClassName) {
                    return iconValidClassName;
                } else {
                    return iconClasses[iconLibrary]['valid'];
                }
            } else {
                if ('undefined' !== typeof iconInvalidClassName) {
                    return iconInvalidClassName;
                } else {
                    return iconClasses[iconLibrary]['invalid'];
                }
            }
        },

        /**
         * Gets existing icon element from the specified container.
         *
         * @param {jQuery} $container
         * @returns {jQuery|null}
         */
        getExistingIconElement: function($container) {
            return getElementByTagAndClassName(iconElementType, iconClassName, $container[0]);
        },

        /**
         * Creates new icon element inside of a specified container
         * and returns it.
         *
         * @param {jQuery} $container
         * @returns {jQuery}
         */
        createIconElement: function($container) {
            var $iconElement = angular.element(document.createElement(iconElementType))
                .addClass(iconClassName)
            ;
            $container.append($iconElement);
            return $iconElement;
        },

        /**
         * Shows specified icon element.
         *
         * @param {jQuery} $iconElement
         * @returns {BootstrapDecorator}
         */
        showIconElement: function($iconElement) {
            showElement($iconElement);
            // noinspection JSValidateTypes
            return this;
        },

        /**
         * Hides specified icon element.
         *
         * @param {jQuery} $iconElement
         * @returns {BootstrapDecorator}
         */
        hideIconElement: function($iconElement) {
            hideElement($iconElement);
            // noinspection JSValidateTypes
            return this;
        },

        /**
         * Decorates specified element according to specified state.
         *
         * @param {jQuery} $inputElement
         * @param {boolean} valid
         */
        decorateElement: function($inputElement, valid) {

            // Calling parent function.
            classNameDecorator.decorateElement.apply(this, arguments);

            var elementType = $inputElement.attr('type');

            var iconRequired = (
                -1 === noIconElementTypes.indexOf(elementType)
            );

            // Decorating icons.
            if (useIcons && iconRequired) {

                var $decoratedElement = classNameDecorator.getDecoratedElement($inputElement);
                if (null === $decoratedElement) {
                    console.log('Missing decorated element for input element', $inputElement);
                    return;
                }

                // Making sure class is present for container.
                $decoratedElement.addClass(elementClassName);

                // Looking for existing icon element.
                var $iconElement = this.getExistingIconElement($decoratedElement);
                if (!$iconElement) {
                    // Creating new icon element if it's missing.
                    $iconElement = this.createIconElement($decoratedElement);
                }

                // Making sure proper class is set for icon element.
                $iconElement
                    .removeClass(this.getIconClassName(!valid))
                    .addClass(this.getIconClassName(valid))
                ;

                // Making sure icon element is shown.
                this.showIconElement($iconElement);
            }
        },

        /**
         * Removes all decorations from the specified element.
         *
         * @param {jQuery} $inputElement
         */
        clearDecorations: function($inputElement) {

            // Clearing class name decorations.
            classNameDecorator.clearDecorations.apply(this, arguments);

            // Clearing icons decorations if icons are used.
            if (useIcons) {

                var $decoratedElement = classNameDecorator.getDecoratedElement($inputElement);
                if (null === $decoratedElement) {
                    console.log('Missing decorated element for input element', $inputElement);
                    return;
                }

                var $iconElement = this.getExistingIconElement($decoratedElement);
                if ($iconElement) {
                    this.hideIconElement($iconElement);
                }
            }
        }
    };

    // Creating a final instance by extending class name decorator with bootstrap one.
    return angular.extend({}, classNameDecorator, bootstrapDecorator);
}

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
        listItemTemporaryClassName: 'constraint-temporary',

        /**
         * Cached RegExp object to extracts constraint name from class name.
         */
        listItemConstraintRegExp: null,

        /**
         * Renders error list of specified constraints inside of a specified container.
         *
         * @param {jQuery} $container
         * @param {object} errorList
         * @param {boolean} [temp]
         */
        render: function($container, errorList, temp) {

            if ('undefined' === typeof temp) {
                temp = false;
            }

            var hasErrors = !isObjectEmpty(errorList);

            // Getting existing list element from the container.
            var $listElement = this.getListElement($container);

            if (hasErrors) {
                if (!$listElement) {
                    $listElement = this.createListElement($container);
                }

                // Rendering error items.
                this.renderErrorItems($listElement, errorList, temp);

                // Showing list element.
                this.showListElement($listElement);

            } else {
                if ($listElement) {
                    this.hideListElement($listElement);
                }
            }
        },

        /**
         * Removes error list from the specified container.
         *
         * @param $container
         */
        clear: function($container) {

            // Getting existing list element from the container.
            var $listElement = this.getListElement($container);

            if ($listElement) {
                // Removing all temporary items from the list.
                this.removeTemporaryItems($listElement);

                // Hiding list element if it's present.
                this.hideListElement($listElement);
            }
        },

        /**
         * Removes all temporary errors from the specified container.
         *
         * @param {jQuery} $container
         */
        clearTemporary: function($container) {
            var $listElement = this.getListElement($container);
            this.removeTemporaryItems($listElement);
        },

        /**
         * Renders list items of specified constraints inside of a specified list element.
         *
         * @param {jQuery} $listElement
         * @param {object} errorList
         * @param {boolean} temp
         */
        renderErrorItems: function($listElement, errorList, temp) {

            var self = this;

            // Removing all temporary items from the list first.
            this.removeTemporaryItems($listElement);

            // Iterating over list items and removing no longer needed ones.
            angular.forEach(this.getExistingListItems($listElement), function(listItem) {

                var $listItem = angular.element(listItem);

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
                    $listItem = self.createListItem($listElement, constraint, message, temp);
                }
                self.showListItem($listItem);
            });
        },

        /**
         * Removes all temporary items from the specified list.
         *
         * @param {jQuery} $listElement
         */
        removeTemporaryItems: function($listElement) {

            var self = this;

            // Iterating over list items and removing no longer needed ones.
            angular.forEach(self.getExistingListItems($listElement), function(listItem) {
                var $listItem = angular.element(listItem);
                if ($listItem.hasClass(self.listItemTemporaryClassName)) {
                    // Removing list item if it's temporary.
                    self.removeListItem($listItem);
                }
            });
        },

        /**
         * Extracts constraint name from class name.
         *
         * @param {string} className
         * @returns {string}
         */
        extractConstraintNameFromClassName: function(className) {
            if (!this.listItemConstraintRegExp) {
                // Creating RegExp object if it's not yet created.
                this.listItemConstraintRegExp = new RegExp(this.listItemClassNamePrefix + '(\\S+)');
            }

            // Matching RegExp.
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

            var listElement = getElementByTagAndClassName(
                this.listElementType,
                this.listClassName,
                $container[0]
            );

            return (listElement ? angular.element(listElement) : null);
        },

        /**
         * Decorates specified list element.
         * Override this to decorate error list element to your taste!
         *
         * @param {jQuery} $listElement
         */
        listElementDecorator: function($listElement) {
            // Do nothing.
        },

        /**
         * Creates new list element inside of a specified container.
         *
         * @param {jQuery} $container
         * @returns {jQuery}
         */
        createListElement: function($container) {
            var $listElement = angular.element(document.createElement(this.listElementType))
                .addClass(this.listClassName)
            ;

            // Calling decorator to decorate list element
            // before it will be appended to the DOM.
            this.listElementDecorator($listElement);

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

            var listItem = getElementByTagAndClassName(
                this.listItemElementType,
                this.getListItemClassName(constraint),
                $listElement[0]
            );

            return (listItem ? angular.element(listItem) : null);
        },

        /**
         * Decorates specified error list item.
         * Override this to decorate error list item to your taste!
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
         * @param {boolean} temp
         *
         * @returns {jQuery}
         */
        createListItem: function($listElement, constraint, message, temp) {

            var $listItem = angular.element(document.createElement(this.listItemElementType))
                .addClass(this.getListItemClassName(constraint))
                .html(message)
            ;

            if (temp) {
                $listItem.addClass(this.listItemTemporaryClassName);
            }

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
        }
    };
}
/**
 * Error list renderer for Bootstrap 3.
 *
 * @constructor
 * @extends DefaultErrorListRenderer
 */
function BootstrapErrorListRenderer() {

    // Instantiating default renderer to extend it.
    var defaultRenderer = new DefaultErrorListRenderer();

    defaultRenderer.listElementType = 'div';
    defaultRenderer.listItemElementType = 'span';

    // Extension of default renderer.
    var bootstrapRenderer = {

        listItemClassName: 'help-block',

        /**
         * Decorates list item.
         *
         * @param {jQuery} $listItem
         */
        listItemDecorator: function($listItem) {
            $listItem.addClass(this.listItemClassName);
        }

    };

    // Creating a final instance by extending default renderer with bootstrap one.
    return angular.extend({}, defaultRenderer, bootstrapRenderer);
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

    if ('undefined' !== typeof Object.keys) {
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
    // No need to hide empty jQuery object.
    if (0 == $element.length) {
        return;
    }

    if ('undefined' !== typeof $element.hide) {

        $element.hide();

    } else {

        var elementComputedStyle = window.getComputedStyle($element[0], null);

        var displayMode = elementComputedStyle.display;

        // No need to hide already hidden element.
        if ('none' === displayMode) {
            return;
        }

        // Saving old display mode.
        $element.data('oldDisplayMode', displayMode);

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
    // No need to show empty jQuery object.
    if (0 == $element.length) {
        return;
    }

    if ('undefined' !== typeof $element.show) {

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

/**
 * Returns input element by specified form and input names.
 *
 * @param {string} formName
 * @param {string} inputName
 * @returns {jQuery}
 */
function getInputByName(formName, inputName)
{
    return $('form[name="' + formName + '"]').find(
        'input[name="' + inputName + '"],' +
        'textarea[name="' + inputName + '"],' +
        'select[name="' + inputName + '"]'
    );
}

/**
 * Returns first matched element by specified tag and class name.
 *
 * @param {string} tagName
 * @param {string} className
 */
function getElementByTagAndClassName(tagName, className, rootElement)
{
    if ('undefined' === typeof rootElement) {
        rootElement = document;
    }

    var $foundElement = null;
    angular.forEach(rootElement.getElementsByTagName(tagName), function(element) {
        var $element = angular.element(element);
        if ($element.hasClass(className)) {
            $foundElement = $element;
        }
    });
    return $foundElement;
}

/**
 * Returns element with the specified class from the chain of parent elements of the specified element,
 * or null if element is not found.
 *
 * @param {object} element
 * @param {string} className
 *
 * @returns {object|null}
 */
function getParentElementByClassName(element, className) {

    var $element = angular.element(element);

    // Loop without formal condition.
    while (true) {

        $element = $element.parent();

        if (0 === $element.length) {
            // Reached top of the DOM tree, exiting with NULL.
            return null;
        }

        if ($element.hasClass(className)) {
            // Element found, returing it.
            return $element;
        }
    }
}


})(window, angular);