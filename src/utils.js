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

    if ('undefined' !== Object.keys) {
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
    if ('undefined' !== $element.hide) {
        $element.hide();
    } else {

        // Saving old display mode.
        $element.data('oldDisplayMode', $element.css('display'));

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
    if ('undefined' !== $element.show) {
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