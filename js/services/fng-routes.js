'use strict';

formsAngular.provider('routingService', [ '$injector', '$locationProvider', function ($injector, $locationProvider) {

  var config = {
    hashPrefix: '',
    html5Mode: false,
    routing: 'ngroute',    // What sort of routing do we want?  ngroute or uirouter
    prefix: '/data'        // How do we want to prefix out routes?  If not empty string then first character must be slash (which is added if not)
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

  var _routeProvider, _stateProvider;
  var lastRoute = null,
    lastObject = {};

  return {
    start: function (options) {
      angular.extend(config, options);
      if (config.prefix[0] !== '/') config.prefix = '/' + config.prefix;
      $locationProvider.html5Mode(config.html5Mode);
      if (config.hashPrefix !== '') {
        $locationProvider.hashPrefix(config.hashPrefix);
      }
      switch (config.routing) {
        case 'ngroute' :
          _routeProvider = $injector.get('$routeProvider');
          angular.forEach(builtInRoutes, function (routeSpec) {
            _routeProvider.when(config.prefix + routeSpec.route, {templateUrl:routeSpec.templateUrl});
          });
          break;
        case 'uirouter' :
          _stateProvider = $injector.get('$stateProvider');
          setTimeout(function () {
            angular.forEach(builtInRoutes, function (routeSpec) {
              _stateProvider.state(routeSpec.state, {
                url: routeSpec.route,
                templateUrl: routeSpec.templateUrl
              });
            });
          });
          break;
      }
    },
    $get: function () {
      return {
        router: function () {return config.routing; },
        prefix: function () {return config.prefix; },
        parsePathFunc: function () {
          return function(location) {
            if (location !== lastRoute) {
              lastRoute = location;

              lastObject = {newRecord: false};
              // Get rid of the prefix
              if (config.prefix.length > 0) {
                if (location.indexOf(config.prefix) === 0) {
                  location = location.slice(config.prefix.length)
                }
              }

              var locationSplit = location.split('/');
              var locationParts = locationSplit.length;
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
            return lastObject;
          }
        },
        buildUrl: function (path) {
          var base = config.html5Mode ? '' : '#';
          base += config.hashPrefix;
          base += config.prefix;
          if (base[0]) { base += '/'; }
          return base + path;
        },
        redirectTo: function () {
          return function (operation, scope, location, id) {
//            switch (config.routing) {
//              case 'ngroute' :
                if (location.search()) {
                  location.url(location.path());
                }
                var formString = scope.formName ? ('/' + scope.formName) : '';
                var modelString = config.prefix + '/' + scope.modelName;
                switch (operation) {
                  case 'list' :
                    location.path(modelString + formString);
                    break;
                  case 'edit' :
                    location.path(modelString + formString + '/' + id + '/edit');
                    break;
                  case 'new' :
                    location.path(modelString + formString + '/new');
                    break;
                }
//                break;
//              case 'uirouter' :
//                var formString = scope.formName ? ('/' + scope.formName) : '';
//                var modelString = config.prefix + '/' + scope.modelName;
//                console.log('form schemas not supported with ui-router');
//                switch (operation) {
//                  case 'list' :
//                    location.path(modelString + formString);
//                    break;
//                  case 'edit' :
//                    location.path(modelString + formString + '/' + id + '/edit');
//                    break;
//                  case 'new' :
//                    location.path(modelString + formString + '/new');
//                    break;
//                }
//                switch (operation) {
//                  case 'list' :
//                    $state.go('model::list', { model: model });
//                    break;
//                  case 'edit' :
//                    location.path('/' + scope.modelName + formString + '/' + id + '/edit');
//                    break;
//                  case 'new' :
//                    location.path('/' + scope.modelName + formString + '/new');
//                    break;
//                }
//                break;
//
//
//                //  edit: $state.go('model::edit', {id: data._id, model: $scope.modelName });
//                //  new:  $state.go('model::new', {model: $scope.modelName});
//                break;
//              case 'suppressWarnings' :
//                void(operation);
//                void(scope);
//                break;
//            }
          }
        }
      };
    }
  };
}]);