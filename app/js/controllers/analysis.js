formsAngular.controller('AnalysisCtrl', ['$locationParse', '$filter', '$scope', '$http', '$location', '$routeParams', function ($locationParse, $filter, $scope, $http, $location, $routeParams) {
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

    $scope.refreshQuery = function() {

        var apiCall = '/api/report/' + $scope.model
            ,connector;
        if ($scope.reportSchemaName) {
            apiCall += '/'+$scope.reportSchemaName
            connector = '?'
        } else {
            apiCall += '?r=' + JSON.stringify($scope.reportSchema);
            connector = '&'
        }

        if ($scope.paramSchema) {
            // we are using the params form
            for (var paramVal in $scope.record) {
                var instructions = $scope.reportSchema.params[paramVal];
                if ($scope.record[paramVal] && $scope.record[paramVal] !== "") {
                    $scope.param = $scope.record[paramVal];
                    if (instructions.conversionExpression) {
                        $scope.param = $scope.$eval(instructions.conversionExpression);
                    }
                    apiCall += connector + paramVal + '=' + $scope.param;
                    connector = '&';
                } else if (instructions.required) {
                    // Don't do a round trip if a required field is empty - it will show up red
                    return;
                }
            }
        } else {
            // take params of the URL
            var query = $location.$$url.match(/\?.*/);
            if (query) {
                apiCall += connector + query[0].slice(1)
            }
        }

        $http.get(apiCall).success(function (data) {
            if (data.success) {
                $scope.report = data.report;
                $scope.reportSchema = data.schema;
                $scope.reportSchema.title = $scope.reportSchema.title || $scope.model;
                // set up parameters if this is the first time through
                if (!$scope.paramSchema && data.schema.params) {
                    $scope.paramSchema = [];
                    $scope.record = {};
                    for (var param in data.schema.params) {
                        var thisPart = data.schema.params[param];
                        var newLen = $scope.paramSchema.push({
                            name: param,
                            id: 'fp_'+param,
                            label: thisPart.label || $filter('titleCase')(param),
                            type : thisPart.type || 'text',
                            required: true,
                            size: thisPart.size || 'small'
                        });
                        if (thisPart.type === 'select') {
                            // TODO: Remove when select and select2 is modified during the restructure
                            $scope[param + '_Opts'] = thisPart.enum;
                            $scope.paramSchema[newLen-1].options = param + '_Opts';
                        }
                        $scope.record[param] = thisPart.value;
                    }
                    $scope.$watch('record', function (newValue, oldValue) {
                        if (oldValue !== newValue) {
                            $scope.refreshQuery();
                        }
                    },true);

                }
            } else {
                console.log(JSON.stringify(data));
                $scope.reportSchema.title = "Error - see console log";
            }
        }).error(function (err) {
                console.log(JSON.stringify(err));
                $location.path("/404");
             });
    }

    $scope.refreshQuery();

}]);


