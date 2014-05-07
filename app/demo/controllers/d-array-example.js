'use strict';
myDemoApp.controller('DArrayExampleCtrl', ['$scope', '$data', function ($scope, $data) {

  $scope.disableFunctions = $data.disableFunctions;
  $scope.dataEventFunctions = $data.dataEventFunctions;
  $scope.record = $data.record;

  $scope.disableFunctions.isDeleteDisabled = function (record, oldRecord) {
    // Do not allow records that have previously been "accepted" to be deleted
    return oldRecord.accepted;
  };

  $scope.dataEventFunctions.onAfterCreate = function (data) {
    alert('Here is an example onAfterCreate event. ' + JSON.stringify(data));
  };

}]);