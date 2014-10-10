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