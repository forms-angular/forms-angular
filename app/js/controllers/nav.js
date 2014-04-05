'use strict';

formsAngular.controller('NavCtrl', ['$scope', '$data', '$location', '$filter', '$locationParse', '$controller', 'urlService', function ($scope, $data, $location, $filter, $locationParse, $controller, urlService) {

    $scope.items = [];

    $scope.globalShortcuts = function(event) {
        if (event.keyCode === 191 && event.ctrlKey) {
            // Ctrl+/ takes you to global search
            var searchInput = angular.element.find('input')[0];
            if (searchInput && angular.element(searchInput).attr('id') === 'searchinput') {
                // check that global search directive is in use
                angular.element(searchInput).focus();
                event.preventDefault();
            }
        }
    };

    function loadControllerAndMenu(controllerName, level) {
        var locals = {}, addThis;

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
                angular.forEach(locals.$scope.contextMenu, function (value) {
                    if (value[addThis]) {
                        $scope.items.push(value);
                    }
                })
            }
        }
        catch (error) {
            if (/is not a function, got undefined/.test(error.message)) {
                // No such controller - don't care
            } else {
                console.log("Unable to instantiate " + controllerName + " - " + error.message);
            }
        }
    }

    $scope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {

        $scope.routing = $locationParse($location.$$path);

        $scope.items = [];

        if ($scope.routing.analyse) {
            $scope.contextMenu = 'Report';
            $scope.items = [
                {
                    broadcast: 'exportToPDF',
                    text: "PDF"
                },
                {
                    broadcast: 'exportToCSV',
                    text: "CSV"
                }
            ]
        } else if ($scope.routing.modelName) {

            angular.forEach($scope.scopes, function (value, key) {
                value.$destroy();
            });
            $scope.scopes = [];
            $data.record = {};
            $data.disableFunctions = {};
            $data.dataEventFunctions = {};
            delete $data.dropDownDisplay;
            delete $data.modelNameDisplay;
            // Now load context menu.  For /person/client/:id/edit we need
            // to load PersonCtrl and PersonClientCtrl
            var modelName = $filter('titleCase')($scope.routing.modelName, true);
            loadControllerAndMenu(modelName, 0);
            if ($scope.routing.formName) {
                loadControllerAndMenu(modelName + $filter('titleCase')($scope.routing.formName, true), 1);
            }
            $scope.contextMenu = $data.dropDownDisplay || $data.modelNameDisplay || $filter('titleCase')($scope.routing.modelName, false);
        }
    });

    $scope.doClick = function (index) {
        if ($scope.items[index].broadcast) {
            $scope.$broadcast($scope.items[index].broadcast)
        } else {
            // Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
            var args = $scope.items[index].args || [],
                fn = $scope.items[index].fn;
            switch (args.length) {
                case  0:
                    fn();
                    break;
                case  1:
                    fn(args[0]);
                    break;
                case  2:
                    fn(args[0], args[1]);
                    break;
                case  3:
                    fn(args[0], args[1], args[2]);
                    break;
                case  4:
                    fn(args[0], args[1], args[2], args[3]);
                    break;
            }
        }
    };

    $scope.isHidden = function (index) {
        return $scope.items[index].isHidden ? $scope.items[index].isHidden() : false;
    };

    $scope.buildUrl = function(path) {
        return urlService.buildUrl(path);
    }

}]);
