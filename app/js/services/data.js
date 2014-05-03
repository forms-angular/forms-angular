/* global formsAngular: false */
'use strict';

var fng = angular.module('formsAngular');

fng.factory( '$data',
[
function() {

    var sharedData = {
        record: {},
        disableFunctions: {},
        dataEventFunctions: {}
    };
    return sharedData;

}]);
