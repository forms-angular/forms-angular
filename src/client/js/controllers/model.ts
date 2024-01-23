/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function ModelCtrl($scope, $http: angular.IHttpService, $location: angular.ILocationService, RoutingService: fng.IRoutingService) {

    $scope.models = [];
    $http.get('/api/models').then(function (response) {
      $scope.models = response.data;
    }, function () {
      $location.search({}).path('/404');
    });

    $scope.newUrl = function (model) {
      return RoutingService.buildUrl(model + '/new');
    };

    $scope.listUrl = function (model) {
      return RoutingService.buildUrl(model);
    };

  }
}
