# formValidationDecorationsProvider

This provider is used to configure how form elements are decorated.

When one of the form's input state changes from **valid** to **invalid** or to **not modified**,
the special object called **decorator** is called to actually decorate the form.
We are providing some useful built-in decorators that you can employ in your projects.

It is possible to override some aspects of built-in decorators if you do not want to
create your own decorator from scratch, or if you only want to change some little detail of it.

## Built-in decorators

Here's the list of built-in decorators:

- [ClassNameDecorator][decorator-className]
- [BootstrapDecorator][decorator-bootstrap]

Consult their individual documentation for details.

## Methods

### {object} decorator: useBuiltInDecorator({string} decoratorName)

Use this method to select one of built-in decorators for use.
See the [list of built-in decorators](#built-in-decorators).

#### Input

**decoratorName** name (alias) of built-in decorator.

#### Output

This method returns instance of specified decorator in order for you to change it's settings or
override it's behavior. See the documentation or code for specific decorator in order to understand it's
configuration settings or extensibility features.

---

### {object} decorator: getDecorator()

This method returns current decorator instance.

#### Input

No input.

#### Output

Active decorator's instance.

---

### setDecorator({object} decorator)

Sets decorator instance.

#### Input

Instance of decorator.


[decorator-className]: decorators/classname.md
[decorator-bootstrap]: decorators/bootstrap.md