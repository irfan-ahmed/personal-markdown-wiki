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
    var module = angular.module("pmdApp.settings", ["ngRoute"]);

    module.config([
        "$routeProvider", 
        function ($routeProvider) {
            $routeProvider.when("/settings", {
                templateUrl: "components/settings/settings.html",
                controller: "SettingsCtrl"
            });
        }
    ]);

    module.controller("SettingsCtrl", [
        "$scope", "storeService",
        function ($scope, store) {
            console.debug("Service: ", store);
            $scope.settings = {};

            $scope.addTopic = function () {
                var topicName = prompt("Specify Topic Name:");
                if (topicName && topicName.trim() !== "") {
                    var id = topicName.toLowerCase().replace(/ /g, "_");
                    var topic = {
                        label: topicName,
                        id: id + "_" + new Date().getTime(),
                        desc: topicName
                    };
                    if (!$scope.settings.topics) {
                        $scope.settings.topics = [];
                    }
                    $scope.settings.topics.push(topic);
                    store.setSettings($scope.settings).success(function () {
                        console.debug("Settings saved successfully");
                    }).error(function (e) {
                        console.error("Saving settings error: ", e);
                    });
                }
            };

            store.getSettings().success(function (settings) {
                $scope.settings = settings;
                console.debug("Settings :", $scope.settings);
            }).error(function (e) {
                console.error("Error in getting settings :", e);
            });
        }
    ]);
})();
