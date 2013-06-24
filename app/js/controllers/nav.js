'use strict';

formsAngular.controller('NavCtrl',['$scope', '$location', '$filter', '$locationParse', '$controller', function($scope, $location, $filter, $locationParse, $controller) {

    $scope.items = [];

    function loadMenu(controllerName, level) {
        var locals={}, addThis;

        controllerName += 'Ctrl';
        locals.$scope = $scope.scopes[level] = $scope.$new();
        try {
            $controller(controllerName, locals);
            if ($scope.routing.newRecord) {
                addThis = "creating";
            } else if ($scope.routing.id) {
                addThis = "editing";
            } else {
                addThis = "listing";
            }
            angular.forEach($scope.scopes[level].contextMenu, function(value) {
                if (value[addThis]) {
                    $scope.items.push(value);
                }
            })
        }
        catch(error) {
            // No such controller
        }
    }

    $scope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {

        $scope.routing = $locationParse($location.$$path);

        $scope.items = [];

        if ($scope.routing.modelName) {

            angular.forEach($scope.scopes, function(value, key){
                value.$destroy();
            });
            $scope.scopes = [];
            // Now load context menu.  For /person/client/:id/edit we need
            // to load PersonCtrl and PersonClientCtrl
            $scope.contextMenu = $filter('titleCase')($scope.routing.modelName, true);
            loadMenu($scope.contextMenu,0);
            if ($scope.routing.formName) {
                loadMenu($scope.contextMenu + $filter('titleCase')($scope.routing.formName, true),1);
            }
        }
    });

    $scope.doClick = function(index) {
        // Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
        var args = $scope.items[index].args,
            fn = $scope.items[index].fn;
        switch (args.length) {
            case  0:
                return fn();
            case  1:
                return fn(args[0]);
            case  2:
                return fn(args[0], args[1]);
            case  3:
                return fn(args[0], args[1], args[2]);
            case  4:
                return fn(args[0], args[1], args[2], args[3]);
        }
    }
}]);
