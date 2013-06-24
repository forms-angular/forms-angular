myDemoApp.controller('BUsingOptionsCtrl',['$scope', '$data', function($scope, $data) {

    $scope.record = $data.record;

    $scope.doAlert = function(message, showId) {
        alertMessage = message;
        if (showId) {
            alertMessage += "\nThe id is " + $scope.record["_id"];
        }
        alert(alertMessage);
    };

    $scope.contextMenu = [
        {
            fn : $scope.doAlert,
            args : ['Processing this record one',true],
            listing: false,
            creating: false,
            editing: true,
            text:"Process this record one"
        },
        {
            fn : $scope.doAlert,
            args : ['Processing this record two',true],
            listing: false,
            creating: false,
            editing: true,
            text:"Process this record two"
        },
        {
            fn : $scope.doAlert,
            args : ['Big process',false],
            listing: true,
            creating: false,
            editing: false,
            text:"Run some file wide process"
        }
    ];

}]);
