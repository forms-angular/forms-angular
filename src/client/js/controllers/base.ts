/// <reference path="../../index.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function BaseCtrl(
    $scope: fng.IFormScope,
    $rootScope: angular.IRootScopeService,
    $location: angular.ILocaleService,
    $filter,
    $uibModal/*: angular.ui.bootstrap.IModalService  <this is the correct type, but not available*/,
    SubmissionsService: fng.ISubmissionsService,
    FngModelCtrlService: fng.IModelCtrlService,
    RoutingService: fng.IRoutingService,
    FormGeneratorService: fng.IFormGeneratorService,
    RecordHandlerService: fng.IRecordHandlerService
  ) {
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
    angular.extend($scope, RoutingService.parsePathFunc()(($location as any).$$path));

    // Load context menu.  For /person/client/:id/edit we need
    // to load PersonCtrl and PersonClientCtrl
    let titleCaseModelName = $filter('titleCase')($scope.modelName, true);
    let needDivider = false;
    FngModelCtrlService.loadControllerAndMenu($scope.sharedData, titleCaseModelName, 0, needDivider, $scope.$new());
    if ($scope.formName) {
      FngModelCtrlService.loadControllerAndMenu($scope.sharedData, titleCaseModelName + $filter('titleCase')($scope.formName, true), 1, needDivider, $scope.$new());
    }

    $rootScope.$broadcast('fngControllersLoaded', $scope.sharedData, $scope.modelName);

    $scope.modelNameDisplay = $scope.sharedData.modelNameDisplay || $filter('titleCase')($scope.modelName);

    $rootScope.$broadcast('fngFormLoadStart', $scope);

    FormGeneratorService.decorateScope($scope, FormGeneratorService, RecordHandlerService, $scope.sharedData);
    RecordHandlerService.decorateScope($scope, $uibModal, RecordHandlerService, ctrlState);

    function processTheForm() {
      if ($scope.id) {
        $scope.readingRecord = SubmissionsService.readRecord($scope.modelName, $scope.id, $scope.formName);
      }
      RecordHandlerService.fillFormWithBackendSchema($scope, FormGeneratorService, RecordHandlerService, ctrlState);

      // Tell the 'model controllers' that they can start fiddling with baseScope
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
