'use strict';
var myDemoApp = angular.module('myDemoApp', [
  'formsAngular',
  'ui.router'
]);

myDemoApp.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('/', {
      url: '/',
      templateUrl: 'partials/landing-page.html'
    })
    .state('getStarted', {
      url: '/get-started',
      templateUrl: 'partials/get-started.html'
    })
    .state('forms', {
      url: '/forms',
      templateUrl: 'partials/forms.html'
    })
    .state('schemas', {
      url: '/schemas',
      templateUrl: 'partials/schemas.html'
    })
    .state('reporting', {
      url: '/reporting',
      templateUrl: 'partials/reporting.html'
    })
    .state('more', {
      url: '/more',
      templateUrl: 'partials/more.html'
    })
    .state('inTheWild', {
      url: '/in-the-wild',
      templateUrl: 'partials/in-the-wild.html'
    })
    .state('examples', {
      url: '/examples',
      templateUrl: 'partials/examples.html'
    })
    .state('apiDocs', {
      url: '/api-docs',
      templateUrl: 'partials/api-docs.html'
    })
    .state('404', {
      url: '/404',
      templateUrl: 'partials/404.html'
    })
    .state('model::edit', {
      url: '/el/:model/:id/edit',
      templateUrl: 'partials/base-edit.html'
    })
    .state('model::new', {
      url: '/el/:model/new',
      templateUrl: 'partials/base-edit.html'
    })
    .state('model::list', {
      url: '/el/:model',
      templateUrl: 'partials/base-list.html'
    });
  $urlRouterProvider.otherwise('/');
});

formsAngular.config(['urlServiceProvider', 'cssFrameworkServiceProvider', function (urlService, cssFrameworkService) {
  urlService.setOptions({html5Mode: false, hashPrefix: ''});
  cssFrameworkService.setOptions({framework: 'bs3'});  // e2e tests depend on this being bs2
}]);