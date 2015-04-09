(function(document, angular) {

    'use strict';

    angular.module('ExampleApp', ['ngFormValidation'])
        .config(function(formValidationDecorationsProvider, formValidationErrorsProvider) {
            formValidationDecorationsProvider
                .useBuiltInDecorator('bootstrap')
            ;
            formValidationErrorsProvider
                .useBuiltInErrorListRenderer('bootstrap')
            ;
        })
        .controller('DefaultController', function($scope) {
            $scope.user = {
                id: 10017,
                email: 'email@example.com',
                name: 'John Doe',
                balance: 999,
                isAdmin: false,
                isActive: true,
                gender: 'unknown'
            };
            $scope.save = function() {

                if ($scope.form.$invalid) {
                    alert('');
                    return;
                }

                $scope.form.$setPristine();
            };
        })
    ;

})(document, angular);