# @meanie/mail-composer

[![npm version](https://img.shields.io/npm/v/@meanie/mail-composer.svg)](https://www.npmjs.com/package/@meanie/mail-composer)
[![node dependencies](https://david-dm.org/meanie/mail-composer.svg)](https://david-dm.org/meanie/mail-composer)
[![github issues](https://img.shields.io/github/issues/meanie/mail-composer.svg)](https://github.com/meanie/mail-composer/issues)
[![codacy](https://img.shields.io/codacy/c0decdb116194cc9b1e7c1d53b6a8b3d.svg)](https://www.codacy.com/app/meanie/mail-composer)


A utility to help you compose emails using the Handlebars templating engine, compatible with the [@sendgrid/mail](https://www.npmjs.com/package/@sendgrid/mail) library.

![Meanie](https://raw.githubusercontent.com/meanie/meanie/master/meanie-logo-full.png)

## Installation

You can install this package using `yarn` or `npm`.

```shell
#yarn
yarn add @meanie/mail-composer

#npm
npm install @meanie/mail-composer --save
```

## Dependencies

This package has a peer dependency of [handlebars](https://www.npmjs.com/package/handlebars), which is assumed to be configured (e.g. custom plugins) by your application.

## Basic usage

Prepare main template (e.g. `template.hbs`):

```hbs
<html>
<body>
  <h1>{{app.title}}</h1>
  {{partial}}
</body>
</html>
```

Prepare a partial (e.g. `hello.hbs`):

```hbs
<p>Hello {{user.firstName}}!</p>
```

Configure the composer:

```js
//Load dependencies
const composer = require('@meanie/mail-composer');

//Set paths to main templates
composer.config({
  templateHtml: '/path/to/template.hbs',
  templateText: '/path/to/template.txt',
});
```

Then use it to compose an email message and send it with a compatible mailer, for example [@sendgrid/mail](https://www.npmjs.com/package/@sendgrid/mail):

```js
//Load mailer
const sgMail = require('@sendgrid/mail');

//Prepare mail data
const mail = {
  to: user.email,
  from: 'Someone <no-reply@example.org>',
  subject: 'Hello {{user.firstName}}',
  html: '/path/to/hello.hbs',
  text: '/path/to/hello.txt',
};

//Prepare template data
const data = {app, user};

//Compose and send the email
composer
  .compose(mail, data)
  .then(email => sgMail.send(email));
```

## Advanced usage
For more advanced cases where you need to manage locals for your templates, it is recommended to write a wrapper service around the composer, e.g.:

```js
'use strict';

/**
 * Dependencies
 */
const moment = require('moment');
const composer = require('@meanie/mail-composer');
const sgMail = require('@sendgrid/mail');

/**
 * Configure sendgrid mailer and composer
 */
sgMail.setApiKey('YOUR_SENDGRID_API_KEY');
composer.config({
  templateHtml: '/path/to/template.hbs',
  templateText: '/path/to/template.txt',
});

/**
 * Create locals for email templates
 */
function createLocals(context) {
  const {title, version} = context.app.locals;
  return {
    now: moment(),
    user: context.user,
    app: {title, version},
  };
}

/**
 * Export mailer interface
 */
module.exports = {

  /**
   * Create an email
   */
  create(type, context, ...args) {

    //Load mail generator and create locals from data
    const generator = require('/path/to/emails/' + type);
    const locals = createLocals(context);

    //Create mail data and append locals
    const mail = generator(...args);
    const data = Object.assign(mail.data || {}, locals);

    //Use composer to generate email instance
    return composer.compose(mail, data);
  },

  /**
   * Send one or more emails
   */
  send(emails) {
    return sgMail
      .sendMultiple(emails);
  },
};
```

Next, create a mail generator file (`hello.js`):

```js
/**
 * Dependencies
 */
const path = require('path');

/**
 * Hello email generator
 */
module.exports = function(user) {

  //Template paths
  const html = path.join(__dirname, 'hello.hbs');
  const text = path.join(__dirname, 'hello.txt');

  //Prepare data
  const to = user.email;
  const subject = 'Hi {{user.firstName}}!';
  const data = {user};

  //Return mail object for composer
  return {to, subject, data, html, text};
};
```

And use the mailer service to easily send out specific emails in a given context:

```js
User
  .findOne({...})
  .then(user => mailer.create('hello', req, user))
  .then(email => email.send());
```

For working examples, see the [Meanie Express Seed](https://github.com/meanie/express-seed) project.

## Randomization of HTML content
A helper is included to append a random string to HTML email contents to prevent GMail
from breaking up your emails by quoting and hiding parts of repeating content. This works
by including a hidden span with random characters for each email before the ending of certain tags, e.g. `</p>`.

Manual usage:

```js
let html = '<p>Copyright 2017 My Company</p>';
html = composer.randomize(html, '</p>');
console.log(html);
//<p>Copyright 2017 My Company<span style="display: none !important;">ab4f2</span></p>
```

Automatic usage via config:

```js
composer.config({
  templateHtml: '/path/to/template.hbs',
  templateText: '/path/to/template.txt',
  autoRandomize: true,
  randomizeTags: 'p',
});
```

## Issues & feature requests

Please report any bugs, issues, suggestions and feature requests in the [@meanie/mail-composer issue tracker](https://github.com/meanie/mail-composer/issues).

## Contributing

Pull requests are welcome! If you would like to contribute to Meanie, please check out the [Meanie contributing guidelines](https://github.com/meanie/meanie/blob/master/CONTRIBUTING.md).

## Credits

* Meanie logo designed by [Quan-Lin Sim](mailto:quan.lin.sim+meanie@gmail.com)

## License
(MIT License)

Copyright 2016-2017, [Adam Reis](https://adam.reis.nz)
