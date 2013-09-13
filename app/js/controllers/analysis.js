formsAngular.controller('AnalysisCtrl', ['$locationParse', '$scope', '$http', '$location', '$routeParams', function ($locationParse, $scope, $http, $location, $routeParams) {
    var debug = false;

    angular.extend($scope, $locationParse($location.$$path));

    $scope.options = {title: $scope.modelName};
    $scope.gridOptions = {columnDefs : 'options.columnDefs', data: 'report'};
    $scope.report = [];

    $scope.runReport = function() {
        $http.get('/api/' + $scope.modelName + '?p=' + JSON.stringify($scope.options.pipeline)).success(function (data) {
            $scope.report = data;
        }).error(function () {
                $location.path("/404");
            });
    };

    if ($routeParams.r) {
        switch ($routeParams.r.slice(0, 1)) {
            case '[' :
                $scope.options.pipeline = JSON.parse($routeParams.r);
                $scope.runReport();
                break;
            case '{' :
//this needs to be abgular.extend or whatever works down below
                angular.extend($scope.options, JSON.parse($routeParams.r));
                $scope.runReport();
                break;
            default :
                $http.get('/api/report-schema/' + $scope.modelName + '/' + $routeParams.r).success(function (data) {
                    angular.extend($scope.options, data);
                    $scope.runReport();
                }).error(function () {
                        $location.path("/404");
                    });
        }
    } else {
        throw new Error("No report instructions specified");
    }

}]);


