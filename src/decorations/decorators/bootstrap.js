/**
 * @constructor
 * @extends ClassNameDecorator
 */
function BootstrapDecorator() {

    // Extending ClassNameDecorator.
    var decorator = new ClassNameDecorator();

    var elementClassName = 'has-feedback';
    var iconElementName = 'span';
    var iconClassName = 'form-control-feedback';

    //var iconValidClassName = 'glyphicon glyphicon-ok';
    //var iconInvalidClassName = 'glyphicon glyphicon-remove';

    var iconValidClassName = 'fa fa-check';
    var iconInvalidClassName = 'fa fa-exclamation-circle';

    var useIcons = true;

    // Saving parent function for future calls.
    var classNameDecorate = decorator.decorateElement;
    var classNameClearDecorations = decorator.clearDecorations;

    var getExistingIconElement = function($container) {
        var $iconElement = $container.find(iconElementName + '.' + iconClassName);
        return ($iconElement.length > 0 ? $iconElement : null);
    };

    var createIconElement = function($container) {
        var $iconElement = $('<' + iconElementName + '>')
            .addClass(iconClassName)
        ;
        $container.append($iconElement);
        return $iconElement;
    };

    decorator.decorateElement = function($decoratedElement, valid) {
        // Calling parent function.
        classNameDecorate.apply(this, arguments);

        // Decorating icons.
        if (useIcons) {

            // Making sure class is present for container.
            $decoratedElement.addClass(elementClassName);

            // Looking for existing icon element.
            var $iconElement = getExistingIconElement($decoratedElement);
            if (!$iconElement) {
                // Creating new icon element if it's missing.
                $iconElement = createIconElement($decoratedElement);
            }

            // Making sure proper class is set for icon element.
            if (valid) {
                $iconElement
                    .removeClass(iconInvalidClassName)
                    .addClass(iconValidClassName)
                ;
            } else {
                $iconElement
                    .removeClass(iconValidClassName)
                    .addClass(iconInvalidClassName)
                ;
            }
        }
    };

    decorator.clearDecorations = function($decoratedElement) {
        classNameClearDecorations.apply(this, arguments);
        if (useIcons) {
            var $iconElement = getExistingIconElement($decoratedElement);
            if ($iconElement) {
                $iconElement.remove();
            }
        }
    };

    // Setting classnames used in Bootstrap.
    decorator.setValidClassName('has-success');
    decorator.setInvalidClassName('has-error');

    // Returning modified instance.
    return decorator;
}