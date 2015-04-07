/// <reference path="../../typings/angularjs/angular.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function SaveChangesModalCtrl($scope, $modalInstance) {
    $scope.yes = function () {
      $modalInstance.close(true);
    };
    $scope.no = function () {
      $modalInstance.close(false);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
}
