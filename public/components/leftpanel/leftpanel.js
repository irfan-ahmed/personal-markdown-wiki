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
    var module = angular.module("pmdApp.leftPanel", []);

    module.controller("LeftPanelCtrl", [
        "$scope", "storeService", "$location", "$modal", "$timeout",
        function ($scope, store, $location, $modal, $timeout) {
            var panelNames = ["topics", "settings", "search"];

            $scope.leftPanel = {
                topics: [],
                currentPanel: "topics",
            };

            $scope.$on("leftpanel.panel", function (event, name) {
                console.debug("leftPanel Name event: ", name);
                if (panelNames.indexOf(name) === -1) {
                    console.error("Panel name", name, "does not exist");
                    return;
                }
                $scope.leftPanel.currentPanel = name;
            });
            
            $scope.$on("topic.sections", function(event, data) {
                console.debug("Got Sections for :", data);
                var topicID = data.topic.id;
                for(var i=0;i<$scope.leftPanel.topics.length;i++) {
                    var panelTopic = $scope.leftPanel.topics[i];
                    if(panelTopic.id === topicID) {
                        console.debug("Match : ", panelTopic, data.sections);
                        panelTopic.sections = data.sections;
                        console.debug("Topic Sections:", panelTopic.sections);
                        break;
                    }
                }
                
            });

            $scope.onTopic = function (topic, index) {
                $scope.leftPanel.currentTopic = topic;
                var displayedID = $location.search().id;
                if(topic.id !== displayedID) {
                    console.debug("Showing Topic: ", topic);
                    $location.search({id: topic.id});
                }
            };

            $scope.newTopic = function () {
                var newTopicDialog = $modal.open({
                    templateUrl: "components/leftpanel/newTopic.html",
                    controller: "NewTopicDialogCtrl",
                    size: "sm"
                });
                newTopicDialog.result.then(function (topicInfo) {
                    console.debug("New Topic Info: ", topicInfo);
                    store.createTopic(topicInfo).then(function () {
                        $scope.leftPanel.topics.push(topicInfo);
                        $scope.leftPanel.currentTopic = topicInfo;
                        $location.search(topicInfo);
                    }, function (e) {
                        console.error("Create Topic: ", e);
                    });
                }, function () {
                    console.debug("Dialog Cancelled/closed...");
                });
            };
            
            $scope.showSection = function(id) {
                console.debug("Showing Section : ", id);
                $location.hash(id);
            };
            
            $scope.backToTopics = function() {
                // TODO store the old link and move back to that location
                console.debug("Current Topic: ", $scope.leftPanel.currentTopic);
                $location.url("/topic?id=" + $scope.leftPanel.currentTopic.id);
            };
            
            store.getSettings().success(function (settings) {
                console.debug("Settings : ", settings, $location.path(), $location.search());
                if (settings.topics && settings.topics.length) {
                    $scope.leftPanel.topics = settings.topics;
                    var page = $location.path();
                    if(page === "/topic") {
                        var id = $location.search().id;
                        if(!id) {
                            id = $scope.leftPanel.topics[0].id;
                            $timeout(function() {
                                $location.search({id: id});
                            }, 500);
                        }
                        $scope.leftPanel.topics.forEach(function(t) {
                            if(id === t.id) {
                                t.open = true;
                                $scope.leftPanel.currentTopic = t;
                            } else {
                                t.open = false;
                            }
                            console.debug("Opened ", t.id, t.open);
                        });
                    }
                }
            }).error(function (e) {
                console.error("No Topics/Settings : ", e);
            });
        }
    ]);

    module.controller("NewTopicDialogCtrl", [
        "$scope", "$modalInstance", 
        function ($scope, $modalInstance) {
            $scope.topic = {
                label: "",
                desc: ""
            };

            $scope.ok = function (e) {
                var topicInfo = {};
                if (!$scope.topic.label) {
                    $scope.topic.error = "Label is required.";
                    e.preventDefault();
                    return false;
                }
                topicInfo.label = $scope.topic.label;

                topicInfo.desc = $scope.topic.desc;
                if (!topicInfo) {
                    topicInfo.desc = topicInfo.label;
                }
                topicInfo.id = topicInfo.label.toLowerCase().replace(/ /g, "_") + "_" + new Date().getTime();
                $modalInstance.close(topicInfo);
            };

            $scope.cancel = function (e) {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
})();