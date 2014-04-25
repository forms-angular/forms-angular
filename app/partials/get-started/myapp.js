var myApp = angular.module('myApp', ['formsAngular']);

myApp.config(['formRoutesProvider', function (formRoutes) {
    formRoutes.setRoutes([
        {route:'/index', options:{templateUrl: 'partials/index.html'}},
// The next block shows how to use custom forms for a given model rather than the generic form provided
        {route:'/z_custom_form/new', options:{templateUrl: 'partials/custom-new.html'}},            // example view override
        {route:'/z_custom_form/:id/edit', options:{templateUrl: 'partials/custom-edit.html'}},      // example view override
        {route:'/z_custom_form/:form/new', options:{templateUrl: 'partials/custom-new.html'}},      // example view override with specified form content
        {route:'/z_custom_form/:form/:id/edit', options:{templateUrl: 'partials/custom-edit.html'}} // example view override with specified form content
    ], '/index');
}]);

//To use one of the $locationProvider options use the call below:
//formsAngular.config(['urlServiceProvider',function(urlService) {
//    urlService.setOptions({html5Mode: false, hashPrefix: '!'});
//}]);

//uncomment to use Bootstrap 3-- formsAngular.config(['cssFrameworkServiceProvider',function(cssFrameworkService) {
//uncomment to use Bootstrap 3--    cssFrameworkService.setOptions({framework:'bs3'});
//uncomment to use Bootstrap 3--}]);
