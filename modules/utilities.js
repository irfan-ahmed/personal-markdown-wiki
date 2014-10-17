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

"use strict";

var config = require("config").capitalizer;
if(!config.ignore) {
  config.ignore = [];
}

function _capitalizeWord(word) {
  if(!word) {
    return word;
  }
  return word.substring(0,1).toUpperCase() + word.substring(1);
}

module.exports.capitalize = function(text) {
  console.log("Capitalizing ", text);
  var words = text.split(" ");
  var sentence = [];
  words.forEach(function(word, index) {
    if(config.ignore.indexOf(word) === -1 || index===0) {
      // word not in ignore list or first word of the sentence
      word = _capitalizeWord(word);
    }
    sentence.push(word);
  });
  return sentence.join(" ");
};
