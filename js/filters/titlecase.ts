/// <reference path="../../typings/angularjs/angular.d.ts" />

module fng.filters {

  /*@ngInject*/
  export function titleCase() {
    return function (str, stripSpaces) {
      if (str) {
        str = str
          .replace(/(_|\.)/g, ' ')                       // replace underscores and dots with spaces
          .replace(/[A-Z]/g, ' $&').trim()               // precede replace caps with a space
          .replace(/\w\S*/g, function (txt) {            // capitalise first letter of word
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
        if (stripSpaces) {
          str = str.replace(/\s/g, '');
        } else {
          // lose double spaces
          str = str.replace(/\s{2,}/g, ' ');
        }
      }
      return str;
    }
  }
}
