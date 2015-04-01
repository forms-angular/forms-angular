'use strict';

/*
  A helper service to provide a starting off point for directive plugins
 */

formsAngular.factory('pluginHelper', ['formMarkupHelper',function (formMarkupHelper) {
  var exports = {};

  exports.extractFromAttr = function (attr, directiveName) {
    var info = {};
    var options = {formStyle: attr.formstyle};
    var directiveOptions = {};
    var directiveNameLength = directiveName.length;
    for (var prop in attr) {
      if (attr.hasOwnProperty(prop)) {
        if (prop.slice(0, 6) === 'fngFld') {
          info[prop.slice(6).toLowerCase()] = attr[prop].replace(/&quot;/g, '"');
        } else if (prop.slice(0, 6) === 'fngOpt') {
          options[prop.slice(6).toLowerCase()] = attr[prop].replace(/&quot;/g,'"');
        } else  if (prop.slice(0,directiveNameLength) === directiveName) {
          directiveOptions[prop.slice(directiveNameLength).toLowerCase()] = attr[prop].replace(/&quot;/g,'"');
        }
      }
    }
    return {info: info, options: options, directiveOptions: directiveOptions};
  };

  exports.buildInputMarkup = function (scope, model, info, options, addButtons, needsX, generateInputControl) {
    var fieldChrome = formMarkupHelper.fieldChrome(scope, info, options,' id="cg_' + info.id + '"');
    var controlDivClasses = formMarkupHelper.controlDivClasses(options);
    var elementHtml = fieldChrome.template + formMarkupHelper.label(scope, info, addButtons, options);
    var modelString, idString, nameString;

    if (addButtons) {
      modelString = 'arrayItem' + (needsX ? '.x' : '');
      idString = info.id + '_{{$index}}';
      nameString =info.name + '_{{$index}}';
    } else {
      modelString = model + '.' + info.name;
      idString = info.id;
      nameString =info.name;
    }

    if (options.subschema && info.name.indexOf('.') !== -1) {
      // Schema handling - need to massage the ngModel and the id
      var modelBase = model + '.';
      var compoundName = info.name;
      var root = options.subschemaroot;
      var lastPart = compoundName.slice(root.length+1);
      modelString = modelBase;

      if (options.index) {
        modelString += root + '[' + options.index + '].' + lastPart;
        idString = 'f_' + modelString.slice(modelBase.length).replace(/(\.|\[|\]\.)/g, '-');
      } else {
        modelString += root;
        if (options.subkey) {
          idString = modelString.slice(modelBase.length).replace(/\./g, '-')+'-subkey'+options.subkeyno + '-' + lastPart;
          modelString += '[' + '$_arrayOffset_' + root.replace(/\./g, '_') + '_' + options.subkeyno + '].' + lastPart;
        } else {
          modelString += '[$index].' + lastPart;
          idString = null;
          nameString = compoundName.replace(/\./g, '-');
        }
      }
    }

    var buildingBlocks = formMarkupHelper.allInputsVars(scope, info, options, modelString, idString, nameString);

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
