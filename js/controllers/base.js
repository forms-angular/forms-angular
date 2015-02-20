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

        // Invalid field styling for BS3 - only works for one level of nesting
        $scope.hasError = function(name, index) {
          var form = $scope[$scope.topLevelFormName];
          var field;
          if (typeof index === 'undefined') {
            field = form['f_' + name.replace(/\./g,'_')];
          } else {
            var parts = name.split('.');
            form = form['form_' + parts[0] + index];
            field = form[name.replace(/\./g,'-')];
          }
          if (field && field.$invalid) {
            return true
          }
        };

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
