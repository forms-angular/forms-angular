/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../forms-angular.d.ts" />

'use strict';

formsAngular.factory('$data', [function () {

  var sharedData = {

    // The record from BaseCtrl
    record: {},
    disableFunctions: {},
    dataEventFunctions: {},

    modelControllers: []
  };
  return sharedData;

}]);
