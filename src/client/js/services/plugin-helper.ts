/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.services {
  /*
   A helper service to provide a starting off point for directive plugins
   */

  /*@ngInject*/
  export function pluginHelper(formMarkupHelper) {
    return {
      extractFromAttr: function extractFromAttr(attr, directiveName) {

        function deserialize(str) {
          var retVal = str.replace(/&quot;/g, '"')
          if (retVal === 'true') {
            retVal = true;
          } else if (retVal === 'false') {
            retVal = false;
          } else if (!isNaN(parseFloat(retVal)) && isFinite(retVal)) {
            retVal = parseFloat(retVal);
          }
          return retVal;
        }

        var info = {};
        var options = {formStyle: attr.formstyle};
        var directiveOptions = {};
        var directiveNameLength = directiveName ? directiveName.length : 0;
        const lcDirectiveName = directiveName?.toLowerCase();
        for (var prop in attr) {
          if (attr.hasOwnProperty(prop)) {
            const lcProp = prop.toLowerCase();
            if (lcProp.slice(0, 6) === 'fngfld') {
              info[lcProp.slice(6)] = deserialize(attr[prop]);
            } else if (lcProp.slice(0, 6) === 'fngopt') {
              options[lcProp.slice(6)] = deserialize(attr[prop]);
            } else if (directiveName && lcProp.slice(0, directiveNameLength) === lcDirectiveName) {
              directiveOptions[_.kebabCase(prop.slice(directiveNameLength))] = deserialize(attr[prop]);
            }
          }
        }
        return {info: info, options: options, directiveOptions: directiveOptions};
      },
      buildInputMarkup: function buildInputMarkup(scope, model, info, options, addButtons, needsX, generateInputControl) {
        var fieldChrome = formMarkupHelper.fieldChrome(scope, info, options, ' id="cg_' + info.id + '"');
        var controlDivClasses = formMarkupHelper.controlDivClasses(options);
        var elementHtml = fieldChrome.template + formMarkupHelper.label(scope, info, addButtons, options);
        var modelString, idString, nameString;

        if (addButtons) {
          modelString = 'arrayItem' + (needsX ? '.x' : '');
          idString = info.id + '_{{$index}}';
          nameString = info.name + '_{{$index}}';
        } else {
          modelString = model + '.' + info.name;
          idString = info.id;
          nameString = info.name;
        }

        if (options.subschema && info.name.indexOf('.') !== -1) {
          // Schema handling - need to massage the ngModel and the id
          var modelBase = model + '.';
          var compoundName = info.name;
          var root = options.subschemaroot;
          var lastPart = compoundName.slice(root.length + 1);
          modelString = modelBase;

          if (options.index) {
            modelString += root + '[' + options.index + '].' + lastPart;
            idString = 'f_' + modelString.slice(modelBase.length).replace(/(\.|\[|\]\.)/g, '-');
          } else {
            modelString += root;
            if (options.subkey) {
              idString = modelString.slice(modelBase.length).replace(/\./g, '-') + '-subkey' + options.subkeyno + '-' + lastPart;
              modelString += '[' + '$_arrayOffset_' + root.replace(/\./g, '_') + '_' + options.subkeyno + '].' + lastPart;
            } else {
              modelString += '[$index].' + lastPart;
              nameString = compoundName.replace(/\./g, '-');
              // this used to be set to null, presumably because it was considered necessary for the id to be completely
              // unique.  however, that isn't strictly necessary, and to enable security rules to be based upon element ids,
              // we want there always to be one (and *not* based upon $index or similar)
              idString = idString || `f_${nameString}`;
            }
          }
        }
        var buildingBlocks: any = formMarkupHelper.allInputsVars(scope, info, options, modelString, idString, nameString);
        buildingBlocks.modelString = modelString;

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
      },
      findIdInSchemaAndFlagNeedX: function findIdInSchemaAndFlagNeedX(scope, id) {
        // Find the entry in the schema of scope for id and add a needsX property so string arrays are properly handled
        var foundIt = false;

        for (var i = 0; i < scope.length; i++) {
          var element = scope[i];
          if (element.id === id) {
            element.needsX = true;
            foundIt = true;
            break;
          } else if (element.schema) {
            if (findIdInSchemaAndFlagNeedX(element.schema, id)) {
              foundIt = true;
              break;
            }
          }
        }
        return foundIt;
      },
      handleReadOnlyDisabled: function handleReadOnlyDisabled(id, attr) {
        return formMarkupHelper.handleReadOnlyDisabled({ id, readonly: attr.fngFldReadonly });
      },
    };
  }
}
