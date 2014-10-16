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
  var module = angular.module("pmdApp.utilsService", []);

  module.factory("utilsService", [
    "$rootScope",
    function ($rootScope) {
      return {
        alert: function (data) {
          if (!data) {
            return;
          }
          if (typeof data === "string") {
            data = {
              text: data
            };
          }
          if (!data.type) {
            data.type = "success";
          }
          $rootScope.$broadcast("alert", data);
        },
        error: function (text, err) {
          this.alert({
            text: text,
            type: "danger",
            details: err
          });
        },
        success: function (text, details) {
          this.alert({
            type: "success",
            text: text,
            details: details
          });
        },
        warn: function (text, details) {
          this.alert({
            type: "warning",
            text: text,
            details: details
          });
        },
        info: function (text, details) {
          this.alert({
            type: "info",
            text: text,
            details: details
          });
        },
        updateSections: function (topic, sections) {
          $rootScope.$broadcast("topic.sections", {
            topic: topic,
            sections: sections.map(function (s) {
              return {
                title: s.title,
                id: s.id
              };
            })
          });
        }
      };
    }
  ]);
})();


