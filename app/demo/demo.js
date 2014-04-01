'use strict';

var myDemoApp = angular.module('myDemoApp', ['formsAngular']);

myDemoApp.config(['$routeProvider', function ($routeProvider) {

        $routeProvider.
            when('/index', {templateUrl: 'partials/landing-page.html'}).
            when('/get-started', {templateUrl: 'partials/get-started.html'}).
            when('/forms', {templateUrl: 'partials/forms.html'}).
            when('/schemas', {templateUrl: 'partials/schemas.html'}).
            when('/reporting', {templateUrl: 'partials/reporting.html'}).
            when('/more', {templateUrl: 'partials/more.html'}).
            when('/in-the-wild', {templateUrl: 'partials/in-the-wild.html'}).
            when('/examples', {templateUrl: 'partials/examples.html'}).
            when('/api-docs', {templateUrl: 'partials/api-docs.html'}).
            when('/404', {templateUrl: 'partials/404.html'}).
            when('/z_custom_form/new', {templateUrl: 'partials/custom-new.html'}).            // example view override
            when('/z_custom_form/:id/edit', {templateUrl: 'partials/custom-edit.html'}).      // example view override
            when('/z_custom_form/:form/new', {templateUrl: 'partials/custom-new.html'}).      // example view override with specified form content
            when('/z_custom_form/:form/:id/edit', {templateUrl: 'partials/custom-edit.html'}).// example view override with specified form content

            // This next block is the default forms angular routing.  Can't figure out how to get it to work from that module.
            when('/analyse/:model/:reportSchemaName', {templateUrl: 'partials/base-analysis.html'}).
            when('/analyse/:model', {templateUrl: 'partials/base-analysis.html'}).
            when('/:model/:id/edit', {templateUrl: 'partials/base-edit.html'}).
            when('/:model/new', {templateUrl: 'partials/base-edit.html'}).
            when('/:model', {templateUrl: 'partials/base-list.html'}).
            when('/:model/:form/:id/edit', {templateUrl: 'partials/base-edit.html'}).  // non default form (different fields etc)
            when('/:model/:form/new', {templateUrl: 'partials/base-edit.html'}).       // non default form (different fields etc)
            when('/:model/:form', {templateUrl: 'partials/base-list.html'}).           // list page with links to non default form

            otherwise({redirectTo: '/index'});
    }]
);

formsAngular.config(['urlServiceProvider',function(urlService) {
    urlService.setOptions({hashPrefix:'!'});
}]);
