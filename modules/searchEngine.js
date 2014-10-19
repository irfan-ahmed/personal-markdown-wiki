/*
 * The MIT License
 *
 * Copyright 2014 Irfan Ahmed.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * A very simple implementation of a search engine based on the text of a link.
 * TODO: Implement better search algorithm
 *
 */

"use strict";

var config = require("config");
var utils = require("./utilities");
var when = require("when");
var fs = require("fs");

var searchFileName = utils.getSearchFileName();
var dirty = false, timer = null, saving = false; // used in checking if writes are over

var store = {};
if (!config.search) {
  config.search = {
    ignore: []
  };
}
if (!config.search.ignore) {
  // backup
  config.search.ignore = ["to", "for", "a", "the", "is", "us", "com", "org", "net",
    "and", "an", "on", "in"];
}

// load search data...
try {
  store = require(searchFileName);
} catch (error) {
  console.log("Error in loading search data: ", searchFileName, error);
  store = {
    searchDB: {}, // key->word, value: [] of associated links
    linksDB: {} // key->href, value: link text; this is to get the original link text for the link
  };
}

/**
 * update the search DB... basically the search algo here is for eack link
 *  1. set link and text in linksDB
 *  2. get the set of search terms from the link text. If link text is here, use the link
 *     as the link text
 *  3. update searchDB and add the link to the array of links associated with that word
 * @param {object} linksData
 * @returns {unresolved}
 */
exports.updateSearch = function (linksData) {
  return when.promise(function (resolve, reject) {
    console.log("Adding search data :", linksData);
    for (var text in linksData) {
      var link = linksData[text];
      if (text !== store.linksDB[link]) {
        store.linksDB[link] = text; //associate text with link
        dirty = true;
      }
      if (text === "here") {
        text = link;
      }
      var words = getSearchWords(text);
      words.forEach(function (word) {
        var links = store.searchDB[word] || [];// check what links are associated with the word
        if (links.indexOf(link) === -1) { // current link not associated
          links.push(link); // associate link with word
          dirty = true;
        }
        store.searchDB[word] = links; // set the links
      });
    }
    save();
    resolve();
  });
};

/**
 *  The function queries the search DBs and returns a set of possible matches for the text
 *  The algo here is to split the text into searchable terms and then return the links
 *  associated with the words. The return value will also contain the actual text
 *  associated with the link.
 *
 * @param {string} text The text to search for
 * @returns {object|null} Object by link containing the original link text and whether the link is
 *                        external
 */
exports.query = function (text) {
  return when.promise(function (resolve, reject) {
    var start = new Date().getTime();
    var linkSet = {};
    if (!text) {
      reject("Invalid/empty text");
      return;
    }
    var terms = getSearchWords(text);
    var found = 0;
    for (var word in store.searchDB) {
      terms.forEach(function (term) {
        // match term in word: will match term "em" in words "management" and "REM"
        // match word in term: will match term "sunday" to word "day"
        if ((word.indexOf(term) !== -1) || (term.indexOf(word) !== -1)) {
          store.searchDB[word].forEach(function (link) {
            linkSet[link] = {
              text: store.linksDB[link] || link,
              external: (link.indexOf("://") !== -1)
            };
          });
          found++;
        }
      });
    }
    //console.log("query:", linkSet);
    var end = new Date().getTime();
    console.log("Time Taken: ", end - start, " ms for ", found, "results");
    resolve(linkSet);
  });
};

/**
 *  Returns a set of search terms from the text. The terms do not include words in the
 *  config.search.ignored list as well as numbers.
 *
 *  @params {string} text The text to get the search terms from
 */
var getSearchWords = function (text) {
  var urlIndex = text.indexOf("://");
  if (urlIndex !== -1) { // this is a link
    text = text.substring(urlIndex + 3);
    text = text.replace(/\.|\/|\+/g, " "); // convert to sentence
  }
  var words = text.toLowerCase().split(" ");
  words = words.filter(function (word) {
    //ignored word
    if (config.search.ignore.indexOf(word) !== -1) {
      return false;
    }
    //number
    if (!isNaN(word)) {
      return false;
    }
    return true;
  });
  return words;
};

/**
 * Check if the store is dirty. If so, save it to the file. If there a multiple updates, then
 * the save timer waits till there is a pause in activity and then saves.
 * @returns {undefined}
 */
var save = function () {
  if (!dirty) {
    return;
  }
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(function () {
    saveStore();
  }, 1000); // try to save after a sec of activity
};

/**
 * Save to the search file name asynchronously
 * @returns {undefined}
 */
var saveStore = function () {
  if (saving) {
    // file is being written to... trigger a save again...
    save();
    return;
  }
  saving = true;
  console.log("Writing Search Data....");
  fs.writeFile(searchFileName, JSON.stringify(store), function (err) {
    if (err) {
      console.log("Error in saving search:", err);
    }
    saving = false;
    dirty = false;
  });
};