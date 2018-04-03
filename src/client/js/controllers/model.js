/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
var fng;
(function (fng) {
    var controllers;
    (function (controllers) {
        /*@ngInject*/
        function ModelCtrl($scope, $http, $location, routingService) {
            $scope.models = [];
            $http.get('/api/models').then(function (response) {
                $scope.models = response.data;
            }, function () {
                $location.path('/404');
            });
            $scope.newUrl = function (model) {
                return routingService.buildUrl(model + '/new');
            };
            $scope.listUrl = function (model) {
                return routingService.buildUrl(model);
            };
        }
        controllers.ModelCtrl = ModelCtrl;
    })(controllers = fng.controllers || (fng.controllers = {}));
})(fng || (fng = {}));
//# sourceMappingURL=model.js.map