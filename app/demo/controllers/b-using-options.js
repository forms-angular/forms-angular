'use strict';

var demo = angular.module('myDemoApp');

demo.controller( 'BUsingOptionsCtrl',
[
    '$scope', '$data', '$timeout', 'RecordService'
,
function($scope, $data, $timeout, RecordService) {

    $scope.record = RecordService.get();

    $data.dropDownDisplay = 'Custom Dropdown';

    $scope.doAlert = function(message, showId) {
        alertMessage = message;
        if (showId) {
            alertMessage += "\nThe id is " + $scope.record["_id"];
        }
        alert(alertMessage);
    };

    $scope.changeCase = function() {
        if ($scope.record.surname == $scope.record.surname.toLowerCase()) {
            RecordService.upperCaseify();
        } else {
            RecordService.lowerCaseify();
        }
    };

    $scope.contextMenu = [
        {
            fn : $scope.doAlert,
            args : ['Reading the data',true],
            listing: false,
            creating: false,
            editing: true,
            text:"Demonstrate reading the data"
        },
        {
            fn : $scope.changeCase,
            listing: false,
            creating: false,
            editing: true,
            text:"Demonstrate modifying the data"
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

    var setColour = function (number) {
        var colours = ['#81B7DB','#C2A369','#6DDB4F','#47820C'];
        if (number != "") {
            $('#cg_f_eyeColour').css('background-color', colours[parseInt(number)]);
        } else {
            $('#cg_f_eyeColour').css('background-color', 'white');
        }
    };

    $scope.$on('formInputDone', function() {
        var eyeColor = $('#f_eyeColour');
        eyeColor.on("change", function(e) {
            console.log("change "+JSON.stringify({val:e.val, added:e.added, removed:e.removed}));
            setColour(e.val);
        });
        $timeout(
            function(){setColour(eyeColor.select2("val"))
        },100);
    })
}]);
