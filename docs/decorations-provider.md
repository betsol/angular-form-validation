# formValidationDecorationsProvider

This provider is used to configure how form elements are decorated.

When one of the form's input state changes from **valid** to **invalid** or to **not modified**,
the special object called **decorator** is called to actually decorate the form. This decorator will
decorate DOM element, provided by special function called **traverser**. The role of traverser is to
return DOM element that will be later decorated by the decorator. You can provide you own traverser as
well as decorator, or use built-in ones. Also, it is possible to override some aspects of built-in decorators
if you do not want to create your own decorator from scratch, or if you only want to change some little detail of it.

Default traverser will just return `<input>` element itself and all the decorations will be applied to it.

## setTraverser({function} traverser)

Overrides default traverser by the specified one.
This is the way to provide your custom implementation of traversing function.

### Input

**{function} traverser**

Callable traversing function with the following signature: `function({jQuery} $inputElement)`.

The `$inputElement` is the `<input>` element that will be decorated later.
You should start [traversing][jquery-traversing] from it and return target element.

For example, if you want to decorate not the input element itself, but it's parent element,
you can use this code:

``` javascript
formValidationDecorationsProvider.setTraverser(function($inputElement) {
    return $inputElement.parent();
});
```

## useBuiltInDecorator({string} decoratorName)

Use this method to select one of built-in decorators for use.

### Input

**decoratorName** name of built-in decorator. See the list of built-in decorators.

### Input

## Built-in decorators

Here's the list of built-in decorators:

- [ClassNameDecorator][decorator-className]
- [BootstrapDecorator][decorator-bootstrap]

Consult their individual documentation for details.

[decorator-className]: ~
[decorator-bootstrap]: ~