'use strict';

formsAngular.provider('urlService', ['$locationProvider',function ($locationProvider) {
    var config = {
        hashPrefix: '',
        html5Mode: false
    };

    return {
        setOptions : function(hashPrefix, html5Mode) {
            if (hashPrefix) {
                $locationProvider.hashPrefix(hashPrefix);
                config.hashPrefix = hashPrefix;
            }
        },
        $get : function() {
            return {
                buildUrl:function (path) {
                    var base = config.html5Mode ? '':'#';
                    base += config.hashPrefix;
                    if (base[0]) base += '/';
                    return base + path;
                }
            };
        }
    };
}]);
