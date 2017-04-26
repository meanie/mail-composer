'use strict';

/**
 * Email class
 */
class Email {

  /**
   * Constructor
   */
  constructor(from, to, subject, html, text) {
    this.setFrom(from);
    this.setTo(to);
    this.setSubject(subject);
    this.setHtml(html);
    this.setText(text);
  }

  /**
   * Set from
   */
  setFrom(from) {
    this.from = from;
  }

  /**
   * Set to
   */
  setTo(to) {
    this.to = to;
  }

  /**
   * Set reply to
   */
  setReplyTo(replyTo) {
    this.replyTo = replyTo;
  }

  /**
   * Set subject
   */
  setSubject(subject) {
    this.subject = subject;
  }

  /**
   * Set HTML contents
   */
  setHtml(html) {
    this.html = html;
  }

  /**
   * Set text contents
   */
  setText(text) {
    this.text = text;
  }
}

//Export
module.exports = Email;
