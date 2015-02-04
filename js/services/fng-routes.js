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
    {route: '/:model/:id/edit/:tab',             state: 'model::edit::tab',       templateUrl: 'partials/base-edit.html'},
    {route: '/:model/new',                       state: 'model::new',             templateUrl: 'partials/base-edit.html'},
    {route: '/:model',                           state: 'model::list',            templateUrl: 'partials/base-list.html'},
    {route: '/:model/:form/:id/edit',            state: 'model::form::edit',      templateUrl: 'partials/base-edit.html'},       // non default form (different fields etc)
    {route: '/:model/:form/:id/edit/:tab',       state: 'model::form::edit::tab', templateUrl: 'partials/base-edit.html'},       // non default form (different fields etc)
    {route: '/:model/:form/new',                 state: 'model::form::new',       templateUrl: 'partials/base-edit.html'},       // non default form (different fields etc)
    {route: '/:model/:form',                     state: 'model::form::list',      templateUrl: 'partials/base-list.html'}        // list page with links to non default form
  ];

  var _routeProvider, _stateProvider;
  var lastRoute = null,
    lastObject = {};

  function _setUpNgRoutes(routes, prefix, additional) {
    prefix = prefix || '';
    angular.forEach(routes, function (routeSpec) {
      _routeProvider.when(prefix + routeSpec.route, angular.extend(routeSpec.options || {templateUrl: routeSpec.templateUrl}, additional));
    });
    // This next bit is just for the demo website to allow demonstrating multiple frameworks - not available with other routers
    if (config.variantsForDemoWebsite) {
      angular.forEach(config.variantsForDemoWebsite, function(variant) {
        angular.forEach(routes, function (routeSpec) {
          _routeProvider.when(prefix + variant + routeSpec.route, angular.extend(routeSpec.options || {templateUrl: routeSpec.templateUrl}, additional));
        });
      });
    }
  }

  function _setUpUIRoutes(routes, prefix, additional) {
    prefix = prefix || '';
    angular.forEach(routes, function (routeSpec) {
      _stateProvider.state(routeSpec.state, angular.extend(routeSpec.options || {
        url: prefix + routeSpec.route,
        templateUrl: routeSpec.templateUrl
        }, additional)
      );
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
    /*
        options:
           prefix:        A string (such as '/db') that gets prepended to all the generated routes.  This can be used to
                          prevent generated routes (which have a lot of parameters) from clashing with other routes in
                          the web app that have nothing to do with CRUD forms
           add2fngRoutes: An object to add to the generated routes.  One user case would be to add {authenticate: true}
                          so that the client authenticates for certain routes
           html5Mode:     boolean
           routing:       Must be 'ngroute' or 'uirouter'


     */
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
          _setUpNgRoutes(builtInRoutes, config.prefix, options.add2fngRoutes);
          break;
        case 'uirouter' :
          _stateProvider = $injector.get('$stateProvider');
          if (config.fixedRoutes) { _setUpUIRoutes(config.fixedRoutes); }
          setTimeout(function () {
            _setUpUIRoutes(builtInRoutes, config.prefix, options.add2fngRoutes);
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

              // get rid of variant if present - just used for demo website
              if (config.variants) {
                if (config.variants.indexOf(locationSplit[1]) !== -1) {
                  lastObject.variant = locationSplit[1];
                  locationSplit.shift();
                }
              }

              var locationParts = locationSplit.length;
              if (locationSplit[1] === 'analyse') {
                lastObject.analyse = true;
                lastObject.modelName = locationSplit[2];
                lastObject.reportSchemaName = locationParts >= 4 ? locationSplit[3] : null;
              } else {
                lastObject.modelName = locationSplit[1];
                var lastParts = [locationSplit[locationParts - 1], locationSplit[locationParts - 2]];
                var newPos = lastParts.indexOf('new');
                var editPos;
                if (newPos === -1) {
                  editPos = lastParts.indexOf('edit');
                  if (editPos !== -1) {
                    locationParts -= (2 + editPos);
                    lastObject.id = locationSplit[locationParts];
                  }
                } else {
                  lastObject.newRecord = true;
                  locationParts -= (1 + newPos);
                }
                if (editPos === 1 || newPos === 1) {
                  lastObject.tab = lastParts[0];
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
