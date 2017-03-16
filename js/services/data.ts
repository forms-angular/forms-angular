/// <reference path="../../node_modules/@types/angular/index.d.ts" />

module fng.services {

  /*@ngInject*/
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
