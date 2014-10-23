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