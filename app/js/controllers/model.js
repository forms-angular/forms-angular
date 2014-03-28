formsAngular.controller('ModelCtrl', [ '$scope', '$http', '$location', function ($scope, $http, $location) {

    $scope.models = [];
    $http.get('/api/models').success(function (data) {
        $scope.models = data;
    }).error(function () {
            $location.path("/404");
    });

}]);
