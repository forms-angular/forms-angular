/// <reference path="../../typings/angularjs/angular.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function ModelCtrl($scope, $http, $location, routingService) {

    $scope.models = [];
    $http.get('/api/models').success(function (data) {
      $scope.models = data;
    }).error(function () {
      $location.path('/404');
    });

    $scope.newUrl = function (model) {
      return routingService.buildUrl(model + '/new');
    };

    $scope.listUrl = function (model) {
      return routingService.buildUrl(model);
    };

  }
}
