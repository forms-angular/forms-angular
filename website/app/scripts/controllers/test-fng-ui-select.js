'use strict';

websiteApp.controller('TestFngUiSelectCtrl', ['$scope', function ($scope) {

  $scope.onBaseCtrlReady = function(baseScope) {

    baseScope.getDerivedText = function() {
      return "theTextOptions";
    };

    baseScope.getDerivedObj = function() {
      return "theObjOptions";
    };

    baseScope.theTextOptions = ["1st Option", "2nd Option"];
    baseScope.theObjOptions = [{text:"First Option", id:1}, {text: "Second Option", id:2}];
    baseScope.theObjOptions.isObject = true;

  };

}]);
