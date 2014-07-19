'use strict';

formsAngular.provider('urlService', ['$locationProvider', 'routingServiceProvider', function ($locationProvider, routingService) {
  var config = {
    hashPrefix: '',
    html5Mode: false
  };

  return {
    setOptions: function (options) {
      angular.extend(config, options);
      $locationProvider.html5Mode(config.html5Mode);
      if (config.hashPrefix !== '') {
        $locationProvider.hashPrefix(config.hashPrefix);
      }
    },
    $get: function () {
      return {
        buildUrl: function (path) {
          var base = config.html5Mode ? '' : '#';
          base += config.hashPrefix;
          base += routingService.prefix();
          if (base[0]) { base += '/'; }
          return base + path;
        }
      };
    }
  };
}]);