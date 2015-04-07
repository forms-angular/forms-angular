/// <reference path="../../typings/angularjs/angular.d.ts" />

module fng.filters {

  /*@ngInject*/
  export function camelCase() {
    return function (name) {
      var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
      return name.
        replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
          return offset ? letter.toUpperCase() : letter;
        })
    }
  }
}
