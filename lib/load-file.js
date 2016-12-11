'use strict';

/**
 * Dependencies
 */
const fs = require('fs');
const readFile = fs.readFile;

/**
 * Partials cache
 */
const cache = new Map();

/**
 * Helper to load a file
 */
module.exports = function loadFile(path) {

  //Check if we have in cache
  if (cache.has(path)) {
    const contents = cache.get(path);
    return Promise.resolve(contents);
  }

  //Read file
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (error, contents) => {

      //Reject if encountered an error
      if (error) {
        return reject(error);
      }

      //Cache and resolve
      cache.set(path, contents);
      resolve(contents);
    });
  });
};
