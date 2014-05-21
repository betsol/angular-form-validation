/**
 * EXTRA CODE THAT IS NOT DIRECTLY USED
 * Product of refactoring.
 * @todo: Remove this.
 */

/**
 * List of non-common element types.
 *
 * @type {string[]}
 */
var nonCommonElementsTypes = [
    'checkbox',
    'datetime-local',
    'date',
    'month',
    'radio',
    'time',
    'week'
];

/**
 * Adds specified element type to the list of non-common element types.
 *
 * @param {string} typeName
 */
self.addNonCommonElementType = function(typeName) {
    if (-1 === nonCommonElementsTypes.indexOf(typeName)) {
        nonCommonElementsTypes.push(typeName);
    }
};

/**
 * Removes specified element type from the list of non-common element types.
 *
 * @param {string} typeName
 */
self.removeNonCommonElementType = function(typeName) {
    var index = nonCommonElementsTypes.indexOf(typeName);
    if (-1 !== index) {
        nonCommonElementsTypes = nonCommonElementsTypes.splice(index, 1);
    }
};

/**
 * Replaces list of non-common element types with the specified one.
 *
 * @param types
 */
self.setNonCommonElementTypes = function(types) {
    nonCommonElementsTypes = types;
};

function attachOld(scope, element, attrs, ngModel, ngForm, scopePath) {

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

/**
 * Returns true if specified constraints are all valid, false otherwise.
 *
 * @param {object} constraints
 * @returns {boolean}
 */
function areConstraintsValid(constraints) {
    var valid = true;
    // noinspection FunctionWithInconsistentReturnsJS
    angular.forEach(constraints, function (constraintInvalid) {
        if (constraintInvalid) {
            valid = false;
            return false;
        }
    });
    return valid;
}