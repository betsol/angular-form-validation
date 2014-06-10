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

// @@include('decorations/decorators/classname.js')
// @@include('decorations/decorators/bootstrap.js')
