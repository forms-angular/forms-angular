/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../fng-types.ts" />

module fng.controllers {

  /*@ngInject*/
  export function BaseCtrl($scope: fng.IFormScope, $rootScope, $location, $filter, $uibModal,
                           $data, routingService, formGenerator, recordHandler) {

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
    recordHandler.decorateScope($scope, $uibModal, recordHandler, ctrlState);

    recordHandler.fillFormWithBackendSchema($scope, formGenerator, recordHandler, ctrlState);

    // Tell the 'model controllers' that they can start fiddling with basescope
    for (var i = 0; i < sharedStuff.modelControllers.length; i++) {
      if (sharedStuff.modelControllers[i].onBaseCtrlReady) {
        sharedStuff.modelControllers[i].onBaseCtrlReady($scope);
      }
    }
  }
}
