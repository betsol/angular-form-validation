# Public API

This module provides several providers in order to configure behavior of it's directives.

- [formValidationDecorationsProvider][decorations-provider] is used to configure decoration of input elements
- [formValidationErrorsProvider][errors-provider] is used to configure displaying of error messages

Below you will find complete documentation for all providers.

**Notice:**

All setters of these providers will return the provider back to you in order to support chainability.

**Example:**

``` javascript
someProvider
    .setFoo(/** Some arguments */)
    .setBar(/** Some arguments */)
    .useBaz(/** Some arguments */)
;
```


[decorations-provider]: api/decorations-provider.md
[errors-provider]: api/errors-provider.md
