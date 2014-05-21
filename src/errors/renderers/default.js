/**
 * Default implementation of error list renderer.
 *
 * @constructor
 */
function DefaultErrorListRenderer() {
    return {
        listClassName: 'error-list',
        listElementType: 'ul',
        listItemClassNamePrefix: 'constraint-',
        listItemElementType: 'li',

        /**
         * Cached RegExp object to extracts constraint name from class name.
         */
        listItemConstraintRegExp: null,

        /**
         * Extracts constraint name from class name.
         *
         * @param {string} className
         * @returns {string}
         */
        extractConstraintNameFromClassName: function(className) {
            if (!this.listItemConstraintRegExp) {
                // Creating RegExp object if it's not yet created.
                this.listItemConstraintRegExp = new RegExp(this.listItemClassNamePrefix + '(\\S+)');
            }

            // Matching RegExp.
            var result = this.listItemConstraintRegExp.exec(className);

            return (result[1] ? result[1] : null);
        },

        /**
         * Gets present list element from the specified container.
         *
         * @param {jQuery} $container
         * @returns {jQuery|null}
         */
        getListElement: function($container) {
            var $listElement = $container.find(this.listElementType + '.' + this.listClassName);
            return ($listElement.length > 0 ? $listElement : null);
        },

        /**
         * Creates new list element inside of a specified container.
         *
         * @param {jQuery} $container
         * @returns {jQuery}
         */
        createListElement: function($container) {
            var $listElement = $('<' + this.listElementType + '>')
                .addClass(this.listClassName)
            ;
            $container.append($listElement);
            return $listElement;
        },

        /**
         * Hides list element.
         *
         * @param {jQuery} $listElement
         */
        hideListElement: function($listElement) {
            hideElement($listElement);
        },

        /**
         * Shows list element.
         *
         * @param {jQuery} $listElement
         */
        showListElement: function($listElement) {
            showElement($listElement);
        },

        /**
         * Returns all existing list items.
         *
         * @param {jQuery} $listElement
         * @returns {jQuery} jQuery collection
         */
        getExistingListItems: function($listElement) {
            return $listElement.find(this.listItemElementType);
        },

        /**
         * Gets present list item from the specified list element
         * for specified constraint.
         *
         * @param {jQuery} $listElement
         * @param {string} constraint
         * @returns {jQuery|null}
         */
        getExistingListItem: function($listElement, constraint) {
            var $listItem = $listElement.find(
                this.listItemElementType + '.' + this.getListItemClassName(constraint)
            );
            return ($listItem.length > 0 ? $listItem : null);
        },

        /**
         * Decorates list item.
         * Can be overloaded by end-user to customize error rendering.
         *
         * @param {jQuery} $listItem
         */
        listItemDecorator: function($listItem) {
            // Do nothing.
        },

        /**
         * Creates new list item inside of a specified list element.
         *
         * @param {jQuery} $listElement
         * @param {string} constraint
         * @param {string} message
         *
         * @returns {jQuery}
         */
        createListItem: function($listElement, constraint, message) {
            // Creating element for list item.
            var $listItem = $('<' + this.listItemElementType + '>')
                .addClass(this.getListItemClassName(constraint))
                .html(message)
            ;

            // Calling decorator to decorate list item
            // before it will be appended to the DOM.
            this.listItemDecorator($listItem);

            // Appending element to the DOM.
            $listElement.append($listItem);

            return $listItem;
        },

        /**
         * Removes specified list item.
         *
         * @param {jQuery} $listItem
         */
        removeListItem: function($listItem) {
            $listItem.remove();
        },

        /**
         * Hides list item.
         *
         * @param {jQuery} $listItem
         */
        hideListItem: function($listItem) {
            hideElement($listItem);
        },

        /**
         * Shows list item.
         *
         * @param {jQuery} $listItem
         */
        showListItem: function($listItem) {
            showElement($listItem);
        },

        /**
         * Returns class name for list item.
         *
         * @param {string} constraint
         * @returns {string}
         */
        getListItemClassName: function(constraint) {
            // noinspection JSPotentiallyInvalidUsageOfThis
            return (this.listItemClassNamePrefix + constraint);
        },

        /**
         * Renders error list of specified constraints inside of a specified container.
         *
         * @param {jQuery} $container
         * @param {object} errorList
         */
        render: function($container, errorList) {

            var hasErrors = !isObjectEmpty(errorList);

            // Getting existing list element from the container.
            var $listElement = this.getListElement($container);

            if (hasErrors) {
                if (!$listElement) {
                    $listElement = this.createListElement($container);
                }

                // Rendering error items.
                this.renderErrorItems($listElement, errorList);

                // Showing list element.
                this.showListElement($listElement);

            } else {
                if ($listElement) {
                    this.hideListElement($listElement);
                }
            }
        },

        /**
         * Renders list items of specified constraints inside of a specified list element.
         *
         * @param {jQuery} $listElement
         * @param {object} errorList
         */
        renderErrorItems: function($listElement, errorList) {
            var self = this;

            // Iterating over list items and removing no longer needed ones.
            angular.forEach(this.getExistingListItems($listElement), function(listItem) {
                var $listItem = $(listItem);

                var className = $listItem.attr('class');

                var constraint = self.extractConstraintNameFromClassName(className);

                if (constraint) {
                    // If this constraint is not in the list of active errors.
                    if (!errorList[constraint]) {
                        // Hiding this list item.
                        self.hideListItem($listItem);
                    }
                } else {
                    // Removing list item if we can't match it.
                    self.removeListItem($listItem);
                }
            });

            // Iterating over errors and showing list items.
            angular.forEach(errorList, function(message, constraint) {
                var $listItem = self.getExistingListItem($listElement, constraint);
                if (!$listItem) {
                    $listItem = self.createListItem($listElement, constraint, message);
                }
                self.showListItem($listItem);
            });
        }
    };
}