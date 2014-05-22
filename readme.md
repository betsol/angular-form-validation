# angular-form-validation 1.0.0

## Description

This advanced module for AngularJS provides you with facilities to automate form validation,
error display and input decorations. No more manual application of `ngClass` directives
to all the form elements and creating error messages for every possible input.
Just install this module and provide input requirements the standard way by using native *HTML5*
attributes like `maxlength`, `required` and standard AngularJS directives like `ngMin`, `ngMax`
and the like. No need to add directives to all the input fields.

You can configure this module to decorate forms as you see fit only once and all the forms of
your application will automatically benefit from it.

### Features

- Works out of the box with almost zero configuration
- No need to specify any additional directives besides standard input constraints
- Has built-in supports for **Bootstrap 3**, see the *"Using Bootstrap 3"* section
- Automatically decorates *valid*, *invalid* and *non-modified* input fields
- Automatically adds error messages to invalid input fields
- Supports translations (i18n) and provides some [built-in languages][built-in-languages]
- Designed with flexibility in mind, almost every aspect of this module
  can be configured and overridden (see [the API section][docs-api] of this document)
- You can easily select DOM elements to decorate by providing custom traversing functions
- You can change the way forms are decorated by overriding some aspects of existing decorators or
  by providing your own implementation of them
- You can change the way error list is rendered by modifying default error list renderer or
  by providing your own implementation

## Installation

### Dependencies

This library requires [`angular-input-modified`][github-input-modified] module. It is used to detect modified input fields.

### Install library with bower

`bower install --save angular-form-validation`

### Add library to your page

``` html
<script type="text/javascript" src="angular-form-validation/dist/angular-form-validation.js"></script>
```

Use minified version: `angular-form-validation.min.js` in production
and uncompressed version: `angular-form-validation.js` during development/testing.

Also, don't forget to add dependencies, see [Dependencies](#dependencies) section above.

### Add dependency in your application's module definition

``` javascript
var application = angular.module('application', [
    // ...
    'ngFormValidation'
]);
```

## Usage

This module is working out of the box with default settings and no configuration.
However, in order to unleash it's full potential, you should provide additional
configurations through exposed providers. Please see [the API documentation][docs-api] in order
to understand how to do this. It's written for real humans!

### Using Bootstrap 3

@todo

If you are going to use this module with default incarnation of Twitter's Bootstrap 3 you
can do this very easily with just the following steps:

- 1
- 2
- 3

## API

See the detailed [API documentation][docs-api].

## Feedback

If you have found a bug or have another issue with the library - please [create an issue][new-issue]
in this GitHub repository.

If you have a question - file it with [StackOverflow][so-ask] and send me a
link to [s.fomin@betsol.ru][email]. I will be glad to help.
Also, please add a [JSFiddle][jsfiddle] to demonstrate the issue if appropriate.
You can even fork our [demo fiddle][demo].

Have any ideas or propositions? Feel free to contact me by [E-Mail][email].

Cheers!

## License

The MIT License (MIT)

Copyright (c) 2014 Slava Fomin II

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[so-ask]: http://stackoverflow.com/questions/ask?tags=angularjs,javascript
[email]: mailto:s.fomin@betsol.ru
[jsfiddle]: http://jsfiddle.net/
[github-input-modified]: ~
[docs-api]: docs/api.md
[demo]: ~
[new-issue]: issues/new
[built-in-languages]: docs/api/errors-provider.md#supported-languages
