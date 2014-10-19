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
  var module = angular.module("pmdApp.search", ["ngRoute"]);

  module.config([
    "$routeProvider",
    function ($routeProvider) {
      $routeProvider.when("/search", {
        templateUrl: "components/search/search.html",
        controller: "SearchCtrl"
      });
    }
  ]);

  module.controller("SearchCtrl", [
    "$scope", "$location", "searchService", "utilsService",
    function ($scope, $location, searchService, utils) {
      console.debug("Search Controller Inited", $location.search());
      var key = "lastSearchText";

      $scope.search = {
        searchText: $location.search().text,
        links: {},
        noResultsText: "",
        maxDisplayLength: 60
      };

      $scope.searchText = function (event) {
        if (event) {
          event.preventDefault();
        }
        $location.search({text: $scope.search.searchText});
        $scope.search.noResultsText = "";
        $scope.search.links = null;
        searchService.search($scope.search.searchText).success(function (linkSet) {
          if (linkSet === null || !linkSet.results || linkSet.results.length === 0) {
            $scope.search.noResultsText = "No Results. Try a different search term...";
          } else {
            // format the text...
            angular.forEach(linkSet.results, function (value, key) {
              var text = value.text;
              if (text.toLowerCase() === "here") {
                text = key;
              }
              var r = new RegExp("(" + $scope.search.searchText.split(" ").join("|") + ")", "gi");
              text = text.replace(r, "<span class='text-success bg-success'>$1</span>");
              value.text = text;

            });
            $scope.search.links = linkSet.results;
            localStorage.setItem(key, JSON.stringify({
              text: $scope.search.searchText,
              links: $scope.search.links
            }));
          }
        }).error(function (err) {
          utils.error("Error in getting search query", err);
        });
      };

      $scope.formatLink = function (link) {
        if (!link) {
          return link;
        }
        var formatted = link;
        if (link.length > $scope.search.maxDisplayLength) {
          formatted = link.substring(0, $scope.search.maxDisplayLength) + "...";
        }
        return formatted;
      };

      // on init try to search for the term in the link if one is provided
      if ($scope.search.searchText) {
        $scope.searchText(null);
      } else {
        // get the last search term and show searches
        var prevData = localStorage.getItem(key);
        if (prevData) {
          prevData = JSON.parse(prevData);
          $scope.search.searchText = prevData.text;
          $scope.search.links = prevData.links;
        }
      }
    }
  ]);

  module.factory("searchService", [
    "$http",
    function ($http) {
      return {
        updateSearch: function (searchData) {
          return $http.post("/data/search", searchData);
        },
        search: function (text) {
          return $http.get("/data/search?text=" + text);
        }
      };
    }
  ]);
})();