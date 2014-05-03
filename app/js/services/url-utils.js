/* global formsAngular: false */
'use strict';

var fang = angular.module('formsAngular');

fang.provider( 'urlService', ['$locationProvider', function ($locationProvider) {
    var config = {
        hashPrefix: '',
        html5Mode: false
    };

    this.setOptions = function(options) {
        angular.extend(config, options);
        $locationProvider.html5Mode(config.html5Mode);
        if (config.hashPrefix !== '') {
            $locationProvider.hashPrefix(config.hashPrefix);
        }
    };

    this.$get = function() {
        return {
            buildUrl: function (path) {
                var base = config.html5Mode ? '':'#';
                base += config.hashPrefix;
                if (base[0]) {
                    base += '/';
                }
                return base + path;
            }
        };
    };


}]);