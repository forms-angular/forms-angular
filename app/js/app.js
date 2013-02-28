'use strict';

/* App Module */

var services = ['ui','formsAngular.form'];

var myApp = angular.module('myApp', services).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/index', {templateUrl: 'partials/howto.html'} ).
            when('/404', {templateUrl: 'partials/404.html'} ).
            when('/z_custom_form/new', {templateUrl: 'partials/custom-new.html', controller: BaseCtrl}).   // example view override
            when('/z_custom_form/:id/edit', {templateUrl: 'partials/custom-edit.html', controller: BaseCtrl}).   // example view override
            when('/z_custom_form/:form/new', {templateUrl: 'partials/custom-new.html', controller: BaseCtrl}).   // example view override
            when('/z_custom_form/:form/:id/edit', {templateUrl: 'partials/custom-edit.html', controller: BaseCtrl}).   // example view override
            when('/:model/:id/edit', {templateUrl: 'partials/base-edit.html', controller: BaseCtrl}).
            when('/:model/new', {templateUrl: 'partials/base-edit.html', controller: BaseCtrl}).
            when('/:model', {templateUrl: 'partials/base-list.html', controller: BaseCtrl}).
            when('/:model/:form/:id/edit', {templateUrl: 'partials/base-edit.html', controller: BaseCtrl}).
            when('/:model/:form/new', {templateUrl: 'partials/base-edit.html', controller: BaseCtrl}).
            when('/:model/:form', {templateUrl: 'partials/base-list.html', controller: BaseCtrl}).
            otherwise({redirectTo: '/index'});
    }]);

angular.module('myModule', ['ui']);

myApp.value('ui.config', {
    date: {
        dateFormat: 'dd/mm/yy'
    }
});
