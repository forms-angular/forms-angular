var myApp = angular.module('myApp', ['formsAngular']);

myApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/index', {templateUrl: 'partials/index.html'} ).
        when('/:model/:id/edit', {templateUrl: 'partials/base-edit.html'}).
        when('/:model/new', {templateUrl: 'partials/base-edit.html'}).
        when('/:model', {templateUrl: 'partials/base-list.html'}).
        otherwise({redirectTo: '/index'});
}]);
