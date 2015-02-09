'use strict';

formsAngular.controller('BaseCtrl', [
    '$scope', '$rootScope', '$location', '$filter', '$modal', '$window',
    '$data', 'SchemasService', 'routingService', 'formGenerator', 'recordHandler',
    function ($scope, $rootScope, $location, $filter, $modal, $window,
              $data, SchemasService, routingService, formGenerator, recordHandler) {

        var sharedStuff = $data;
        var ctrlState = {
            master: {},
            fngInvalidRequired: 'fng-invalid-required',
            allowLocationChange: true   // Set when the data arrives..
        };

        angular.extend($scope, routingService.parsePathFunc()($location.$$path));

        $scope.modelNameDisplay = sharedStuff.modelNameDisplay || $filter('titleCase')($scope.modelName);

        $rootScope.$broadcast('fngFormLoadStart', $scope);

        formGenerator.decorateScope($scope, formGenerator, recordHandler, sharedStuff);
        recordHandler.decorateScope($scope, $modal, recordHandler, ctrlState);

        recordHandler.fillFormWithBackendSchema($scope, formGenerator, recordHandler, ctrlState, recordHandler.handleError($scope));

        // Tell the 'model controllers' that they can start fiddling with basescope
        for (var i = 0 ; i < sharedStuff.modelControllers.length ; i++) {
          if (sharedStuff.modelControllers[i].onBaseCtrlReady) {
            sharedStuff.modelControllers[i].onBaseCtrlReady($scope);
          }
        }
    }
])
.controller('SaveChangesModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.yes = function () {
    $modalInstance.close(true);
  };
  $scope.no = function () {
    $modalInstance.close(false);
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
