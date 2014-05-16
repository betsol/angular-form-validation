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