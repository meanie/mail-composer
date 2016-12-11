'use strict';

/**
 * Dependencies
 */
const loadFile = require('./load-file');

/**
 * Helper to load a partial
 */
module.exports = function loadPartial(templatePath, partialPath, str) {

  //Resolve templates
  return Promise
    .all([
      templatePath ? loadFile(templatePath) : str,
      loadFile(partialPath),
    ])
    .then(([template, partial]) => {
      return template.replace(str, partial);
    });
};
