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
            if (angular.isObject(locals.$scope.contextMenu)) {
                angular.forEach(locals.$scope.contextMenu, function(value) {
                    if (value[addThis]) {
                        $scope.items.push(value);
                    }
                })
            }
        }
        catch(error) {
            if (/is not a function, got undefined/.test(error.message )) {
                // No such controller - don't care
            } else {
                console.log("Unable to instantiate "+controllerName + " - " + error.message);
            }
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
        var args = $scope.items[index].args || [],
            fn = $scope.items[index].fn,
            result;
        switch (args.length) {
            case  0:
                result = fn();
                break;
            case  1:
                result =  fn(args[0]);
                break;
            case  2:
                result =  fn(args[0], args[1]);
                break;
            case  3:
                result =  fn(args[0], args[1], args[2]);
                break;
            case  4:
                result =  fn(args[0], args[1], args[2], args[3]);
                break;
        }
    }
}]);
