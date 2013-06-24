'use strict';

var myApp = angular.module('myApp', ['formsAngular']);

myApp.config(['$routeProvider', function($routeProvider) {

        $routeProvider.
            when('/index', {templateUrl: 'partials/models.html'} ).
            when('/404', {templateUrl: 'partials/404.html'} ).
            when('/:model/:id/edit', {templateUrl: 'partials/base-edit.html', controller: "BaseCtrl"}).
            when('/:model/new', {templateUrl: 'partials/base-edit.html', controller: "BaseCtrl"}).
            when('/:model', {templateUrl: 'partials/base-list.html', controller: "BaseCtrl"}).
            when('/:model/:form/:id/edit', {templateUrl: 'partials/base-edit.html', controller: "BaseCtrl"}).
            when('/:model/:form/new', {templateUrl: 'partials/base-edit.html', controller: "BaseCtrl"}).     
            when('/:model/:form', {templateUrl: 'partials/base-list.html', controller: "BaseCtrl"}).         
            otherwise({redirectTo: '/index'});
    }]);

myApp.value('ui.config', {
    date: {
        dateFormat: 'dd/mm/yy'
    }
});
