'use strict';

formsAngular.provider('routingService', [ '$injector', '$locationProvider', function ($injector, $locationProvider) {

  var config = {
//  fixedRoutes: [] an array in the same format as builtInRoutes that is matched before the generic routes.  Can be omitted
    hashPrefix: '',
    html5Mode: false,
    routing: 'ngroute',    // What sort of routing do we want?  ngroute or uirouter
    prefix: ''        // How do we want to prefix out routes?  If not empty string then first character must be slash (which is added if not)
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

  function _setUpNgRoutes(routes) {
    angular.forEach(routes, function (routeSpec) {
      _routeProvider.when(config.prefix + routeSpec.route, routeSpec.options || {templateUrl: routeSpec.templateUrl});
    });
  }

  function _setUpUIRoutes(routes) {
    angular.forEach(routes, function (routeSpec) {
      _stateProvider.state(routeSpec.state, routeSpec.options || {
        url: routeSpec.route,
        templateUrl: routeSpec.templateUrl
      });
    });
  }

  function _buildOperationUrl(prefix, operation, modelName, formName, id) {
      var formString = formName ? ('/' + formName) : '';
      var modelString = prefix + '/' + modelName;
      var urlStr;
      switch (operation) {
          case 'list' :
              urlStr = modelString + formString;
              break;
          case 'edit' :
              urlStr = modelString + formString + '/' + id + '/edit';
              break;
          case 'new' :
              urlStr = modelString + formString + '/new';
              break;
      }
      return urlStr;
  }

  return {
    start: function (options) {
      angular.extend(config, options);
      if (config.prefix[0] && config.prefix[0] !== '/') { config.prefix = '/' + config.prefix; }
      $locationProvider.html5Mode(config.html5Mode);
      if (config.hashPrefix !== '') {
        $locationProvider.hashPrefix(config.hashPrefix);
      }
      switch (config.routing) {
        case 'ngroute' :
          _routeProvider = $injector.get('$routeProvider');
          if (config.fixedRoutes) { _setUpNgRoutes(config.fixedRoutes); }
          _setUpNgRoutes(builtInRoutes);
          break;
        case 'uirouter' :
          _stateProvider = $injector.get('$stateProvider');
          if (config.fixedRoutes) { _setUpUIRoutes(config.fixedRoutes); }
          setTimeout(function () {
            _setUpUIRoutes(builtInRoutes);
          });
          break;
      }
    },
    $get: function () {
      return {
        router: function () {return config.routing; },
        prefix: function () {return config.prefix; },
        parsePathFunc: function () {
          return function (location) {
            if (location !== lastRoute) {
              lastRoute = location;

              lastObject = {newRecord: false};
              // Get rid of the prefix
              if (config.prefix.length > 0) {
                if (location.indexOf(config.prefix) === 0) {
                  location = location.slice(config.prefix.length);
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
          };
///**
// * DominicBoettger wrote:
// *
// * Parser for the states provided by ui.router
// */
//'use strict';
//formsAngular.factory('$stateParse', [function () {
//
//  var lastObject = {};
//
//  return function (state) {
//    if (state.current && state.current.name) {
//      lastObject = {newRecord: false};
//      lastObject.modelName = state.params.model;
//      if (state.current.name === 'model::list') {
//        lastObject = {index: true};
//        lastObject.modelName = state.params.model;
//      } else if (state.current.name === 'model::edit') {
//        lastObject.id = state.params.id;
//      } else if (state.current.name === 'model::new') {
//        lastObject.newRecord = true;
//      } else if (state.current.name === 'model::analyse') {
//        lastObject.analyse = true;
//      }
//    }
//    return lastObject;
//  };
//}]);
        },
        buildUrl: function (path) {
          var url = config.html5Mode ? '' : '#';
          url += config.hashPrefix;
          url += config.prefix;
          if (url[0]) { url += '/'; }
          url += (path[0] === '/' ? path.slice(1) : path);
          return url;
        },
        buildOperationUrl: function(operation, modelName, formName, id) {
            return _buildOperationUrl(config.prefix, operation, modelName, formName, id);
        },
        redirectTo: function () {
          return function (operation, scope, location, id) {
//            switch (config.routing) {
//              case 'ngroute' :
                if (location.search()) {
                  location.url(location.path());
                }

              var urlStr = _buildOperationUrl(config.prefix, operation, scope.modelName, scope.formName, id);
              location.path(urlStr);

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
              };
        }
      };
    }
  };
}]);
