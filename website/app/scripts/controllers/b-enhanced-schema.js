'use strict';

websiteApp.controller('BEnhancedSchemaCtrl', ['$scope', function ($scope) {

  $scope.$parent.onSchemaProcessed = function(description, schema) {
    console.log('Processed', description);
  };

  $scope.record = $scope.sharedData.record;

  $scope.sharedData.dropDownDisplay = 'Custom Dropdown';

  $scope.doAlert = function (message, showId) {
    var alertMessage = message;
    if (showId) {
      alertMessage += '\nThe id is ' + $scope.record._id;
    }
    alert(alertMessage);
  };

  $scope.changeCase = function () {

    function changeCaseInt(newCase) {
      for (var property in $scope.record) {
        if (property !== '_id' && typeof $scope.record[property] === 'string') {
          if (newCase === 'lower') {
            $scope.record[property] = $scope.record[property].toLowerCase();
          } else {
            $scope.record[property] = $scope.record[property].toUpperCase();
          }
        }
      }
    }

    if ($scope.record.surname === $scope.record.surname.toLowerCase()) {
      changeCaseInt('upper');
    } else {
      changeCaseInt('lower');
    }
  };

  $scope.contextMenu = [
    {
      fn: $scope.doAlert,
      args: ['Reading the data', true],
      listing: false,
      creating: false,
      editing: true,
      text: 'Demonstrate reading the data'
    },
    {
      fn: $scope.changeCase,
      listing: false,
      creating: false,
      editing: true,
      text: 'Demonstrate modifying the data'
    },
    {
      fn: $scope.doAlert,
      args: ['Big process', false],
      listing: true,
      creating: false,
      editing: false,
      text: 'Run some file wide process'
    }
  ];

  function setColour(on) {
    var colour = on?'lightgreen':'lightpink';
    angular.element(document.querySelector('#cg_f_accepted')).css('background-color', colour);
  }

  $scope.onAllReady = function () {
    var accepted = angular.element(document.querySelector('#f_accepted'));
    accepted.on('change', function () {
      setColour($scope.record.accepted);
    });
    if (typeof $scope.record.accepted !== 'undefined') {
      setColour($scope.record.accepted);
    }

  };
}]);
