myDemoApp.controller('BUsingOptionsCtrl',['$scope', '$data', '$timeout', function($scope, $data, $timeout) {

    var initialisedEyeColorEvents = false;

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

    var colours = ['#81B7DB','#C2A369','#6DDB4F','#47820C'];

    function setColour(number) {
        if (number != "") {
            $('#cg_f_eyeColour').css('background-color', colours[parseInt(number)]);
        } else {
            $('#cg_f_eyeColour').css('background-color', 'white');
        }
    };

    $scope.$on('formInputDone', function() {
        if (!initialisedEyeColorEvents) {
            var eyeColor = $('#f_eyeColour');
            if (eyeColor.length > 0) {
                initialisedEyeColorEvents = true;
                eyeColor.on("change", function(e) {
                    console.log("change "+JSON.stringify({val:e.val, added:e.added, removed:e.removed}));
                    setColour(e.val);
                });
                $timeout(function(){
                    setColour(eyeColor.select2("val"))
                });
            }
        }
    })
}]);
