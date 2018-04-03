'use strict';

// Tell angular about our dependencies
angular.module('quickStartApp', [
  'ngRoute',
  'formsAngular'
])

// Specify the fall back route - see below for other routes
.config(function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/'});
});

// Now configure forms-angular
formsAngular.config(['routingServiceProvider', function (routingService) {
  routingService.start(
    {
      routing: 'ngroute',      // specify the routing we are using
      // In this simple example we define just one fixed route (the dynamic routes for CRUD will be created by forms-angular)
      fixedRoutes: [
        {route: '/', options: {templateUrl: '/landing-page.html'}}
      ]
    }
  );
}]);
