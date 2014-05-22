# ClassNameDecorator

This decorator is available under `className` alias.

This decorator will add `valid` or `invalid` CSS class to the designated DOM element.
Actual CSS class names can be customized. Defaults are: `valid` and `invalid`.

This decorator is used by default.

**Notice**

This decorator supports method chaining for all it's setters.

## Configuration

### setValidClassName({string} className)

Sets name of the CSS class for valid inputs.

#### Input

**{string} className**

Valid CSS class name.

---

### setInvalidClassName({string} className)

Sets name of the CSS class for invalid inputs.

#### Input

**{string} className**

Invalid CSS class name.

---

### useTraverser({function} traverser)

Instructs decorator to use specified traverser.

#### Input

**{function} traverser**

Callable traversing function with the following signature: `function({jQuery} $inputElement)`.

The `$inputElement` is the `<input>` element that will be decorated later.
You should start [traversing][jquery-traversing] from it and return target element.

**Example:**

For example, if you want to decorate not the input element itself, but it's parent element,
you can use this code:

``` javascript
formValidationDecorationsProvider
    .useBuiltInDecorator('className')
        .useTraverser(function($inputElement) {
            return $inputElement.parent();
        })
;
```

---

## API

Please see [this decorator's source code][source] if you want to extend it or override some functionality.
Is very well documented with JSDoc.


[source]: ../../../src/decorations/decorators/classname.js
[jquery-traversing]: http://api.jquery.com/category/traversing/