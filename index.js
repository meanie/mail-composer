'use strict';

/**
 * Dependencies
 */
const crypto = require('crypto');
const handlebars = require('handlebars');
const loadPartial = require('./lib/load-partial');
const Email = require('./lib/email');

/**
 * Defaults
 */
const defaults = {
  templateText: '',
  templateHtml: '',
  partialString: '{{partial}}',
  autoRandomize: false,
  randomizeTags: 'p',
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
   * Configure defaults
   */
  config(options) {
    Object.assign(defaults, options || {});
  },

  /**
   * Compile with handlebars
   */
  compile(contents, data) {
    return handlebars.compile(contents)(data);
  },

  /**
   * Compose an email
   */
  compose(mail, data, options) {

    //Create config
    const config = Object.assign({}, defaults, options || {});

    //Extract basic mail data and create new email instance
    const {html, text, subject} = mail;
    const {partialString: str} = config;
    const email = new Email(mail);

    //Compile subject
    email.subject = composer.compile(subject, data);

    //Load partials
    return Promise
      .all([
        loadPartial(config.templateHtml, html, str),
        loadPartial(config.templateText, text, str),
      ])
      .then(([html, text]) => {

        //Compile HTML and text
        html = composer.compile(html, data);
        text = composer.compile(text, data);

        //Auto randomize if needed
        if (config.autoRandomize) {
          html = composer.randomize(html, config.randomizeTags);
        }

        //Set html/text
        Object.assign(email, {html, text});

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
  randomize(html, tags = 'p') {

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
