'use strict';

var myDemoApp = angular.module('myDemoApp', ['formsAngular']);

myDemoApp.config(['formRoutesProvider', function (formRoutes) {
  formRoutes.setRoutes([
    {route: '/index',                         options: {templateUrl: 'partials/landing-page.html'}},
    {route: '/get-started',                   options: {templateUrl: 'partials/get-started.html'}},
    {route: '/forms',                         options: {templateUrl: 'partials/forms.html'}},
    {route: '/schemas',                       options: {templateUrl: 'partials/schemas.html'}},
    {route: '/reporting',                     options: {templateUrl: 'partials/reporting.html'}},
    {route: '/more',                          options: {templateUrl: 'partials/more.html'}},
    {route: '/in-the-wild',                   options: {templateUrl: 'partials/in-the-wild.html'}},
    {route: '/examples',                      options: {templateUrl: 'partials/examples.html'}},
    {route: '/api-docs',                      options: {templateUrl: 'partials/api-docs.html'}},
    {route: '/404',                           options: {templateUrl: 'partials/404.html'}},
    {route: '/z_custom_form/new',             options: {templateUrl: 'partials/custom-new.html'}},            // example view override
    {route: '/z_custom_form/:id/edit',        options: {templateUrl: 'partials/custom-edit.html'}},      // example view override
    {route: '/z_custom_form/:form/new',       options: {templateUrl: 'partials/custom-new.html'}},      // example view override with specified form content
    {route: '/z_custom_form/:form/:id/edit',  options: {templateUrl: 'partials/custom-edit.html'}} // example view override with specified form content
  ], '/index');
}]);

formsAngular.config(['urlServiceProvider', 'cssFrameworkServiceProvider', function (urlService, cssFrameworkService) {
  urlService.setOptions({html5Mode: false, hashPrefix: '!'});
  cssFrameworkService.setOptions({framework: 'bs2'});  // e2e tests depend on this being bs2
}]);
