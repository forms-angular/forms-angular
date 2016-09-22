/// <reference path="../../typings/globals/angular/index.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function SaveChangesModalCtrl($scope, $uibModalInstance) {
    $scope.yes = function () {
      $uibModalInstance.close(true);
    };
    $scope.no = function () {
      $uibModalInstance.close(false);
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
}
