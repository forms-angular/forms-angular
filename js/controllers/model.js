'use strict';

formsAngular.controller('ModelCtrl', [ '$scope', '$http', '$location', 'urlService', function ($scope, $http, $location, urlService) {

  $scope.models = [];
  $http.get('/api/models').success(function (data) {
    $scope.models = data;
  }).error(function () {
    $location.path('/404');
  });

  $scope.newUrl = function (model) {
    return urlService.buildUrl(model + '/new');
  };

  $scope.listUrl = function (model) {
    return urlService.buildUrl(model);
  };

}]);
