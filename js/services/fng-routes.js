'use strict';

formsAngular.provider('routingService', [ '$injector', function ($injector) {

  var config = {
    routing: null    // What sort of routing do we want?  null (which does nothing but is used in tests), ngroute or uirouter
  };

  var builtInRoutes = [
    {route: '/analyse/:model/:reportSchemaName', state: 'analyse::model::report', templateUrl: 'partials/base-analysis.html'},
    {route: '/analyse/:model',                   state: 'analyse::model',         templateUrl: 'partials/base-analysis.html'},
    {route: '/:model/:id/edit',                  state: 'model::edit',            templateUrl: 'partials/base-edit.html'},
    {route: '/:model/new',                       state: 'model::new',             templateUrl: 'partials/base-edit.html'},
    {route: '/:model',                           state: 'model::list',            templateUrl: 'partials/base-list.html'},
    {route: '/:model/:form/:id/edit',            state: 'model::form::edit',      templateUrl: 'partials/base-edit.html'},       // non default form (different fields etc)
    {route: '/:model/:form/new',                 state: 'model::form::new',       templateUrl: 'partials/base-edit.html'},       // non default form (different fields etc)
    {route: '/:model/:form',                     state: 'model::form::list',      templateUrl: 'partials/base-list.html'}        // list page with links to non default form
  ];

  var _routeProvider;
  var lastRoute = null,
    lastObject = {};

  return {
    setOptions: function (options) {
      angular.extend(config, options);
      switch (config.routing) {
        case 'ngroute' :
          _routeProvider = $injector.get('$routeProvider');
          setTimeout(function () {
            angular.forEach(builtInRoutes, function (routeSpec, key) {
              _routeProvider.when(routeSpec.route, {templateUrl:routeSpec.templateUrl});
            });
          });
          break;
        case 'uirouter' :
          break;
      }
    },
    $get: function () {
      return {
        router: function () {return config.routing; },
        parsePathFunc: function () {
          return function(location) {
            if (location !== lastRoute) {
              lastRoute = location;
              var locationSplit = location.split('/');
              var locationParts = locationSplit.length;
              if (locationParts === 2 && locationSplit[1] === 'index') {
                lastObject = {index: true};
              } else {
                lastObject = {newRecord: false};
                if (locationSplit[1] === 'analyse') {
                  lastObject.analyse = true;
                  lastObject.modelName = locationSplit[2];
                } else {
                  lastObject.modelName = locationSplit[1];
                  var lastPart = locationSplit[locationParts - 1];
                  if (lastPart === 'new') {
                    lastObject.newRecord = true;
                    locationParts--;
                  } else if (lastPart === 'edit') {
                    locationParts = locationParts - 2;
                    lastObject.id = locationSplit[locationParts];
                  }
                  if (locationParts > 2) {
                    lastObject.formName = locationSplit[2];
                  }
                }
              }
            }
            return lastObject;
          }
        },
        redirectTo: function () {
          return function (operation, scope, location, id) {
            switch (config.routing) {
              case 'ngroute' :
                if (location.search()) {
                  location.url(location.path());
                }
                var formString = scope.formName ? ('/' + scope.formName) : '';
                switch (operation) {
                  case 'list' :
                    location.path('/' + scope.modelName + formString);
                    break;
                  case 'edit' :
                    location.path('/' + scope.modelName + formString + '/' + id + '/edit');
                    break;
                  case 'new' :
                    location.path('/' + scope.modelName + formString + '/new');
                    break;
                }
                break;
              case 'uirouter' :
                //  list: $state.go('model::list', { model: model });
                //  edit: $state.go('model::edit', {id: data._id, model: $scope.modelName });
                //  new:  $state.go('model::new', {model: $scope.modelName});
                break;
              case 'suppressWarnings' :
                void(operation);
                void(scope);
                break;
            }
          }
        }
      };
    }
  };
}]);