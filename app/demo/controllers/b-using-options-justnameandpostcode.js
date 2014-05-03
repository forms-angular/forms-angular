'use strict';

var demo = angular.module('myDemoApp');

demo.controller( 'BUsingOptionsJustnameandpostcodeCtrl',
[
    '$scope', '$data', '$timeout', 'RecordService'
,
function($scope, $data, $timeout, RecordService) {

    $scope.record = RecordService.get(); //$data.record;
    $data.modelNameDisplay = "Another override";
    $data.dropDownDisplay = 'Custom 2nd Level';

    $scope.contextMenu = [
        {
            fn : $scope.doAlert,
            args : ['Reading the data 2',true],
            listing: false,
            creating: false,
            editing: true,
            text:"Demonstrate reading the data 2"
        }
    ];

}]);
