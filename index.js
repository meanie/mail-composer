'use strict';

/**
 * Dependencies
 */
const crypto = require('crypto');
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
  autoRandomize: false,
  randomizeTags: 'p h1',
};

/**
 * Composer interface
 */
const composer = module.exports = {

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
    const {from, to, html, text, replyTo} = mail;

    //Compile subject
    const subject = handlebars.compile(mail.subject)(data);

    //Initialize email and get partial string
    const email = new Email(from, to, subject);
    const str = config.partialString;

    //Reply to
    if (replyTo) {
      email.setReplyTo(replyTo);
    }

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

        //Auto randomize if needed
        if (config.autoRandomize) {
          html = composer.randomize(html, config.randomizeTags);
        }

        //Set html/text
        email.setHtml(html);
        email.setText(text);

        //Resolve with email
        return email;
      });
  },

  /**
   * Helper to append random string to HTML email contents to prevent GMail
   * from breaking up your emails and hiding parts of repeating content.
   * This works by including a hidden span with random characters for each
   * email before the ending of certain tags, e.g. </p>
   */
  randomize(html, tags = 'p h1') {

    //Turn tags into array
    if (!Array.isArray(tags)) {
      tags = tags.split(' ');
    }

    //Create a 5 char random string for email content to be unique
    const time = String(Date.now());
    const hash = crypto
      .createHash('md5')
      .update(time)
      .digest('hex')
      .substr(0, 5);

    //Replace all tags
    return tags.reduce((html, tag) => {

      //Create ending tag
      tag = `</${tag}>`;

      //Create HTML string to replace with and regex
      const str = `<span style="display: none !important">${hash}</span>${tag}`;
      const regex = new RegExp(tag, 'g');

      //Replace in HTML
      return html.replace(regex, str);
    }, html);
  },
};
