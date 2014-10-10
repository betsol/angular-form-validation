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

        // Saving old display mode.
        $element.data('oldDisplayMode', elementComputedStyle.display);

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
