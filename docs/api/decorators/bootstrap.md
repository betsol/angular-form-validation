# BootstrapDecorator

An extension of [ClassNameDecorator][decorator-className] that is available under `bootstrap` alias.

This decorator allows you to style your forms according to [Bootstrap 3][bootstrap-3-forms-validation]
library form validation. It provides `form-group` validation classes and icons.

**Notice**

This decorator supports method chaining for all it's setters.

As an extension of [ClassNameDecorator][decorator-className] is supports all of it's configuration.
Use if as a reference.

## Supported icon libraries

Here's the list of supported icon libraries:

- [GLYPHICONS][icons-glyphicons] `glyphicons`
- [Font Awesome][icons-fontawesome] `fontawesome`

## Example configuration

``` javascript
formValidationDecorationsProvider
    .useBuiltInDecorator('bootstrap')
        .useIconLibrary('fontawesome')
        .setInvalidClassName('has-warning')
;
```

## Configuration

### useIcons({boolean} value)

Instructs decorator to use or not to use icons.

#### Input

**{boolean} value**

Value indicating whether to use icons or not. Default `true`.

---

### useIconLibrary({string} iconLibrary)

Specifies name of the icon library to use.

#### Input

**{string} iconLibrary**

Name of the icon library. See the [list of supported icon libraries](supported-icon-libraries).

---

### setIconValidClassName({string} className)

Sets icon valid class name.

#### Input

**{string} className**

Name of the valid CSS class.

---

### setIconInvalidClassName({string} className)

Sets icon invalid class name.

#### Input

**{string} className**

Name of the invalid CSS class.

## API

Please see [this decorator's source code][source] if you want to extend it or override some functionality.
Is very well documented with JSDoc.


[source]: ../../../src/decorations/decorators/bootstrap.js
[bootstrap-3-forms-validation]: http://getbootstrap.com/css/#forms-control-validation
[decorator-className]: ../decorators/classname.md
[icons-glyphicons]: http://glyphicons.com/
[icons-fontawesome]: http://fortawesome.github.io/Font-Awesome/