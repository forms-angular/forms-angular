myDemoApp.controller('GConditionalFields',['$scope', '$data', function($scope, $data) {

    alert("Loading");

    // This function massage a report parameter from the enumerated value that is captured into
    // a one letter string
    $scope.shortenSex = function (value, record, reportSchema) {
        return value[0];
    }
    // Sorry about the name.
    // Nothing to do with children coming unannounced through the bedroom door

}]);
