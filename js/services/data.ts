/// <reference path="../../typings/angularjs/angular.d.ts" />

module fng.services {

  export function $data() {

    var sharedData = {

      // The record from BaseCtrl
      record: {},
      disableFunctions: {},
      dataEventFunctions: {},

      modelControllers: []
    };
    return sharedData;

  }

}
