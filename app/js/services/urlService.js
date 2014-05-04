/* global formsAngular: false */
'use strict';

var fng = angular.module('formsAngular');

fng.provider( 'urlService',
[
    '$locationProvider'
,
function ($locationProvider) {
    var config = {
        hashPrefix: '',
        html5Mode: false
    };

    var prefix = function () {
        return (config.html5Mode ? '' : '#') + config.hashPrefix;
    };

    // todo: move to utility service
    var trimEnds = function (str, trimChar) {
        if (!str || !trimChar) {
            throw Error('can\'t trim an empty string');
        }
        while (str[0] === '/') {
            str = str.slice(1);
        }
        while (str.slice(-1) === '/') {
            str = str.slice(0, str.length -1);
        }
        return str;
    };

    var makeUnprefixedPath = function (elements) {
        if (!Array.isArray(elements)) {
            throw Error('makePath only accepts arrays');
        }

        var path = ''
        for (var i = 0, end = elements.length; i < end; i++) {
            // ignore empty elements
            if (!elements[i]) {
                continue;
            }
            var elem = trimEnds(elements[i], '/');
            if (!elem) {
                continue;
            }
            path = path + '/' + elem;
        }
        return path;
    };

    var makePrefixedPath = function (elements) {
        return prefix() + makeUnprefixedPath(elements);
    }

    return {
        setOptions : function(options) {
            angular.extend(config, options);
            $locationProvider.html5Mode(config.html5Mode);
            if (config.hashPrefix !== '') {
                $locationProvider.hashPrefix(config.hashPrefix);
            }
        },
        $get : function() {
            return {
                buildUrl: function (path) {
                    return prefix() + '/' + path;
                },

                path: function (elements) {
                    return makeUnprefixedPath(elements);
                },
                url: function (elements) {
                    return makePrefixedPath(elements);
                },

                editRecordUrl: function (modelName, formName, id) {
                    return this.url([modelName, formName, id, 'edit']);
                },
                editRecordPath: function (modelName, formName, id) {
                    return this.path([modelName, formName, id, 'edit']);
                },

                newRecordUrl: function (modelName, formName) {
                    return this.url([modelName, formName, 'new']);
                },
                newRecordPath: function (modelName, formName) {
                    return this.path([modelName, formName, 'new']);
                }
            };
        }
    };
}]);

















