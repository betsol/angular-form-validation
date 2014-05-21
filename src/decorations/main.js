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
     * @param {jQuery} $inputElement
     * @returns {*}
     */
    var traverser = function($inputElement) {
        return $inputElement;
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

// @@include('decorators/classname.js')
// @@include('decorators/bootstrap.js')
