/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.services {
  /*
   A helper service to provide a starting off point for directive plugins
   */

  /*@ngInject*/
  export function PluginHelperService(FormMarkupHelperService: fng.IFormMarkupHelperService): IPluginHelperService {
    function internalGenDisabledAttrs(scope: fng.IFormScope, id: string, processedAttrs: fng.IProcessedAttrs, idSuffix: string, params?: fng.IGenDisableStrParams): string[] {
      // Though id will already have the value of idSuffix appended, processedAttrs.info.name will not.
      // For handleReadOnlyDisabled() to disable "sub-elements" included in a directive template with an idsuffix when their
      // 'parent' field is disabled, we need the name to include that suffix as if it were an additional level
      // of field nesting.
      let name = processedAttrs.info.name;
      if (idSuffix) {
        if (params?.nonUniqueIdSuffix) {
          // Generally, when genIdAndDisabledStr is called from a directive, the idSuffix will be something like "select"
          // or "hasValueCheckbox" (thus enabling a single directive to create a template that includes more than one form
          // element - such as a checkbox and an input - each of which has a unique id).
          // Where a directive is responsible for creating markup for an whole array of elements, it is likely to include an
          // ng-repeat in the template that it generates, and in this case, the idSuffix that it passes to genIdAndDisabledStr
          // will probably include a reference to $index to ensure uniqueness.
          // Where idSuffix /does/ contain a reference to $index, the directive should provide a version of the idSuffix
          // in the params object which does NOT include this.
          // This is what we need to use for the ng-disabled/ng-readonly expression.
          // (ReallyCare development hint: for an example of where this is needed, see or-opts.ts.)
          id = id.replace(idSuffix, params.nonUniqueIdSuffix);
          name += `.${params.nonUniqueIdSuffix}`;
        } else {
          name += `.${idSuffix}`;
        }
      }      
      const attrs: string[] = FormMarkupHelperService.handleReadOnlyDisabled(
        {
          id,
          name,
          nonUniqueId: processedAttrs.info.nonuniqueid,
          readonly: processedAttrs.info.readonly
        },
        scope
      );
      // some types of control (such as ui-select) don't deal correctly with a DISABLED attribute and
      // need ng-disabled, even when the expression is simply "true"
      if (params?.forceNg) {
        for (let i = 0; i < attrs.length; i++) {
          if (attrs[i].toLowerCase().trim() === "disabled") {
            attrs[i] = 'ng-disabled="true"';
          }
        }
      }
      return attrs;
    }

    function internalGenDisabledStr(scope: fng.IFormScope, id: string, processedAttrs: fng.IProcessedAttrs, idSuffix: string, params?: fng.IGenDisableStrParams): string {
      return internalGenDisabledAttrs(scope, id, processedAttrs, idSuffix, params).join(" ");
    }

    // text surrounded by @@ @@ is assumed to be something that can have a pseudonym.  We'll rely
    // upon the relevant controller assigning a pseudo() function to baseScope.
    function handlePseudos(str: string): string {
      if (!str) {
        return str;
      }
      let result = str;
      while (result.includes("@@")) {
        result = result.replace("@@", "{{ baseScope.pseudo('");
        result = result.replace("@@", "', true) }}");
      }
      return result;
    }

    function makeIdStringUniqueForArrayElements(scope: fng.IFormScope, processedAttrs: fng.IProcessedAttrs, idString: string): string {
      if (FormMarkupHelperService.isArrayElement(scope, processedAttrs.info, processedAttrs.options)) {
        return FormMarkupHelperService.generateArrayElementIdString(idString, processedAttrs.info, processedAttrs.options);
      } else {
        return idString;
      }
    }

    function internalGenIdString(scope: fng.IFormScope, processedAttrs: fng.IProcessedAttrs, suffix: string, makeUniqueForArrayElements: boolean): string {
      let result = processedAttrs.info.id;
      if (suffix) {
        if (!suffix.startsWith("_")) {
          result += "_";
        }
        result += suffix;
      }
      if (makeUniqueForArrayElements) {
        result = makeIdStringUniqueForArrayElements(scope, processedAttrs, result);
      }
      return result;
    }

    function internalGenDateTimePickerDisabledStr(scope: fng.IFormScope, processedAttrs: fng.IProcessedAttrs, idSuffix: string, idString: string) {
      const rawDisabledAttrs = internalGenDisabledAttrs(scope, idString, processedAttrs, idSuffix, { forceNg: true });
      // first, we need to convert the 'disabled' attribute(s) (those which might actually cause the element to be
      // disabled - found in rawDisabledAttrs[0]) into something that the datetime picker understands.
      let rawDisabledStr = rawDisabledAttrs[0];
      let disabledStr = "";
      // disabledStr might now include an ng-disabled attribute.  To disable both the date and time inputs, we need to
      // take the value of that attribute and wrap it up as two new attributes: "disabledDate" and "readonlyTime"
      // (which is what the datetimepicker directive is expecting to receive)
      if (rawDisabledStr) {
        // disabledStr should contain either 'ng-disabled="xxxx"' or 'ng-readonly="yyyy"', or both.
        // the values of xxxx and yyyy could be more-or-less anything, and certainly they could include = or ", which
        // makes parsing hard
        // our strategy will be to re-format disabledStr as if it was the string representation of an object, and
        // then parse it.  we can then refer to the ng-disabled and ng-readonly attributes of the parsed object.
        // in the future, perhaps ng-disabled and ng-readonly will be changed to data-ng-disabled and data-ng-readonly
        rawDisabledStr = rawDisabledStr.replace("data-ng-disabled", "ng-disabled");
        rawDisabledStr = rawDisabledStr.replace("data-ng-readonly", "ng-readonly");
        rawDisabledStr = rawDisabledStr.replace("ng-disabled=", '"ng-disabled":');
        rawDisabledStr = rawDisabledStr.replace("ng-readonly=", '"ng-readonly":');
        try {
          rawDisabledStr = `{ ${rawDisabledStr} }`;
          const disabledObj = JSON.parse(rawDisabledStr);
          rawDisabledStr = disabledObj["ng-disabled"];
          // cannot see a way to sensibly deal with both ng-disabled and ng-readonly.  Let's just ignore the ng-readonly
          // for now - with the way handleReadOnlyDisabled is currently written, this means we'll be unable to fully
          // support a datetime field with a string-typed "readonly" attribute and where fngAngular's elemSecurityFuncBinding
          // option is set up to "one-time" or "normal".
          if (rawDisabledStr) {
            disabledStr = `disabledDate="${rawDisabledStr}" readonlyTime="${rawDisabledStr}"`;
          }
        } catch (e) {
          // give up
        }
      }
      // finally, we should add the 'disableable' attribute(s), which might be present in rawDisabledAttrs[1] (regardless
      // of whether or not the datetime picker is actually disabled) to indicate that it potentially could be
      return disabledStr + " " + rawDisabledAttrs[1];
    }

    function extractFromAttr(attr, directiveName: string): fng.IProcessedAttrs {
      function deserialize(str: string) {
        var retVal = str.replace(/&quot;/g, '"');
        if (retVal === "true") {
          return true;
        } else if (retVal === "false") {
          return false;
        } else {
          const num = parseFloat(retVal);
          if (!isNaN(num) && isFinite(num)) {
            return num;
          } else {
            return retVal;
          }
        }        
      }

      var info = {} as Partial<IFormInstruction>;
      var options = { formStyle: attr.formstyle } as IFormOptions;
      var directiveOptions = {};
      var directiveNameLength = directiveName ? directiveName.length : 0;
      const lcDirectiveName = directiveName?.toLowerCase();
      for (var prop in attr) {
        if (attr.hasOwnProperty(prop)) {
          const lcProp = prop.toLowerCase();
          if (lcProp.slice(0, 6) === "fngfld") {
            info[lcProp.slice(6)] = deserialize(attr[prop]);
          } else if (lcProp.slice(0, 6) === "fngopt") {
            options[lcProp.slice(6)] = deserialize(attr[prop]);
          } else if (directiveName && lcProp.slice(0, directiveNameLength) === lcDirectiveName) {
            directiveOptions[_.kebabCase(prop.slice(directiveNameLength))] = deserialize(attr[prop]);
          }
        }
      }
      const result = { info: info as IFormInstruction, options: options as IFormOptions, directiveOptions };
      // any part of the help text or label that is surrounded by @@ @@ is assumed to be something that can have
      // a pseudonym.  We'll be relying upon the parent controller assigning a pseudo() function to baseScope to
      // actually perform the translation.
      // TODO - do this better when fng is re-written!
      result.info.help = handlePseudos(result.info.help);
      result.info.label = handlePseudos(result.info.label);
      return result;
    }

    function genIdAndDisabledStr(scope: fng.IFormScope, processedAttrs: fng.IProcessedAttrs, idSuffix: string, params?: fng.IGenDisableStrParams): string {
      const idStr = internalGenIdString(scope, processedAttrs, idSuffix, false);
      const uniqueIdStr = makeIdStringUniqueForArrayElements(scope, processedAttrs, idStr);
      return `id="${uniqueIdStr}" ${internalGenDisabledStr(scope, idStr, processedAttrs, idSuffix, params)}`;
    }

    return {
      extractFromAttr,

      buildInputMarkup: function buildInputMarkup(
        scope: fng.IFormScope,
        attrs: any,
        params: {
          // most directives will need access to the processed attributes, so will have already called
          // extractFromAttr by the time buildInputMarkup is called.  In this case, they can pass in the processedAttrs
          // to avoid duplication of effort.
          processedAttrs?: fng.IProcessedAttrs,
          // The generated markup will be heavily based upon processedAttrs.info.  For properties of this object for
          // which alternative values should be used, provide these here.  For example, override the label by passing
          // fieldInfoOverrides: { label: "Something else" }
          fieldInfoOverrides?: Partial<IFormInstruction>,
          // If the properties of processedAttrs.info should NOT be used at all - with the provided fieldInfoOverrides
          // being the only form instructions that should be used to generate the markup - then pass a value of true
          // here.
          ignoreFieldInfoFromAttrs?: boolean,
          // Some aspects of the generated markup will be dependent upon values of processedAtts.options.  For 
          // properties of this object for which alternative values should be used, provide these here.
          optionOverrides?: Partial<IFormOptions>,
          // Should a "+" (add) button appear alongside the field label, and "-" (remove) buttons alongside each
          // of the values of this (assumed-to-be) array field?  
          addButtons?: boolean,
          // Do the field values need to be formatted as { x: value }?  This is only necessary for an array field with
          // simple (string / date / number) values, which cannot otherwise be used as the model due to the fact that
          // models can only be named object properties.
          needsX?: boolean,
        },
        generateInputControl: (buildingBlocks: fng.IBuildingBlocks) => string,
      ): string {
        const processedAttrs = params.processedAttrs || extractFromAttr(attrs, "");
        const info: Partial<IFormInstruction> = {};
        if (!params.ignoreFieldInfoFromAttrs) {
          Object.assign(info, processedAttrs.info);
        }
        if (params.fieldInfoOverrides) {
          Object.assign(info, params.fieldInfoOverrides);
        }
        const options = Object.assign({}, processedAttrs.options, params.optionOverrides);
        const fieldChrome = FormMarkupHelperService.fieldChrome(scope, info as IFormInstruction, options);
        if (fieldChrome.omit) {
          return "";
        }
        const controlDivClasses = FormMarkupHelperService.controlDivClasses(options);
        let elementHtml = fieldChrome.template + FormMarkupHelperService.label(scope, info as IFormInstruction, params.addButtons, options);
        let idString = info.id;
        if (info.array || options.subschema) {
          idString = FormMarkupHelperService.generateArrayElementIdString(idString, info as IFormInstruction, options);
        }
        let modelString = params.addButtons
          ? "arrayItem" + (params.needsX ? ".x" : "")
          : attrs.model + "." + info.name;
        let nameString = info.name;
        if (options.subschema && info.name.indexOf(".") !== -1) {
          // Schema handling - need to massage the ngModel and the id
          const modelBase = attrs.model + ".";
          const root = options.subschemaroot;
          const lastPart = info.name.slice(root.length + 1);
          modelString = modelBase + root;
          if (options.subkey) {
            idString = modelString.slice(modelBase.length).replace(/\./g, "-") + "-subkey" + options.subkeyno + "-" + lastPart;
            modelString += "[" + "$_arrayOffset_" + root.replace(/\./g, "_") + "_" + options.subkeyno + "]." + lastPart;
          } else {
            modelString += "[$index]." + lastPart;
            nameString = info.name.replace(/\./g, "-");
          }
        }
        const buildingBlocks: Partial<fng.IBuildingBlocks> = FormMarkupHelperService.allInputsVars(
          scope,
          info as IFormInstruction,
          options,
          modelString,
          idString,
          nameString,
        );
        buildingBlocks.modelString = modelString;
        buildingBlocks.disableableAncestorStr = FormMarkupHelperService.genDisableableAncestorStr(info.id);
        // defer to the calling directive to generate the markup for the input(s)
        const inputHtml = generateInputControl(buildingBlocks as fng.IBuildingBlocks);
        // wrap this in a div that puts it into the correct bootstrap 'column' and adds validation messages and help text
        const wrappedInputHtml = FormMarkupHelperService.inputChrome(inputHtml, info as IFormInstruction, options, buildingBlocks);
        // further wrap this to add the control div classes, and in the case of an array, the button that allows array elements to be removed
        if (params.addButtons) {
          elementHtml += FormMarkupHelperService.handleArrayInputAndControlDiv(wrappedInputHtml, controlDivClasses, scope, info as IFormInstruction, options);
        } else {
          elementHtml += FormMarkupHelperService.handleInputAndControlDiv(wrappedInputHtml, controlDivClasses);
        }
        elementHtml += fieldChrome.closeTag;
        return elementHtml;
      },

      genIdString: function genIdString(scope: fng.IFormScope, processedAttrs: fng.IProcessedAttrs, idSuffix: string): string {
        return internalGenIdString(scope, processedAttrs, idSuffix, true);
      },

      genDisabledStr: function genDisabledStr(scope: fng.IFormScope, processedAttrs: fng.IProcessedAttrs, idSuffix: string, params?: fng.IGenDisableStrParams): string {
        const idString = internalGenIdString(scope, processedAttrs, idSuffix, false);
        return internalGenDisabledStr(scope, idString, processedAttrs, idSuffix, params);
      },

      genIdAndDisabledStr,

      genDateTimePickerDisabledStr: function genDateTimePickerDisabledStr(scope: fng.IFormScope, processedAttrs: fng.IProcessedAttrs, idSuffix: string): string {
        const idString = internalGenIdString(scope, processedAttrs, idSuffix, false);
        return internalGenDateTimePickerDisabledStr(scope, processedAttrs, idSuffix, idString);
      },

      genDateTimePickerIdAndDisabledStr: function genDateTimePickerIdAndDisabledStr(scope: fng.IFormScope, processedAttrs: fng.IProcessedAttrs, idSuffix: string): string {
        const idStr = internalGenIdString(scope, processedAttrs, idSuffix, false);
        const uniqueIdStr = makeIdStringUniqueForArrayElements(scope, processedAttrs, idStr);
        return `id="${uniqueIdStr}" ${internalGenDateTimePickerDisabledStr(scope, processedAttrs, idSuffix, idStr)}`;
      },

      genUiSelectIdAndDisabledStr: function genUiSelectIdAndDisabledStr(scope: fng.IFormScope, processedAttrs: fng.IProcessedAttrs, idSuffix: string): string {
        // ui-select won't be disabled when a simple DISABLED attribute is provided - it requires
        // ng-disabled even when the value is simply "true"
        return genIdAndDisabledStr(scope, processedAttrs, idSuffix, { forceNg: true });
      },

      handlePseudos,

      genDisableableAncestorStr: function genDisableableAncestorStr(processedAttrs: fng.IProcessedAttrs): string {
        return FormMarkupHelperService.genDisableableAncestorStr(processedAttrs.info.id);
      }
    };
  }
}
