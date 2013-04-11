var searchCtrl = function ($scope, $http, $location) {

    $scope.results = [];
    $scope.moreCount = 0;

    $scope.$watch('searchTarget', function(newValue) {
        if (newValue && newValue.length > 0) {
            console.log(newValue);
            $http.get('api/search?q=' + newValue).success(function (data) {
                console.log(data);
                $scope.results = data.results;
                $scope.moreCount = data.moreCount;
            }).error(function () {
                console.log("an error happened");
            });
        } else {
            $scope.results = [];
        }
    },true);

    $scope.$on("$routeChangeStart", function (event, next) {
        $scope.searchTarget = '';
        console.log("Here");
    });

};
