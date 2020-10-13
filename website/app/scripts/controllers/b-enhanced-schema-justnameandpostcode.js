'use strict';
websiteApp.controller('BEnhancedSchemaJustnameandpostcodeCtrl', ['$scope', '$q', function ($scope, $q) {

  $scope.record = $scope.sharedData.record;


  $scope.sharedData.modelNameDisplay = 'Another override';
  $scope.sharedData.dropDownDisplay = 'Custom 2nd Level';

  /* Alternatively you could do something async with $q type promise... */
  $scope.sharedData.modelNameDisplayPromise = $q((resolve) => {
    setTimeout(() => {
      resolve('Promise Surprise!!');
    }, 1000);
  });
  $scope.sharedData.dropDownDisplayPromise = $q((resolve) => {
    setTimeout(() => {
      console.log('resolving dropdown display promise');
      resolve('Dropdown Surprise!!');
    }, 1000);
  });

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
