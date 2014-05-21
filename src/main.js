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

    // @@include('decorations/main.js')
    // @@include('errors/main.js')
    // @@include('utils.js')

})(window, angular);