'use strict';

formsAngular.controller('BaseCtrl', [
    '$scope', '$location', '$filter', '$modal', '$window',
    '$data', 'SchemasService', 'routingService', 'formGenerator', 'recordHandler',
    function ($scope, $location, $filter, $modal, $window,
              $data, SchemasService, routingService, formGenerator, recordHandler) {

        var sharedStuff = $data;

        var ctrlState = {
            master: {},
            fngInvalidRequired: 'fng-invalid-required',
            allowLocationChange: true   // Set when the data arrives..
        };

        angular.extend($scope, routingService.parsePathFunc()($location.$$path));

        $scope.modelNameDisplay = sharedStuff.modelNameDisplay || $filter('titleCase')($scope.modelName);

        formGenerator.decorateScope($scope, formGenerator, recordHandler, sharedStuff);
        recordHandler.decorateScope($scope, $modal, recordHandler, ctrlState);

        recordHandler.fillForm($scope, formGenerator, recordHandler, ctrlState, recordHandler.handleError($scope));

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