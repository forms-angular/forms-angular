formsAngular.controller('AnalysisCtrl', ['$locationParse', '$scope', '$http', '$location', '$routeParams', function ($locationParse, $scope, $http, $location, $routeParams) {
    var debug = false;

    angular.extend($scope, $routeParams);
    $scope.reportSchema = {};
    $scope.gridOptions = {columnDefs : 'reportSchema.columnDefs', data: 'report'};
    $scope.report = [];

    if (!$scope.reportSchemaName && $routeParams.r) {
        switch ($routeParams.r.slice(0, 1)) {
            case '[' :
                $scope.reportSchema.pipeline = JSON.parse($routeParams.r);
                break;
            case '{' :
                angular.extend($scope.reportSchema, JSON.parse($routeParams.r));
                break;
            default :
                throw new Error("No report instructions specified");
        }
    }

    var apiCall = '/api/report/' + $scope.model;
    if ($scope.reportSchemaName) {
        apiCall += '/'+$scope.reportSchemaName
    } else {
        apiCall += '?r=' + JSON.stringify($scope.reportSchema);
    }

    $http.get(apiCall).success(function (data) {
        $scope.report = data.report;
        $scope.reportSchema = data.schema;
        $scope.reportSchema.title = $scope.reportSchema.title || $scope.model;
    }).error(function () {
            $location.path("/404");
         });

}]);


