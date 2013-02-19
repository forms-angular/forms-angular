'use strict';

/* App Module */

var services = ['ui','formsAngular.form'];

var myApp = angular.module('myApp', services).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/index', {templateUrl: 'partials/howto.html'} ).
            when('/404', {templateUrl: 'partials/404.html'} ).
            when('/:model/:id/edit', {templateUrl: 'partials/base-edit.html', controller: BaseCtrl}).
            when('/:model/new', {templateUrl: 'partials/base-edit.html', controller: BaseCtrl}).
            when('/:model', {templateUrl: 'partials/base-list.html', controller: BaseCtrl}).
            otherwise({redirectTo: '/index'});
    }]);

angular.module('myModule', ['ui']);

myApp.value('ui.config', {
    date: {
        dateFormat: 'dd/mm/yy'
    }
});
