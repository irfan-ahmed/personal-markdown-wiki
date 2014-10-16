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

(function () {
  var module = angular.module("pmdApp.storeService", []);

  module.factory("storeService", [
    "$http", "$q",
    function ($http, $q) {
      return {
        getSettings: function () {
          return $http.get("/data/settings");
        },
        setSettings: function (settings) {
          console.debug("Saving Settings: ", settings);
          return $http.post("/data/settings", settings);
        },
        getTopicData: function (id) {
          return $http.get("/data/topic/" + id);
        },
        saveSection: function (topicID, section) {
          return $http.post("/data/topic/" + topicID, section);
        },
        removeSection: function (topicID, sectionID) {
          return $http.post("/data/delete/section", {
            topicID: topicID, sectionID: sectionID
          });
        },
        createTopic: function (topicInfo) {
          return $http.post("/data/create/topic", topicInfo);
        },
        isLoggedIn: function () {
          var deferred = $q.defer();
          deferred.resolve(true);
          return deferred.promise;
        }
      };
    }
  ]);
})();


