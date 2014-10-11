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

'use strict';

// Declare app level module which depends on views, and components
(function () {
    var module = angular.module('pmdApp', [
        'ngRoute', "ui.bootstrap", "ngAnimate", "ngSanitize",
        'pmdApp.topic', "pmdApp.search",
        'pmdApp.header', 'pmdApp.footer', "pmdApp.leftPanel",
        "pmdApp.settings", "pmdApp.services"
    ]);

    module.config([
        '$routeProvider', 
        function ($routeProvider) {
            $routeProvider.otherwise({redirectTo: '/topic'});
        }
    ]);

    module.controller("PMDAppCtrl", [
        "$scope", "$location", "$rootScope", 
        function ($scope, $location, $rootScope) {
            console.debug("Main Controller Loaded");
            $scope.app = {
                left: ""
            };

            $scope.onViewLoaded = function () {
                console.debug("View Loaded: ", $location.path());
                switch ($location.path()) {
                    case "/settings":
                        $rootScope.$broadcast("leftpanel.panel", "settings");
                        break;
                    case "/search":
                        $rootScope.$broadcast("leftpanel.panel", "search");
                        break;
                    default:
                        $rootScope.$broadcast("leftpanel.panel", "topics");
                        break;
                }
            };
        }
    ]);
    
    module.directive('ngAllowTab', function () {
        var tab = "  ";
        return function (scope, element, attrs) {
            element.bind('keydown', function (event) {
                if (event.keyCode === 9) {
                    var spaces = parseInt(attrs.ngAllowTab);
                    if(isNaN(spaces) || spaces<2) {
                        spaces = 2;
                    }
                    tab = Array(spaces+1).join(" ");
                    event.preventDefault();
                    var start = this.selectionStart;
                    var end = this.selectionEnd;
                    var text = element.val();
                    if(event.shiftKey) {
                        var backStep = start - tab.length;
                        if(backStep < 0) {
                            backStep = 0;
                        }
                        var removedText = text.substring(backStep, start);
                        if(removedText.trim().length === 0) {
                            // ok empty space... we can move back
                            element.val(text.substring(0, backStep) + text.substring(end));
                            this.selectionStart = this.selectionEnd = start - tab.length;
                        }
                    } else {
                        element.val(text.substring(0, start)+ tab + text.substring(end));
                        this.selectionStart = this.selectionEnd = start + tab.length;
                    }
                    element.triggerHandler('change');
                }
            });
        };
    });

    module.directive("ngEnter", function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter, {event: event});
                    });
                    event.preventDefault();
                }
            });
        };
    });
})();

