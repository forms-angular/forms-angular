'use strict';
websiteApp.controller('BEnhancedSchemaJustnameandpostcodeCtrl', ['$scope', function ($scope) {

  $scope.record = $scope.sharedData.record;

  $scope.sharedData.modelNameDisplay = 'Another override';
  $scope.sharedData.dropDownDisplay = 'Custom 2nd Level';


  $scope.contextMenu = [
    {
      divider: true      // Add a divider to your drop down menu
    },
    {
      fn: $scope.doAlert,
      args: ['Reading the data 2', true],
      listing: false,
      creating: false,
      editing: true,
      text: 'Demonstrate reading the data 2'
    }
  ];

}]);
