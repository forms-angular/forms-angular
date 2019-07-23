/// <reference path="../../index.d.ts" />

module fng.services {

  /*@ngInject*/
  export function routingService($injector, $locationProvider) {

    var config:fng.IRoutingConfig = {
//  fixedRoutes: [] an array in the same format as builtInRoutes that is matched before the generic routes.  Can be omitted
      hashPrefix: '',
      html5Mode: false,
      routing: 'ngroute',   // What sort of routing do we want?  ngroute or uirouter
      prefix: ''            // How do we want to prefix our routes?  If not empty string then first character must be slash (which is added if not)
    };

    var postActions: Array<string> = ['edit','view'];

    var builtInRoutes:Array<fng.IBuiltInRoute> = [
      {
        route: '/analyse/:model/:reportSchemaName',
        state: 'analyse::model::report',
        templateUrl: 'base-analysis.html'
      },
      {route: '/analyse/:model', state: 'analyse::model', templateUrl: 'base-analysis.html'},
      {route: '/:model/:id/edit', state: 'model::edit', templateUrl: 'base-edit.html'},
      {route: '/:model/:id/edit/:tab', state: 'model::edit::tab', templateUrl: 'base-edit.html'},
      {route: '/:model/:id/view', state: 'model::edit', templateUrl: 'base-view.html'},
      {route: '/:model/:id/view/:tab', state: 'model::view::tab', templateUrl: 'base-view.html'},
      {route: '/:model/new', state: 'model::new', templateUrl: 'base-edit.html'},
      {route: '/:model', state: 'model::list', templateUrl: 'base-list.html'},
      {route: '/:model/viewonly', state: 'model::view', templateUrl: 'base-list-view.html'},

      // Non default form (subset of fields etc)
      {route: '/:model/:form/:id/edit', state: 'model::form::edit', templateUrl: 'base-edit.html'},
      {route: '/:model/:form/:id/edit/:tab', state: 'model::form::edit::tab', templateUrl: 'base-edit.html'},
      {route: '/:model/:form/:id/view', state: 'model::form::view', templateUrl: 'base-view.html'},
      {route: '/:model/:form/:id/view/:tab', state: 'model::form::view::tab', templateUrl: 'base-view.html'},
      {route: '/:model/:form/new', state: 'model::form::new', templateUrl: 'base-edit.html'},
      {route: '/:model/:form', state: 'model::form::list', templateUrl: 'base-list.html'},        // list page with edit links to non default form
      {route: '/:model/:form/:viewonly', state: 'model::form::list::view', templateUrl: 'base-list-view.html'}        // list page with edit links to non default form
    ];

    var _routeProvider, _stateProvider;
    var lastRoute = null;
    var lastObject:fng.IFngRoute = {};

    function handleFolder(templateURL: string) : string {
      var retVal : string = templateURL;
      if (config.templateFolder) {
        if (config.templateFolder[config.templateFolder.length-1] !== '/') {
          retVal = config.templateFolder + '/' + retVal;
        } else {
          retVal = config.templateFolder + retVal;
        }
      }
      return retVal;
    }

    function _setUpNgRoutes(routes:Array<fng.IBuiltInRoute>, prefix:string = '', additional?:any):void {
      prefix = prefix || '';
      angular.forEach(routes, function (routeSpec) {
        _routeProvider.when(prefix + routeSpec.route, angular.extend(routeSpec.options || {templateUrl: handleFolder(routeSpec.templateUrl)}, additional));
      });

      // This next bit is just for the demo website to allow demonstrating multiple CSS frameworks - not available with other routers
      if (config.variantsForDemoWebsite) {
        angular.forEach(config.variantsForDemoWebsite, function (variant) {
          angular.forEach(routes, function (routeSpec) {
            _routeProvider.when(prefix + variant + routeSpec.route, angular.extend(routeSpec.options || {templateUrl: handleFolder(routeSpec.templateUrl)}, additional));
          });
        });
      }

    }

    function _setUpUIRoutes(routes:Array<fng.IBuiltInRoute>, prefix:string = '', additional?:any):void {
      prefix = prefix || '';
      angular.forEach(routes, function (routeSpec) {
        _stateProvider.state(routeSpec.state, angular.extend(routeSpec.options || {
            url: prefix + routeSpec.route,
            templateUrl: routeSpec.templateUrl
          }, additional)
        );
      });
    }

    function _buildOperationUrl(prefix, operation, modelName, formName, id, tabName) {
      var formString = formName ? ('/' + formName) : '';
      var modelString = prefix + '/' + modelName;
      var tabString = tabName ? ('/' + tabName) : '';
      var urlStr;
      switch (operation) {
        case 'list' :
          urlStr = modelString + formString;
          break;
        case 'edit' :
          urlStr = modelString + formString + '/' + id + '/edit' + tabString;
          break;
        case 'view' :
          urlStr = modelString + formString + '/' + id + '/view' + tabString;
          break;
        case 'read' :
          urlStr = modelString + formString + '/' + id + '/read' + tabString;
          break;
        case 'new' :
          urlStr = modelString + formString + '/new' + tabString;
          break;
      }
      return urlStr;
    }

    function _setUpRoutes(fixedRoutes:Array<fng.IBuiltInRoute>, fngRoutes:Array<fng.IBuiltInRoute>) {
      switch (config.routing) {
        case 'ngroute' :
          _routeProvider = $injector.get('$routeProvider');
          if (fixedRoutes) {_setUpNgRoutes(fixedRoutes)}
          _setUpNgRoutes(fngRoutes, config.prefix, config.add2fngRoutes);
          break;
        case 'uirouter' :
          _stateProvider = $injector.get('$stateProvider');
          if (fixedRoutes) {_setUpUIRoutes(config.fixedRoutes);}
          _setUpUIRoutes(fngRoutes, config.prefix, config.add2fngRoutes);
          break;
      }
    }


    return {
      start: function (options:fng.IRoutingConfig) {
        angular.extend(config, options);
        if (config.prefix[0] && config.prefix[0] !== '/') {
          config.prefix = '/' + config.prefix;
        }
        $locationProvider.html5Mode(config.html5Mode);
        if (config.hashPrefix !== '') {
          $locationProvider.hashPrefix(config.hashPrefix);
        } else if (!config.html5Mode) {
          $locationProvider.hashPrefix('');
        }
        _setUpRoutes(config.fixedRoutes, builtInRoutes);
      },
      addRoutes: function(fixedRoutes:Array<fng.IBuiltInRoute>, fngRoutes:Array<fng.IBuiltInRoute>) {
        _setUpRoutes( fixedRoutes, fngRoutes);
      },
      registerAction: function(action: string) {
        postActions.push(action);
      },
      $get: function () {
        return {
          router: function () {
            return config.routing;
          },
          prefix: function () {
            return config.prefix;
          },
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

                let locationParts = locationSplit.length;
                if (locationSplit[1] === 'analyse') {
                  lastObject.analyse = true;
                  lastObject.modelName = locationSplit[2];
                  lastObject.reportSchemaName = locationParts >= 4 ? locationSplit[3] : null;
                } else {
                  lastObject.modelName = locationSplit[1];
                  let lastParts = [locationSplit[locationParts - 1], locationSplit[locationParts - 2]];
                  let newPos = lastParts.indexOf('new');
                  let viewonlyPos = lastParts.indexOf('viewonly');
                  let actionPos;
                  if (newPos === -1 && viewonlyPos === -1) {
                    actionPos = postActions.reduce((previousValue, currentValue) => {
                      let pos = lastParts.indexOf(currentValue);
                      return pos > -1 ? pos : previousValue
                    }, -1);
                    if (actionPos !== -1) {
                      locationParts -= (2 + actionPos);
                      lastObject.id = locationSplit[locationParts];
                    }
                  } else if (newPos !== -1) {
                    lastObject.newRecord = true;
                    locationParts -= (1 + newPos);
                  } else {
                    locationParts -= (1 + viewonlyPos);
                  }
                  if (actionPos === 1 || newPos === 1) {
                    lastObject.tab = lastParts[0];
                  }
                  if (locationParts > 2) {
                    lastObject.formName = locationSplit[2];
                  }
                }
              }
              return lastObject;

            };
          },
          buildUrl: function (path) {
            var url = config.html5Mode ? '' : '#';
            url += config.hashPrefix;
            url += config.prefix;
            if (url[0]) {
              url += '/';
            }
            url += (path[0] === '/' ? path.slice(1) : path);
            return url;
          },
          buildOperationUrl: function (operation, modelName, formName, id, tab) {
            return _buildOperationUrl(config.prefix, operation, modelName, formName, id, tab);
          },
          redirectTo: function () {
            return function (operation, scope, location, id, tab) {
              if (location.search()) {
                location.url(location.path());
              }

              var urlStr = _buildOperationUrl(config.prefix, operation, scope.modelName, scope.formName, id, tab);
              location.path(urlStr);

            };
          }
        };
      }
    };
  }
}
