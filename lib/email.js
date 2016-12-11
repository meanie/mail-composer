'use strict';

/**
 * Email constructor
 */
function Email(from, to, subject, html, text) {
  this.from = from;
  this.to = to;
  this.subject = subject;
  this.html = html;
  this.text = text;
}

/**
 * Set from
 */
Email.prototype.setFrom = function(from) {
  this.from = from;
};

/**
 * Set to
 */
Email.prototype.setTo = function(to) {
  this.to = to;
};

/**
 * Set subject
 */
Email.prototype.setSubject = function(subject) {
  this.subject = subject;
};

/**
 * Set HTML contents
 */
Email.prototype.setHtml = function(html) {
  this.html = html;
};

/**
 * Set text contents
 */
Email.prototype.setText = function(text) {
  this.text = text;
};

//Export
module.exports = Email;
