/* global formsAngular: false */
'use strict';

var fang = angular.module('formsAngular');

fang.factory( '$data',
[
function() {

    var sharedData = {
        //record: {},
        disableFunctions: {},
        dataEventFunctions: {}
    };
    return sharedData;

}]);
