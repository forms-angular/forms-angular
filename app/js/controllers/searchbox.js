formsAngular.controller('SearchCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.results = [];
    $scope.moreCount = 0;

    var clearSearchResults = function() {
        $scope.errorClass = "";
        $scope.results = [];
    };

    $scope.$watch('searchTarget', function(newValue) {
        if (newValue && newValue.length > 0) {
            $http.get('api/search?q=' + newValue).success(function (data) {
                if ($scope.searchTarget.length > 0) {
                    $scope.results = data.results;
                    $scope.moreCount = data.moreCount;
                    $scope.errorClass = $scope.results.length === 0 ? "error" : "";
                } else {
                    clearSearchResults();
                }
            }).error(function (data, status) {
                console.log("Error in searchbox.js : " + data + ' (status=' + status + ')');
            });
        } else {
            clearSearchResults();
        }
    },true);

    $scope.$on("$routeChangeStart", function () {
        $scope.searchTarget = '';
    });

}]);
