'use strict';

/*
  A helper service to provide a starting off point for directive plugins
 */

formsAngular.factory('pluginHelper', ['formMarkupHelper',function (formMarkupHelper) {
  var exports = {};

  exports.extractFromAttr = function (attr) {
    var info = {};
    for (var prop in attr) {
      if (attr.hasOwnProperty(prop) && prop.slice(0, 6) === 'fngFld') {
        info[prop.slice(6).toLowerCase()] = attr[prop];
      }
    }
    var options = {formStyle: attr.formstyle};
    return {info: info, options: options};
  };

  exports.buildInputMarkup = function (scope, model, info, options, generateInputControl) {
    var fieldChrome = formMarkupHelper.fieldChrome(scope, info, options);
    var controlDivClasses = formMarkupHelper.controlDivClasses(options);
    var elementHtml = fieldChrome.template + formMarkupHelper.label(scope, info, null, options);
    var buildingBlocks = formMarkupHelper.allInputsVars(scope, info, options, model + '.' + info.name, info.id, info.name);
    elementHtml += formMarkupHelper.handleInputAndControlDiv(
      formMarkupHelper.inputChrome(
        generateInputControl(buildingBlocks),
        info,
        options,
        buildingBlocks),
       controlDivClasses);
    elementHtml += fieldChrome.closeTag;
    return elementHtml;
  };

  return exports;
}]);
