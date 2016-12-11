'use strict';

/**
 * Dependencies
 */
const handlebars = require('handlebars');
const loadPartial = require('./lib/load-partial');
const Email = require('./lib/email');

/**
 * Config object
 */
const config = {
  templateText: '',
  templateHtml: '',
  partialString: '{{partial}}',
};

/**
 * Composer interface
 */
module.exports = {

  /**
   * Expose email base class for modification
   */
  Email,

  /**
   * Configure
   */
  config(options) {
    Object.assign(config, options || {});
  },

  /**
   * Compose an email
   */
  compose(mail, data) {

    //Extract mail data
    const {from, to, html, text} = mail;

    //Compile subject
    const subject = handlebars.compile(mail.subject)(data);

    //Initialize email and get partial string
    const email = new Email(from, to, subject);
    const str = config.partialString;

    //Load partials
    return Promise
      .all([
        loadPartial(config.templateHtml, html, str),
        loadPartial(config.templateText, text, str),
      ])
      .then(([html, text]) => {

        //Compile HTML and text
        html = handlebars.compile(html)(data);
        text = handlebars.compile(text)(data);

        //Set html/text
        email.setHtml(html);
        email.setText(text);

        //Resolve with email
        return email;
      });
  },
};
