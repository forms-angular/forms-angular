/* global formsAngular: false */
'use strict';

var fang = angular.module('formsAngular');


fang.provider( 'formRoutes',
[
    '$routeProvider'
,
function ($routeProvider) {
    return {
        setRoutes : function (appRoutes, defaultRoute) {
            // Set up the application specific routes
            for (var i = 0 ; i < appRoutes.length ; i++) {
                $routeProvider.when(appRoutes[i].route, appRoutes[i].options);
            }

            // Set up the forms-angular routes
            $routeProvider.
                when('/analyse/:model/:reportSchemaName', {templateUrl: 'partials/base-analysis.html'}).
                when('/analyse/:model', {templateUrl: 'partials/base-analysis.html'}).
                when('/model/:model/:id/edit', {templateUrl: 'partials/base-edit.html'}).
                when('/model/:model/new', {templateUrl: 'partials/base-edit.html'}).
                when('/model/:model', {templateUrl: 'partials/base-list.html'}).
                when('/model/:model/:form/:id/edit', {templateUrl: 'partials/base-edit.html'}).  // non default form (different fields etc)
                when('/model/:model/:form/new', {templateUrl: 'partials/base-edit.html'}).       // non default form (different fields etc)
                when('/model/:model/:form', {templateUrl: 'partials/base-list.html'}).           // list page with links to non default form
                otherwise({redirectTo: defaultRoute});
        },
        $get : function() {
            return null;
        }
    };
}]);
