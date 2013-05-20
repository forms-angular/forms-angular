'use strict';

formsAngular.factory('$locationParse', [function() {

        var lastRoute = null,
            lastObject = {};

        return function(location) {

            if (location !== lastRoute) {
                lastRoute = location;
                lastObject = {};
                var locationSplit = location.split('/');
                var locationParts = locationSplit.length;
                var lastPart = locationSplit[locationParts - 1];
                lastObject.modelName = lastObject.formName = lastObject.id = undefined;
                lastObject.newRecord = lastObject.newRecord || (lastPart === 'new');
                lastObject.modelName = locationSplit[1];

                if (lastObject.newRecord) {
                    if (locationParts === 4) {
                        lastObject.formName = locationSplit[2];
                    }
                } else {
                    if (locationParts === 5) {
                        lastObject.formName = locationSplit[2];
                        lastObject.id = locationSplit[3];
                    } else {
                        lastObject.id = locationSplit[2];
                    }
                }
            }
            return lastObject;
        }
    }]);

