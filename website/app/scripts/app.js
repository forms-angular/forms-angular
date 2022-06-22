'use strict';

var websiteApp = angular.module('websiteApp', [
  'ngRoute',
  'formsAngular',
  'ui.date',
  'ui.grid',
  'ui.grid.selection',
  'ui.sortable',
  'ngCkeditor',       // V4
  'fng.ckeditor',    // V5
  'fng.uiSelect',
  'uploadModule',
  'angularCSS',
  'fng.uiBootstrapDate',
  'ui.bootstrap.datetimepicker',
  'fng.uiBootstrapDateTime',
  'fng.colourPicker',
  'fngAuditModule'
]);

websiteApp.directive('ngPrism', [function() {
  return {
    restrict: 'A',
    link: function($scope, element) {
      element.ready(function() {
        if(element[0].className.indexOf('language-markup') !== -1) {
          // Put the markup in a comment
          element[0].innerHTML = '<!--\n' + element[0].innerHTML.replace(' ng-scope','') + '\n-->';
        }
        Prism.highlightElement(element[0]);
      });
    }
  };
}]);

websiteApp
  .config(['$routeProvider',function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/'});
  }])
  .controller('DemoCtrl', ['$scope', '$location', '$anchorScroll', function ($scope, $location, $anchorScroll) {
    $scope.scrollToSection = function (id) {
      $location.hash(id);
      $anchorScroll();
    };
  }]);

websiteApp.frameworks = ['bs2', 'bs3'];   // Just for testing forms-angular
websiteApp.defaultFramework = 'bs2';

formsAngular.config(['$locationProvider', 'cssFrameworkServiceProvider', 'routingServiceProvider',
  function ($locationProvider, cssFrameworkService, routingService) {
  routingService.start(
    {
      // Define the fixed routes (the dynamic routes for CRUD will be created by forms-angular)
      fixedRoutes: [
        {route: '/', options: {templateUrl: 'partials/landing-page.html'}},
        {route: '/get-started', options: {templateUrl: 'partials/get-started.html'}},
        {route: '/forms', options: {templateUrl: 'partials/forms.html'}},
        {route: '/schemas', options: {templateUrl: 'partials/schemas.html'}},
        {route: '/plugins', options: {templateUrl: 'partials/plugins.html'}},
        {route: '/more', options: {templateUrl: 'partials/more.html'}},
        {route: '/in-the-wild', options: {templateUrl: 'partials/in-the-wild.html'}},
        {route: '/supported-by', options: {templateUrl: 'partials/supported-by.html'}},
        {route: '/examples', options: {templateUrl: 'partials/examples.html'}},
        {route: '/api-docs', options: {templateUrl: 'partials/api-docs.html'}},
        {route: '/404', options: {templateUrl: 'partials/404.html'}},
        {route: '/z_custom_form/new', options: {templateUrl: 'partials/custom-new.html'}},            // example view override
        {route: '/z_custom_form/:id/edit', options: {templateUrl: 'partials/custom-edit.html'}},      // example view override
        {route: '/z_custom_form/:form/new', options: {templateUrl: 'partials/custom-new.html'}},      // example view override with specified form content
        {route: '/z_custom_form/:form/:id/edit', options: {templateUrl: 'partials/custom-edit.html'}} // example view override with specified form content
      ],
      routing: 'ngroute',                       // specify the routing we are using
      html5Mode: false,
      variants:  websiteApp.frameworks,          // variants is just for testing forms-angular
      onDelete: '/'
    }
  );
  cssFrameworkService.setOptions({framework: websiteApp.defaultFramework});
  formsAngular.beforeProcess = function(scope, cb) {
    // We aren't doing anything here, but we could be waiting for something async that a form might depend on
    cb(null);
  };
  formsAngular.title = {prefix: 'FngDemo (', suffix: ')'};
}]);

/**
 * The rest of this file is all about testing different frameworks and will almost certainly be of no interest to
 * anyone not working on forms-angular itself
 * to specify the framework for testing open a new browser tab and enter localhost:9000/#/bs3 (or whichever framework)
 **/

websiteApp.css = {
  bs2: ['styles/main-bs2.css', 'select2/select2.css'],   // Select2 needs to be reloaded after the framework style
  bs3: ['styles/main-bs3.css', 'select2/select2.css']
};
websiteApp.cssLoaded = false;

websiteApp
  .run(['$location', '$css', 'cssFrameworkService', function($location, $css, cssFrameworkService) {
    // Potentially switch CSS files if running in dev or test config
    if ($location.$$port === 9000) {
      var framework = $location.path().slice(1);
      var newPath;

      if (websiteApp.frameworks.indexOf(framework) !== -1) {
        cssFrameworkService.setFrameworkForDemoWebsite(framework);
        newPath = $location.path().slice(1 + framework.length);
        if (!newPath[0]) {
          newPath = '/';
        }
      } else {
        framework = websiteApp.defaultFramework;
      }
      $css.add(websiteApp.css[framework]);
      if (newPath) {
        $location.path(newPath);
      }
    }
    }])
  .controller('CSSSwitchCtrl', ['$location', '$scope', 'cssFrameworkService', '$css', function($location, $scope, cssFrameworkService, $css) {
    // Don't mess around with switching CSS files if were aren't running in dev or test config
    if ($location.$$port === 9000) {
      // Switch the CSS when asked
      $scope.$on('fngFormLoadStart', function (event, formScope) {
        if (formScope.variant && formScope.variant !== cssFrameworkService.framework()) {
          $css.remove(websiteApp.css[cssFrameworkService.framework()]);
          cssFrameworkService.setFrameworkForDemoWebsite(formScope.variant);
          $css.add(websiteApp.css[cssFrameworkService.framework()]);
          console.log('Switched to ' + cssFrameworkService.framework());
        }
      });
    }
  }]);



