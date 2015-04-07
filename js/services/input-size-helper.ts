/// <reference path="../../typings/angularjs/angular.d.ts" />

module fng.services {

  /*@ngInject*/
  export function inputSizeHelper() {

    var sizeMapping = [1, 2, 4, 6, 8, 10, 12];
    var sizeDescriptions = ['mini', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'block-level'];
    var defaultSizeOffset = 2; // medium, which was the default for Twitter Bootstrap 2

    return {
      sizeMapping: sizeMapping,
      sizeDescriptions: sizeDescriptions,
      defaultSizeOffset: defaultSizeOffset,
      sizeAsNumber: function (fieldSizeAsText) {
        return sizeMapping[fieldSizeAsText ? sizeDescriptions.indexOf(fieldSizeAsText) : defaultSizeOffset];
      }
    };
  }
}
