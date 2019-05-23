'use strict';
websiteApp.controller('BEnhancedSchemaReadonlyCtrl', ['$scope', function ($scope) {

  $scope.disableFunctions = $scope.sharedData.disableFunctions;

  $scope.disableFunctions.isDeleteDisabled = function() {
    return true;
  };
  $scope.disableFunctions.isSaveDisabled = function() {
    return true;
  };
  $scope.disableFunctions.isCancelDisabled = function() {
    return true;
  };
  $scope.disableFunctions.isNewDisabled = function() {
    return true;
  };

}]);
