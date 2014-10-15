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
        "pmdApp.settings", 
        "pmdApp.storeService", "pmdApp.utilsService"
    ]);

    module.config([
        '$routeProvider', 
        function ($routeProvider) {
            $routeProvider.otherwise({redirectTo: '/topic'});
        }
    ]);

    module.controller("PMDAppCtrl", [
        "$scope", "$location", "$rootScope", "$timeout",
        function ($scope, $location, $rootScope, $timeout) {
            var MAX_TIMEOUT = 1000*5; // 5secs
            var MAX_ERROR_TIMEOUT = 2*MAX_TIMEOUT;
            
            $scope.app = {
                left: "",
                alert: {
                    type: "success",
                    text: "",
                    details: ""
                }
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
            
            $scope.$on("alert", function(event, alertData) {
                console.debug("Alert: ", alertData);
                $scope.app.alert = alertData;
                $timeout(function() {
                    $scope.app.alert.text = $scope.app.alert.details = "";
                }, (alertData.type==="error"?MAX_ERROR_TIMEOUT:MAX_TIMEOUT));
            });
        }
    ]);
    
    /**
     * This directive allows one to enter a tab and move a set number of spaces forward or
     * back. The number of spaces to move can be configured as the value of the directive
     * Eg: <textarea ng-allow-tab="4"/></textarea> will move 4 spaces on a tab
     */
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

    /**
     * A directive to trap the enter key and evaluate a provided expression. This can be 
     * attached to input text fields.
     */
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

