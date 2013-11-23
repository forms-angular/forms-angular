var myApp = angular.module('myApp', ['formsAngular']);

myApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/index', {templateUrl: 'partials/index.html'} ).
        when('/analyse/:model/:reportSchemaName', {templateUrl: 'partials/base-analysis.html'}).
        when('/analyse/:model', {templateUrl: 'partials/base-analysis.html'}).
        when('/:model/:id/edit', {templateUrl: 'partials/base-edit.html'}).
        when('/:model/new', {templateUrl: 'partials/base-edit.html'}).
        when('/:model', {templateUrl: 'partials/base-list.html'}).
        when('/:model/:form/:id/edit', {templateUrl: 'partials/base-edit.html'}).  // non default form (different fields etc)
        when('/:model/:form/new', {templateUrl: 'partials/base-edit.html'}).       // non default form (different fields etc)
        when('/:model/:form', {templateUrl: 'partials/base-list.html'}).           // list page with links to non default form
// The next block shows how to use custom forms for a given model rather than the generic form provided
//        when('/custom_form_model/new', {templateUrl: 'partials/custom-new.html'}).
//        when('/custom_form_model/:id/edit', {templateUrl: 'partials/custom-edit.html'}).
//        when('/custom_form_model/:form/new', {templateUrl: 'partials/custom-new.html'}).
//        when('/custom_form_model/:form/:id/edit', {templateUrl: 'partials/custom-edit.html'}).

        otherwise({redirectTo: '/index'});
}]);
