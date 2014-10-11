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
    var module = angular.module("pmdApp.topic", ["ngRoute"]);

    module.config([
        "$routeProvider",
        function ($routeProvider) {
            $routeProvider.when("/topic", {
                templateUrl: "components/topic/topic.html",
                controller: "TopicCtrl",
                reloadOnSearch: false
            });
        }
    ]);

    module.controller("TopicCtrl", [
        "$scope", "$location", "storeService", "$rootScope",
        function ($scope, $location, store, $rootScope) {
            $scope.topic = {
                current: "",
                label: "",
                sections: []
            };
            if ((typeof hljs) !== "undefined") {
                marked.setOptions({
                    highlight: function (code, lang) {
                        return hljs.highlightAuto(code, [lang]).value;
                    }
                });
            }

            function newSection(title) {
                var ts = new Date().getTime();
                return {
                    id: ts,
                    updated: ts,
                    title: title,
                    markdown: ""
                };
            }
            ;

            function broadcastSections() {
                $rootScope.$broadcast("topic.sections", {
                    topic: $scope.topic.current,
                    sections: $scope.topic.sections.map(function (s) {
                        return {title: s.title,
                            id: s.id};
                    })
                });
            }

            function showTopic(topic) {
                store.getSettings().success(function (settings) {
                    console.debug("topics getting settings: ", settings);
                    if (!settings.topics || !settings.topics.length) {
                        return; //TODO show alert here
                    }
                    var match = settings.topics.filter(function (t) {
                        return t.id === topic.id;
                    })[0];
                    if (match) {
                        $scope.topic.current = match;
                        store.getTopicData($scope.topic.current.id).success(function (sections) {
                            console.debug("Got Sections: ", sections);
                            $scope.topic.sections = sections;
                            broadcastSections();
                        });
                    }
                });
            }

            // init.. show the selected topic
            if ($location.search()) {
                var topic = $location.search();
                console.debug("Showing Sections for Topic: ", topic);
                showTopic(topic);
            }
            console.debug("topic.js Current Topic: ", $location.search(), $scope.topic.current);

            // since reloadOnSearch is false, need to handle different topics manually as the
            // url for the topic remains the same
            $scope.$on("$routeUpdate", function (event, data) {
                var topic = $location.search();
                if ($scope.topic.current.id !== topic.id) {
                    console.debug("Topic Changed : ", $scope.topic.current, topic);
                    showTopic(topic);
                }
            });

            $scope.newSection = function () {
                store.isLoggedIn().then(function () {
                    console.debug("Creating New Section : ", $scope.topic.current);
                    var title = prompt("Specify Section Title?");
                    if (title) {
                        var section = newSection(title);
                        store.saveSection($scope.topic.current.id, section).success(function () {
                            $scope.topic.sections.unshift(section);
                            broadcastSections();
                            /*$timeout(function () {
                             $scope.edit(section);
                             }, 200);*/
                        }).error(function (err) {
                            //$scope.showAlert(err);
                            console.error(err);
                        });
                    }
                }, function () {
                    console.error("Not Logged IN");
                });
            };

            $scope.edit = function (section) {
                store.isLoggedIn().then(function () {
                    console.debug("Editiong section: ", section);
                    $scope.currentEditID = section.id;
                    var height = section.markdown.split("\n").length + 6;
                    if (height < 10) {
                        height = 10;
                    }
                    if (height > 35) {
                        height = 35;
                    }
                    $scope.currentEditHeight = height;
                    section.backup = section.markdown;
                    console.debug("Setting Section ID : ", section.id);
                }, function () {
                    $scope.showAlert({
                        heading: "Edit not allowed.",
                        message: "You are not logged in. All edits require authentication."
                    });
                });
            };

            $scope.getHtml = function (section) {
                if ($scope.currentEditID && section.html) {
                    return section.html;
                }
                if (section.html === undefined) {
                    section.markdown = section.markdown || "";
                    section.html = marked(section.markdown);
                    /*var $html = $("<div></div>").html(section.html);
                     var $links = $html.find("a");
                     var linksData = {};
                     linksData[section.title] = "#" + $location.path() + "#" + section.id;
                     $links.each(function (index, link) {
                     link = $(link);
                     if (link.attr("href").indexOf("http://") === 0) {
                     link.attr("target", "_blank");
                     }
                     linksData[link.text()] = link.attr("href");
                     });
                     section.html = $html.html();*/
                    //searchService.addAll(linksData);
                }
                return section.html;
            };

            $scope.showEdit = function (id) {
                return $scope.currentEditID === id;
            };

            $scope.save = function (section) {
                console.debug("saving section text : ", section.title);
                var backup = section.backup;
                delete section.backup;
                delete section.html;
                $scope.currentEditID = "";
                store.saveSection($scope.topic.current.id, section).success(function () {
                    //TODO show alert success
                    broadcastSections();
                }).error(function (err) {
                    section.markdown = backup;
                    console.error("Error saving: ", err);
                });
            };

            $scope.cancel = function (section) {
                $scope.currentEditID = "";
                $scope.currentEditHeight = 1;
                if (section.backup) {
                    section.markdown = section.backup;
                }
            };

            $scope.remove = function (section, index) {
                console.debug("Deleting ", section.title);
                var ok = confirm("Are you sure you want to delete the section titled: \n" 
                    + section.title + "?\nThis will be lost for ever and ever...");
                if (ok) {
                    store.removeSection($scope.topic.current.id, section.id).success(function () {
                        $scope.topic.sections.splice(index, 1);
                        broadcastSections();
                    }).error(function (err) {
                        console.error("Delete Section : ", section, err);
                    });
                    $scope.currentEditID = "";
                }
            };
        }
    ]);
})();