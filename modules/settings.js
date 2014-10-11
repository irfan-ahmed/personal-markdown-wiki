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

var fs = require("fs");
var path = require("path");
var when = require("when");

var settings = {
  topics: []
};
var config = {
  dataDir: path.join(__dirname, "..", "data")
};
config.settingsFile = path.join(config.dataDir, "settings.json");
config.topicsDir = path.join(config.dataDir, "topics");

console.log("Data Dir Config: ", config);

// lets create the config.settingsFile and config.dataDir if they do not exist...
fs.mkdir(config.dataDir, function(err) {
  if(err && err.code !== "EEXIST") {
    console.log("Error: ", err);
  } else {
    fs.mkdir(config.topicsDir, function(err) {
      if(err && err.code !== "EEXIST") {
        console.log("Error: ", err);
      } else {
        fs.readFile(config.settingsFile, function(err, data) {
          console.log("Error in reading settings file: ", err);
          if(err && err.code === "ENOENT") {
            saveSettings();
          } else {
            settings = JSON.parse(data);
          }
        });
      }
    });
  }
});

function saveSettings() {
  return when.promise(function(resolve, reject) {
    fs.writeFile(config.settingsFile, JSON.stringify(settings), function(err) {
      if(err) {
        console.error("Error in creating file", err);
        reject(err);
      } else {
        resolve(settings);
      }
    });
  });
};

module.exports.get = function() {
  return when.promise(function(resolve, reject) {
    if(settings) {
      resolve(settings);
    } else {
      fs.readFile(config.settingsFile, function(err, data) {
        if(err) {
          switch(err.code) {
            case "ENOENT":
              settings = {
                topics: []
              };
              console.warn("File", config.settingsFile, "does not exist.... creating now.");
              saveSettings().then(function() {
                resolve(settings);
              }, function(e) {
                reject(e);
              });
              break;
            default:
              reject(err);
              break;
          }
        } else {
          settings = JSON.parse(data);
          console.log("Read Settings: ", settings);
          resolve(settings);
        }
      });
    }
  });
};

module.exports.set = function(data) {
  if(!data) {
    reject("Settings is null");
    return null;
  }
  settings = data;
  console.log("Saving Settings :", data);
  return saveSettings();
};

module.exports.createTopic = function(topicInfo) {
  return when.promise(function(resolve, reject) {
    console.log("Creating topic: ", topicInfo, settings);
    if(!settings.topics) {
      settings.topics = [];
    }
    // create a dir for the topic..
    var topicDir = path.join(config.topicsDir, topicInfo.id);
    fs.mkdir(topicDir, function(err) {
      if(err) {
        console.log("Error in creating topic dir: ", err);
        if(err.code === "EEXIST") {
          resolve(topicInfo);
          saveSettings();
        } else {
          reject(err);
        }
      } else {
        // update settings object
        console.log("Created Dir : ", topicDir);
        settings.topics.push(topicInfo);
        saveSettings();
        resolve(topicInfo);
      }
    });
  });
};

module.exports.getConfig = function() {
  return {
    settings: settings,
    config: config
  };
};


