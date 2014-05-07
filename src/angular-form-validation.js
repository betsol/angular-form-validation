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

        var invalidClassName = 'invalid';
        var validClassName = 'valid';

        /**
         * Default traverser implementation.
         */
        var traverser = function(formElement) {
            return formElement;
        };

        /**
         * Default decorator to remove all decorations.
         */
        var clearDecorator = function(decoratingElement) {
            decoratingElement
                .removeClass(invalidClassName)
                .removeClass(validClassName)
            ;
        };

        /**
         * Default decorator for invalid inputs.
         */
        var invalidDecorator = function(decoratingElement) {
            decoratingElement
                .addClass(invalidClassName)
            ;
        };

        /**
         * Default decorator for valid inputs.
         */
        var validDecorator = function(decoratingElement) {
            decoratingElement
                .addClass(validClassName)
            ;
        };

        /**
         * Specifies class name for invalid elements.
         * @param {string} _invalidClassName
         */
        self.setInvalidClassName = function(_invalidClassName) {
            invalidClassName = _invalidClassName;

            // Maintaining chainability.
            return self;
        };

        /**
         * Specifies class name for valid elements.
         * @param {string} _validClassName
         */
        self.setValidClassName = function(_validClassName) {
            validClassName = _validClassName;

            // Maintaining chainability.
            return self;
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
         * Sets clear decorator.
         * @param {function} decorator
         */
        self.setClearDecorator = function(decorator) {
            clearDecorator = decorator;
        };

        /**
         * Sets invalid decorator.
         * @param {function} decorator
         */
        self.setInvalidDecorator = function(decorator) {
            invalidDecorator = decorator;
        };

        /**
         * Sets valid decorator.
         * @param {function} decorator
         */
        self.setValidDecorator = function(decorator) {
            validDecorator = decorator;
        };

        /**
         * Returns the service instance.
         */
        self.$get = function() {
            return {
                attach: function(scope, element, attrs, ngModel, ngForm, scopePath) {

                    // Master value is an initial value for the input.
                    // It is used to determine if input value is changed or not since last
                    // form submission.
                    var masterValue = null;

                    // Traversing DOM to find element that is used to decorate this input.
                    // Called only once for each input.
                    // User-specified traversing function can be used.
                    var decoratingElement = traverser(element);

                    /**
                     * This function will determine input's state and re-decorate it accordingly.
                     * @param value
                     */
                    var redecorateElement = function(value) {

                        // Comparing master value with current value to determine
                        // if this input was changed.
                        var hasValueChanged = !angular.equals(masterValue, value);

                        // Clearing all the decorations first.
                        clearDecorator(decoratingElement);

                        // If input is invalid.
                        if (ngModel.$invalid) {
                            // Decorating element as invalid.
                            invalidDecorator(decoratingElement);
                            // If input is valid and value has changed.
                        } else if (hasValueChanged) {
                            // Decorating element as valid.
                            validDecorator(decoratingElement);
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

                    // Watching for form's pristine flag changes to redraw this element
                    // when form is saved or reset.
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
        self.$get = function() {
            return {
                attach: function(scope, element, attrs, ngModel, ngForm) {
                    console.log('Errors service attached to: ' + ngModel.$name);
                }
            };
        };
    }

})(window, angular);