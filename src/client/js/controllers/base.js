/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
/// <reference path="../fng-types.d.ts" />
var fng;
(function (fng) {
    var controllers;
    (function (controllers) {
        /*@ngInject*/
        function BaseCtrl($scope, $rootScope, $location, $filter, $uibModal, fngModelCtrlService, routingService, formGenerator, recordHandler) {
            $scope.sharedData = {
                record: {},
                disableFunctions: {},
                dataEventFunctions: {},
                modelControllers: []
            };
            var ctrlState = {
                master: {},
                fngInvalidRequired: 'fng-invalid-required',
                allowLocationChange: true // Set when the data arrives..
            };
            angular.extend($scope, routingService.parsePathFunc()($location.$$path));
            // Load context menu.  For /person/client/:id/edit we need
            // to load PersonCtrl and PersonClientCtrl
            var titleCaseModelName = $filter('titleCase')($scope.modelName, true);
            var needDivider = false;
            fngModelCtrlService.loadControllerAndMenu($scope.sharedData, titleCaseModelName, 0, needDivider, $scope.$new());
            if ($scope.formName) {
                fngModelCtrlService.loadControllerAndMenu($scope.sharedData, titleCaseModelName + $filter('titleCase')($scope.formName, true), 1, needDivider, $scope.$new());
            }
            $rootScope.$broadcast('fngControllersLoaded', $scope.sharedData, $scope.modelName);
            $scope.modelNameDisplay = $scope.sharedData.modelNameDisplay || $filter('titleCase')($scope.modelName);
            $rootScope.$broadcast('fngFormLoadStart', $scope);
            formGenerator.decorateScope($scope, formGenerator, recordHandler, $scope.sharedData);
            recordHandler.decorateScope($scope, $uibModal, recordHandler, ctrlState);
            recordHandler.fillFormWithBackendSchema($scope, formGenerator, recordHandler, ctrlState);
            // Tell the 'model controllers' that they can start fiddling with basescope
            for (var i = 0; i < $scope.sharedData.modelControllers.length; i++) {
                if ($scope.sharedData.modelControllers[i].onBaseCtrlReady) {
                    $scope.sharedData.modelControllers[i].onBaseCtrlReady($scope);
                }
            }
            $scope.$on('$destroy', function () {
                $scope.sharedData.modelControllers.forEach(function (value) { return value.$destroy(); });
                $rootScope.$broadcast('fngControllersUnloaded');
            });
        }
        controllers.BaseCtrl = BaseCtrl;
    })(controllers = fng.controllers || (fng.controllers = {}));
})(fng || (fng = {}));
//# sourceMappingURL=base.js.map