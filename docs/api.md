# Public API

This module provides several providers in order to configure behavior of it's directives.

- [formValidationDecorationsProvider][decorations-provider] is used to configure decoration of input elements
- [formValidationErrorsProvider][errors-provider] is used to configure displaying of error messages

Below you will find complete documentation for all providers.

**Notice:**

All setters of all providers will return the provider back to you in order to support chainability.

**Example:**

``` javascript
someProvider
    .setFoo(/** Some arguments */)
    .setBar(/** Some arguments */)
    .useBaz(/** Some arguments */)
;
```

## [formValidationDecorationsProvider][decorations-provider]

This provider is used to configure how form elements are decorated.

Please consult it's own [detailed documentation][decorations-provider].

## [formValidationErrorsProvider][errors-provider]

This provider is used to configure how form errors are displayed.

Please consult it's own [detailed documentation][errors-provider].

[decorations-provider]: api/decorations-provider.md
[errors-provider]: api/errors-provider.md
