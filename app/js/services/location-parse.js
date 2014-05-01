/* global formsAngular: false */
'use strict';

var fang = angular.module('formsAngular');

fang.factory('$locationParse', [function() {

        var lastRoute = null,
            lastObject = {};

        return function(location) {
            if (location === lastRoute) {
                return lastObject;
            }

            lastRoute = location;
            var locationSplit = location.split('/');
            var locationParts = locationSplit.length;
            if (locationParts === 2 && locationSplit[1] === 'index') {
                lastObject = {index: true};
                return lastObject;
            }

            lastObject = {newRecord: false};
            if (locationSplit[1] === 'analyse') {
                lastObject.analyse = true;
                lastObject.modelName = locationSplit[2];
                return lastObject;
            }

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
            return lastObject;
        };
    }]);

