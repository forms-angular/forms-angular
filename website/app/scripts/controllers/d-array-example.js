'use strict';
websiteApp.controller('DArrayExampleCtrl', ['$scope', function ($scope) {

  $scope.disableFunctions = $scope.sharedData.disableFunctions;
  $scope.dataEventFunctions = $scope.sharedData.dataEventFunctions;
  $scope.record = $scope.sharedData.record;

  $scope.disableFunctions.isDeleteDisabled = function (record, oldRecord) {
    // Do not allow records that have previously been "accepted" to be deleted
    return oldRecord.accepted;
  };

  $scope.dataEventFunctions.onAfterCreate = function (data) {
    alert('Here is an example onAfterCreate event. ' + JSON.stringify(data));
  };

}]);
