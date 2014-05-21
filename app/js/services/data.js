'use strict';

formsAngular.factory('$data', [function () {

  var sharedData = {
    record: {},
    disableFunctions: {},
    dataEventFunctions: {}
  };
  return sharedData;

}]);
