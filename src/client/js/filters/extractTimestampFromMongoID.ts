/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.filters {

  /*@ngInject*/
  export function extractTimestampFromMongoID() {
    return function (id: string) {
      let timestamp = id.substring(0, 8);
      return new Date(parseInt(timestamp, 16) * 1000);
    }
  }
}
