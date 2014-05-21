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