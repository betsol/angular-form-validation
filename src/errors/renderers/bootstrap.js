/**
 * Error list renderer for Bootstrap 3.
 *
 * @constructor
 * @extends DefaultErrorListRenderer
 */
function BootstrapErrorListRenderer() {

    // Instantiating default renderer to extend it.
    var defaultRenderer = new DefaultErrorListRenderer();

    defaultRenderer.listElementType = 'div';
    defaultRenderer.listItemElementType = 'span';

    // Extension of default renderer.
    var bootstrapRenderer = {

        listItemClassName: 'help-block',

        /**
         * Decorates list item.
         *
         * @param {jQuery} $listItem
         */
        listItemDecorator: function($listItem) {
            $listItem.addClass(this.listItemClassName);
        }

    };

    // Creating a final instance by extending default renderer with bootstrap one.
    return angular.extend({}, defaultRenderer, bootstrapRenderer);
}