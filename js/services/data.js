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
