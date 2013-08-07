myDemoApp.controller('DArrayExampleCtrl',['$scope', '$data', function($scope, $data) {

    $scope.disableFunctions = $data.disableFunctions;
    $scope.dataEventFunctions = $data.dataEventFunctions;
    $scope.record = $data.record;

    $scope.disableFunctions.isDeleteDisabled = function (record, oldRecord, form) {
        // Do not allow records that have previously been "accepted" to be deleted
        return oldRecord.accepted;
    };

    $scope.dataEventFunctions.onAfterCreate = function(data) {
        alert('A new record was created : ' + JSON.stringify(data))
    }

}]);