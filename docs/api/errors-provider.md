# formValidationErrorsProvider

This provider is used to configure how input errors are displayed.

A special function called `traverser` is used to [traverse][jquery-traversing] DOM tree
beginning with `<input>` element. This function should return target element to which
list of error messages is appended. Default traverser will use input's parent element
to append list of error messages. You can change this behavior by providing your
own traverser.

## Supported languages

Here's the list of built-in languages:

- English (`en`)
- Russian (`ru`)

If you need to provide another language you can do so by implementing your own [StringDictionary][class-string-dictionary].

Also, I will be glad to add your translation to the library itself. Here's the languages [registry file][languages-registry].
Fork it, add your language to it and submit a pull request. Language code must be in proper [IETF format][ietf-language-tag].

## Methods

### useTraverser({function} traverser)

Instructs library to use specified traverser.

#### Input

**{function} traverser**

Callable traversing function with the following signature: `function({jQuery} $inputElement)`.

The `$inputElement` is the `<input>` element from which you should start [traversing][jquery-traversing].
You must return target element to which list of error messages will be added later.

**Example:**

For example, if you want to decorate not the input element itself, but it's parent element,
you can use this code:

``` javascript
formValidationErrorsProvider
    .useTraverser(function($inputElement) {
        return $inputElement.parent();
    })
;
```

Actually, this is the default implementation.

---

### setLanguage({string} language)

Instructs library to use specified language.

#### Input

**{string} language**

Name of the built-in language to use.

See the [list of supported languages][supported-languages].

---

### setDictionary({object} dictionary)

Sets language dictionary to use.

#### Input

**{object} dictionary**

A [dictionary][class-string-dictionary] object.

---

### setErrorListRenderer({object} errorListRenderer)

Specifies custom implementation of error list renderer to be used
instead of default one.

#### Input

**{object} errorListRenderer**

Custom implementation of error list renderer.

---

### {DefaultErrorListRenderer}: getDefaultErrorListRenderer()

Return an instance of default error list renderer that can be further configured or
modified.

#### Input

No input.

#### Output

An instance of [DefaultErrorListRenderer][default-error-list-renderer].

---

### {object}: buildErrorListFromConstraints({object} constraints, {object} constraintParameters)

Builds list of errors from constraints and constraint parameters.

#### Input

**{object} constraints**

Constraints for this input element.

**{object} constraintParameters**

Constraint parameters for this input element.

#### Output

List of errors.

---

[decorator-className]: decorators/classname.md
[decorator-bootstrap]: decorators/bootstrap.md
[jquery-traversing]: http://api.jquery.com/category/traversing/
[languages-registry]: ~
[class-string-dictionary]: ~
[ietf-language-tag]: http://en.wikipedia.org/wiki/IETF_language_tag
[default-error-list-renderer]: ~