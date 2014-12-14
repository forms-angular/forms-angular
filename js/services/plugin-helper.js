'use strict';

/*
  A helper service to provide a starting off point for directive plugins
 */

formsAngular.factory('pluginHelper', ['formMarkupHelper',function (formMarkupHelper) {
  var exports = {};

  exports.extractFromAttr = function (attr, directiveName) {
    var info = {};
    var directiveOptions = {};
    var directiveNameLength = directiveName.length;
    for (var prop in attr) {
      if (attr.hasOwnProperty(prop)) {
        if (prop.slice(0, 6) === 'fngFld') {
          info[prop.slice(6).toLowerCase()] = attr[prop].replace(/&quot;/g,'"');
        } else  if (prop.slice(0,directiveNameLength) === directiveName) {
          directiveOptions[prop.slice(directiveNameLength).toLowerCase()] = attr[prop].replace(/&quot;/g,'"');
        }
      }
    }
    var options = {formStyle: attr.formstyle};
    return {info: info, options: options, directiveOptions: directiveOptions};
  };

  exports.buildInputMarkup = function (scope, model, info, options, addButtons, needsX, generateInputControl) {
    var fieldChrome = formMarkupHelper.fieldChrome(scope, info, options,' id="cg_' + info.id + '"');
    var controlDivClasses = formMarkupHelper.controlDivClasses(options);
    var elementHtml = fieldChrome.template + formMarkupHelper.label(scope, info, addButtons, options);
    var buildingBlocks;
    if (addButtons) {
      buildingBlocks = formMarkupHelper.allInputsVars(scope, info, options, 'arrayItem' + (needsX ? '.x' : ''), info.id + '_{{$index}}', info.name + '_{{$index}}');
    } else {
      buildingBlocks = formMarkupHelper.allInputsVars(scope, info, options, model + '.' + info.name, info.id, info.name);
    }
    elementHtml += formMarkupHelper['handle' + (addButtons ? 'Array' : '') + 'InputAndControlDiv'](
      formMarkupHelper.inputChrome(
        generateInputControl(buildingBlocks),
        info,
        options,
        buildingBlocks),
        controlDivClasses,
        info,
        options);
    elementHtml += fieldChrome.closeTag;
    return elementHtml;
  };

  exports.findIdInSchemaAndFlagNeedX = function(scope, id) {
    // Find the entry in the schema of scope for id and add a needsX property so string arrays are properly handled
    var foundIt = false;

    for (var i = 0; i < scope.length; i++) {
      var element = scope[i];
      if (element.id === id) {
        element.needsX = true;
        foundIt = true;
        break;
      } else if (element.schema) {
        if (exports.findIdInSchemaAndFlagNeedX(element.schema, id)) {
          foundIt = true;
          break;
        }
      }
    }
    return foundIt;
  };

  return exports;
}]);
