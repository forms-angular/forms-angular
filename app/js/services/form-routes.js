'use strict';

formsAngular.provider('formRoutes', ['$routeProvider', function ($routeProvider) {

  var _fngRoutes = [
    {route: '/analyse/:model/:reportSchemaName',  options: {templateUrl: 'partials/base-analysis.html'}},
    {route: '/analyse/:model',                    options: {templateUrl: 'partials/base-analysis.html'}},
    {route: '/:model/:id/edit',                   options: {templateUrl: 'partials/base-edit.html'}},
    {route: '/:model/new',                        options: {templateUrl: 'partials/base-edit.html'}},
    {route: '/:model',                            options: {templateUrl: 'partials/base-list.html'}},
    {route: '/:model/:form/:id/edit',             options: {templateUrl: 'partials/base-edit.html'}},       // non default form (different fields etc)
    {route: '/:model/:form/new',                  options: {templateUrl: 'partials/base-edit.html'}},       // non default form (different fields etc)
    {route: '/:model/:form',                      options: {templateUrl: 'partials/base-list.html'}}        // list page with links to non default form
  ];

  var _setRoutes = function (appRoutes) {
    if (appRoutes === null || appRoutes === undefined) {
      throw new Error('invalid app routes being added to forms-angular');
    }
    for (var i = 0, end = appRoutes.length; i < end; i++) {
      $routeProvider.when(appRoutes[i].route, appRoutes[i].options);
    }
  };

  var _setDefaultRoute = function (defaultRoute) {
    if (defaultRoute !== null) {
      $routeProvider.otherwise({redirectTo: defaultRoute});
    }
  };

  return {
    setRoutes: function (appRoutes, defaultRoute) {
      _setRoutes(appRoutes);
      _setRoutes(_fngRoutes);
      _setDefaultRoute(defaultRoute);
    },
    $get: function () {
      return null;
    }
  };
}]);
