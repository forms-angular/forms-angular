/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.services {

  /*@ngInject*/
  export function InputSizeHelperService() {

    var sizeMapping = [1, 2, 4, 6, 8, 10, 12];
    var sizeDescriptions: FieldSizeString[] = ['mini', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'block-level'];
    var defaultSizeOffset = 2; // medium, which was the default for Twitter Bootstrap 2

    return {
      sizeMapping: sizeMapping,
      sizeDescriptions: sizeDescriptions,
      defaultSizeOffset: defaultSizeOffset,
      sizeAsNumber: function (info: fng.IFormInstruction) {
        let result = sizeMapping[info.size ? sizeDescriptions.indexOf(info.size) : defaultSizeOffset];
        if (info.coloffset) {
          result += info.coloffset;
        }
        return result;
      }
    };
  }
}
