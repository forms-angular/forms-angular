var searchCtrl = function ($scope, $http, $location) {

    $scope.results = [];
    $scope.moreCount = 0;

    $scope.$watch('searchTarget', function(newValue) {
        if (newValue && newValue.length > 0) {
            console.log(newValue);
            $http.get('api/search?q=' + newValue).success(function (data) {
                $scope.results = data.results;
                $scope.moreCount = data.moreCount;
                $scope.errorClass = $scope.results.length === 0 ? "error" : "";
            }).error(function () {
                console.log("an error happened");
            });
        } else {
            $scope.errorClass = "";
            $scope.results = [];
        }
    },true);

    $scope.$on("$routeChangeStart", function (event, next) {
        $scope.searchTarget = '';
    });

};
