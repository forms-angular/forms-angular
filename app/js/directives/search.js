formsAngular.controller('SearchCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {

    $scope.results = [];
    $scope.moreCount = 0;
    $scope.focus = null;

    $scope.handleKey = function(event) {
        console.log(event);
        switch(event.keyCode) {
            case 38:
//                if ($scope.focus && $scope.focus < $scope.results
//                $event.preventDefault();
                break;
            case 40:
                break;
            case 13:
                break;
        }
    };

    $scope.setFocus = function(index) {
        if ($scope.focus) delete data.results[$scope.focus].focussed;
        $scope.results[index].focussed = true;
        $scope.focus = index;
    };

    $scope.selectResult = function(resultNo) {
        var result = $scope.results[resultNo];
        $location.path('/' + result.resource + '/' + result.id + '/edit');
    };

    $scope.resultClass = function(index) {
        var resultClass = 'search-result';
        if ($scope.results && $scope.results[index].focussed) resultClass += ' focus';
        return resultClass;
    };

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
                    if (data.results.length > 0) {
                        $scope.errorClass = '';
                        $scope.setFocus(0);
                    } else {

                    }
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

}])
.directive('globalSearch', [function () {
        return {
            restrict: 'AE',
            template:   '<form class="navbar-search pull-right">'+
                        '    <div id="search-cg" class="control-group" ng-class="errorClass">'+
                        '        <input type="text" ng-model="searchTarget" class="search-query" placeholder="Search" ng-keyup="handleKey($event)">'+
                        '    </div>'+
                        '</form>'+
                        '<div class="results-container" ng-show="results.length >= 1">'+
                        '    <div class="search-results">'+
                        '        <div ng-repeat="result in results">'+
                        '            <span ng-class="resultClass($index)" ng-click="selectResult($index)">{{result.resourceText}} {{result.text}}</span>'+
                        '        </div>'+
                        '    <div ng-show="moreCount > 0">(plus more - continue typing to narrow down search...)</div>'+
                        '</div>',
            controller: 'SearchCtrl'
            }
        }
]);
