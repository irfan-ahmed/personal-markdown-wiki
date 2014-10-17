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

var when = require("when");
var fs = require("fs");
var path = require("path");
var config = require("./settings").getConfig().config;
var dirCreated = false;
var ext = ".json";
var topics = {};
var utils = require("./utilities");

module.exports.list = function (topicID) {
    console.log("Getting Sections for:", topicID);
    return when.promise(function (resolve, reject) {
        if (topics[topicID]) {
            resolve(topics[topicID].sections);
            return;
        }
        topics[topicID] = {
            sections: []
        };
        var dir = getTopicDir(topicID);
        fs.readdir(dir, function (err, files) {
            if (err) {
                if (err.code === "ENOENT") { // topicDir does not exist
                    fs.mkdir(dir, function (err) {
                        console.log("Error in making dir for topicID ", topicID, err);
                        reject(err);
                    });
                    resolve(topics[topicID].sections); //send empty sections array
                } else {
                    reject(err); //other error.. other then no exists
                }
            } else { // no error. get the sections...
                var proms = files.map(function (file) { // start reading files
                    return when.promise(function (fRes, fRej) {
                        fs.readFile(path.join(dir, file), function (err, data) {
                            if (err) {
                                console.log("Error in reading file:", file, err);
                                fRej(err);
                            } else {
                                topics[topicID].sections.push(JSON.parse(data.toString()));
                                fRes(file);
                            }
                        });
                    });
                });
                // start reading files in sequence
                // TODO better performance needed here...
                when.all(proms).then(function () {
                    resolve(topics[topicID].sections);
                }, function (error) {
                    reject(error);
                });
            }
        });
    });
};

/** call to save/update a section to the topic dir **/
exports.save = function (topicID, section) {
    return when.promise(function (resolve, reject) {
        if (!section) {
            console.log("Cannot create section with empty data...");
            reject("section object is empty");
            return;
        }
        // capitalize the title
        if(section.title) {
          section.title = utils.capitalize(section.title);
        }
        fs.writeFile(getFileName(topicID, section), JSON.stringify(section), function (err) {
            if (err) {
                console.log("sections.save:", err);
                reject(err);
            } else {
                updateSection(topicID, section);
                resolve(section);
            }
        });
    });
};

// delete a section from a topic
exports.deleteSection = function (params) {
    return when.promise(function (resolve, reject) {
        var fileName = getFileName(params.topicID, params.sectionID);
        fs.unlink(fileName, function (err) {
            if (err) {
                console.log("sections.delete: ", fileName, err);
                reject(err);
            } else {
                deleteSection(params.topicID, params.sectionID);
                resolve(fileName);
            }
        });
    });
};

function getFileName(topicID, section) {
    var id = section;
    if(typeof section === "object") {
        id = section.id;
    }
    return path.join(getTopicDir(topicID), id + ext);
}

function getTopicDir(topicID) {
    return path.join(config.topicsDir, topicID);
}

function getSectionIndex(topicID, section) {
    var index = -1;
    if (!topics[topicID] || !topics[topicID].sections) {
        return index;
    }
    var sections = topics[topicID].sections;
    var id = section;
    if(typeof section === "object") {
        id = section.id;
    }
    for (var i = 0; i < sections.length; i++) {
        if (sections[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
}

function updateSection(topicID, section) {
    var index = getSectionIndex(topicID, section);
    if (index !== -1) {
        topics[topicID].sections[index] = section;
    } else {
        topics[topicID].sections.unshift(section);
    }
}

function deleteSection(topicID, section) {
    var index = getSectionIndex(topicID, section);
    if (index !== -1) {
        topics[topicID].sections.splice(index, 1);
    }
}

