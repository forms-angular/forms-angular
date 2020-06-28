/// <reference path="../../index.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function BaseCtrl($scope: fng.IFormScope, $rootScope, $location, $filter, $uibModal, fngModelCtrlService, routingService, formGenerator, recordHandler) {

    $scope.sharedData = {
      record: {},
      disableFunctions: {},
      dataEventFunctions: {},
      modelControllers: []
    };

    let ctrlState = {
      master: {},
      fngInvalidRequired: 'fng-invalid-required',
      allowLocationChange: true   // Set when the data arrives..
    };

    $scope.errorVisible = false;
    angular.extend($scope, routingService.parsePathFunc()($location.$$path));

    // Load context menu.  For /person/client/:id/edit we need
    // to load PersonCtrl and PersonClientCtrl
    let titleCaseModelName = $filter('titleCase')($scope.modelName, true);
    let needDivider = false;
    fngModelCtrlService.loadControllerAndMenu($scope.sharedData, titleCaseModelName, 0, needDivider, $scope.$new());
    if ($scope.formName) {
      fngModelCtrlService.loadControllerAndMenu($scope.sharedData, titleCaseModelName + $filter('titleCase')($scope.formName, true), 1, needDivider, $scope.$new());
    }

    $rootScope.$broadcast('fngControllersLoaded', $scope.sharedData, $scope.modelName);

    $scope.modelNameDisplay = $scope.sharedData.modelNameDisplay || $filter('titleCase')($scope.modelName);

    $rootScope.$broadcast('fngFormLoadStart', $scope);

    formGenerator.decorateScope($scope, formGenerator, recordHandler, $scope.sharedData);
    recordHandler.decorateScope($scope, $uibModal, recordHandler, ctrlState);

    function processTheForm() {
      recordHandler.fillFormWithBackendSchema($scope, formGenerator, recordHandler, ctrlState);

      // Tell the 'model controllers' that they can start fiddling with basescope
      for (let i = 0; i < $scope.sharedData.modelControllers.length; i++) {
        if ($scope.sharedData.modelControllers[i].onBaseCtrlReady) {
          $scope.sharedData.modelControllers[i].onBaseCtrlReady($scope);
        }
      }

      $scope.$on('$destroy', () => {
        $scope.sharedData.modelControllers.forEach((value) => value.$destroy());
        $rootScope.$broadcast('fngControllersUnloaded');
      });
    }

//Check that we are ready
    if (typeof formsAngular.beforeProcess === "function") {
      formsAngular.beforeProcess($scope, function (err) {
        if (err) {
          $scope.showError(err.message, 'Error preparing to process form');
        } else {
          processTheForm();
        }
      });
    } else {
      processTheForm();
    }
  }
}
