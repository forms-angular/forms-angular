/// <reference path="../../index.d.ts" />

module fng.services {

  /*@ngInject*/
  export function formMarkupHelper(cssFrameworkService, inputSizeHelper, addAllService, securityService: fng.ISecurityService, $filter) {

      function generateNgShow(showWhen, model) {

        function evaluateSide(side) {
          var result = side;
          if (typeof side === 'string') {
            if (side.slice(0, 1) === '$') {
              result = (model || 'record') + '.';
              var parts = side.slice(1).split('.');
              if (parts.length > 1) {
                var lastBit = parts.pop();
                result += parts.join('.') + '[$index].' + lastBit;
              } else {
                result += side.slice(1);
              }
            } else {
              result = '\'' + side + '\'';
            }
          }
          return result;
        }

        var conditionText = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
          conditionSymbols = ['===', '!==', '>', '>=', '<', '<='],
          conditionPos = conditionText.indexOf(showWhen.comp);

        if (conditionPos === -1) {
          throw new Error('Invalid comparison in showWhen');
        }
        return evaluateSide(showWhen.lhs) + conditionSymbols[conditionPos] + evaluateSide(showWhen.rhs);
      }

      var isHorizontalStyle = function isHorizontalStyle(formStyle, includeStacked: boolean) {
        let exclude = ['vertical', 'inline'];
        if (!includeStacked) {
          exclude.push('stacked');
        }
        return (!formStyle || formStyle === 'undefined' || !exclude.includes(formStyle));
      };

      function glyphClass() {
        return (cssFrameworkService.framework() === 'bs2' ? 'icon' : 'glyphicon glyphicon');
      }

      // Generate an attribute that could be added to element(s) representing the field with the given
      // parameters to enable or disable it according to the prevailing security rules.
      // This function is a more complicated version of securityService.generateDisabledAttr, also taking into
      // account the fact that fieldInfo.readonly can influence the disabled state of a field.
      // nonUniqueId should be required only in cases where a sub-sub schema has been defined in a directive
      // as a means of getting around the single-level-of-nesting limitation.  in that case, where the
      // directive's template then includes a <form-input> tag, it is likely that the ids of the sub-sub-schema
      // elements will include $index from a parent scope (responsible for the sub-schema) in order to
      // ensure its uniqueness, and in this case (as we are not explicitely managing the addition of the
      // {{ $index }} expr), we need to be given a version of the id that does not include that expression.
      // where nonUniqueId is provided, we will also use this for determining ancestors, because in the
      // nested sub-schema scenario described above, the names of the fields in the sub-sub-schema will
      // probably not identify the full ancestry.
      function handleReadOnlyDisabled(partialFieldInfo: { name: string, id?: string, nonUniqueId?: string, readonly?: boolean | string }, scope: fng.IFormScope): string {
        if (partialFieldInfo.readonly && typeof partialFieldInfo.readonly === "boolean") {
          // if we have a true-valued readonly property then this trumps whatever security rule might apply to this field
          return " disabled ";
        }
        function wrapReadOnly(): string {
          return partialFieldInfo.readonly ? ` ng-disabled="${partialFieldInfo.readonly}" ` : "";
        }
        const id = partialFieldInfo.nonUniqueId || partialFieldInfo.id;
        if (!id || !securityService.canDoSecurityNow(scope)) {
          // no security, so we're just concerned about what value fieldInfo.readonly has
          return wrapReadOnly();
        }
        let ancestors: string[];
        // if we have been provided with a nonUniqueId, we should use that to determine ancestors, because in this case,
        // the name will not be reliable
        if (partialFieldInfo.nonUniqueId) {
          let ancestorStr = partialFieldInfo.nonUniqueId.startsWith("f_") ? partialFieldInfo.nonUniqueId.substring(2) : partialFieldInfo.nonUniqueId;
          ancestors = ancestorStr.split("_");
        } else {
          ancestors = partialFieldInfo.name.split(".");
        }
        ancestors.pop();
        let ancestorIds: string[] = [];
        while (ancestors.length > 0) {
          ancestorIds.push(`f_${ancestors.join("_")}`);
          ancestors.pop();
        }
        if (formsAngular.elemSecurityFuncBinding === "instant") {
          // "instant" security is evaluated now, and a positive result trumps whatever fieldInfo.readonly might be set to
          if (scope.isSecurelyDisabled(id)) {
            return " disabled ";
          } else {
            for (const ancestorId of ancestorIds) {
              if (scope.requiresDisabledChildren(ancestorId)) {
                return " disabled ";
              }
            }
            return wrapReadOnly();
          }
        }
        let securityFuncStr = `isSecurelyDisabled('${id}')`;
        if (ancestorIds.length > 0) {
          const ancestorStr = ancestorIds.map((aid) => `requiresDisabledChildren('${aid}')`);
          securityFuncStr = `(${securityFuncStr} || ${ancestorStr.join(" || ")})`;
        }
        const oneTimeBinding = formsAngular.elemSecurityFuncBinding === "one-time";
        if (partialFieldInfo.readonly) {
          // we have both security and a read-only attribute to deal with
          if (oneTimeBinding) {
            // if our field has a string-typed readonly attribute *and* one-time binding is required by our securityFunc, we
            // cannot simply combine these into a single ng-disabled expression, because the readonly property is highly
            // likely to be model-dependent and therefore cannot use one-time-binding.  the best we can do in this case is
            // to use ng-disabled for the field's readonly property, and a one-time-bound ng-readonly for the securityFunc.
            // this is not perfect, because in the case of selects, ng-readonly doesn't actually prevent the user from
            // making a selection.  however, the select will be styled as if it is disabled (including the not-allowed
            // cursor), which should deter the user in most cases.  
            return wrapReadOnly() + `ng-readonly="::${securityFuncStr}" `;    
          } else {
            // if we have both things and we are *NOT* required to use one-time binding for the securityFunc, then they can
            // be combined into a single ng-disabled expression
            return ` ng-disabled="${securityFuncStr} || ${partialFieldInfo.readonly}" `;    
          }
        } else {
          // we have security only
          return ` ng-disabled="${oneTimeBinding ? "::" : ""}${securityFuncStr}" `;
        }
      }

      function generateArrayElementIdString(idString: string, info: fng.IFormInstruction, options: fng.IFormOptions): string {
        if (options.subschema && options.model) {
          // for subschemas, it is possible that our model will begin with $parent., or $parent.$parent. (etc).  though a bit of 
          // a hack where this does occur (probably where a directive used by a sub-schema is using a nested <form-input>
          // directive), we need to look for the $index in the same place as our model is looking for data.
          let model = options.model;
          let nestedSteps = 0;
          const stepIndicator = "$parent.";
          while (model.startsWith(stepIndicator)) {
            nestedSteps++;
            model = model.substring(stepIndicator.length);
          }
          return `${idString}_{{${stepIndicator.repeat(nestedSteps)}$index}}`;
        } else {
          return `${idString}_{{$index}}`;
        }        
      }

      function isArrayElement(scope: angular.IScope, info: fng.IFormInstruction, options: fng.IFormOptions): boolean {
        return scope["$index"] !== undefined || !!options.subschema;
      }

      return {
        isHorizontalStyle: isHorizontalStyle,

        isArrayElement,

        fieldChrome: function fieldChrome(scope: fng.IFormScope, info: fng.IFormInstruction, options: fng.IFormOptions): { omit?: boolean, template?: string, closeTag?: string } {
          var insert = '';

          if (info.id && typeof info.id.replace === "function") {
            let uniqueIdStr = info.nonUniqueId || info.nonuniqueid || info.id;
            let idStr: string;
            // replace any . that appear in info.id with "-", but not those that appear between {{ and }}
            if (info.id.includes(".") && info.id.includes("{{")) {
              idStr = "cg_";
              let inExpr = false;
              for (let i = 0; i < info.id.length; i++) {
                if (info.id[i] === "{" && info.id[i-1] === "{") {
                  inExpr = true;
                } else if (info.id[i] === "}" && info.id[i-1] === "}") {
                  inExpr = false;
                }
                if (inExpr || info.id[i] !== ".") {
                  idStr += info.id[i];
                } else {
                  idStr += "-";
                }
              }
            } else {
                idStr = "cg_".concat(info.id.replace(/\./g, '-'));
            }
            uniqueIdStr = `cg_${uniqueIdStr.replace(/\./g, '-')}`;
            const visibility = securityService.considerVisibility(uniqueIdStr, scope);
            if (visibility.omit) {
              // we already know this field should be invisible, so we needn't add anything for it
              return { omit: true };
            }
            insert += `id="${isArrayElement(scope, info, options) ? generateArrayElementIdString(idStr, info, options) : idStr}"`;
            if (visibility.visibilityAttr) {
              // an angular expression to determine the visibility of this field later...
              insert += ` ${visibility.visibilityAttr}`;
            }
          }
          
          var classes = info.classes || '';
          var template = '';
          var closeTag = '';

          info.showWhen = info.showWhen || info.showwhen;  //  deal with use within a directive

          if (info.showWhen) {
            if (typeof info.showWhen === 'string') {
              insert += ' ng-show="' + info.showWhen + '"';
            } else {
              insert += ' ng-show="' + generateNgShow(info.showWhen, options.model) + '"';
            }
          }

          if (cssFrameworkService.framework() === 'bs3') {
            classes += ' form-group';
            if (options.formstyle === 'vertical' && info.size !== 'block-level') {
              template += '<div class="row">';
              classes += ' col-sm-' + inputSizeHelper.sizeAsNumber(info.size);
              closeTag += '</div>';
            }

            var modelControllerName;
            var formName = null;
            var parts = info.name.split('.');

            if (options && typeof options.subkeyno !== 'undefined') {
              modelControllerName = options.subschemaroot.replace(/\./g, '-') + '-subkey' + options.subkeyno + '-' + parts[parts.length - 1];
            } else if (options.subschema) {
              formName = 'form_' + parts.slice(0, -1).join('_') + '$index';
              modelControllerName = info.name.replace(/\./g, '-');
            } else {
              modelControllerName = 'f_' + info.name.replace(/\./g, '_');
            }

            template += '<div' + addAllService.addAll(scope, 'Group', classes, options) + ' ng-class="{\'has-error\': hasError(\'' + formName + '\',\'' + modelControllerName + '\', $index)}"';
            closeTag += '</div>';
          } else {
            if (isHorizontalStyle(options.formstyle, true)) {
              template += '<div' + addAllService.addAll(scope, 'Group', 'control-group', options);
              closeTag = '</div>';
            } else {
              template += '<span ';
              closeTag = '</span>';
            }
          }
          template += (insert || '') + '>';
          return {template: template, closeTag: closeTag};
        },

        label: function label(scope: fng.IFormScope, fieldInfo: fng.IFormInstruction, addButtonMarkup: boolean, options: fng.IFormOptions) {
          var labelHTML = '';
          if ((cssFrameworkService.framework() === 'bs3' || (!['inline','stacked'].includes(options.formstyle) && fieldInfo.label !== '')) || addButtonMarkup) {
            labelHTML = '<label';
            var classes = 'control-label';
            if (isHorizontalStyle(options.formstyle, false)) {
              if (!fieldInfo.linklabel) {
                labelHTML += ' for="' + fieldInfo.id + '"';
              }
              if (typeof fieldInfo.labelDefaultClass !== 'undefined') {
                // Override default label class (can be empty)
                classes += ' ' + fieldInfo.labelDefaultClass;
              } else if (cssFrameworkService.framework() === 'bs3') {
                classes += ' col-sm-3';
              }
            } else if (['inline','stacked'].includes(options.formstyle)) {
              labelHTML += ' for="' + fieldInfo.id + '"';
              classes += ' sr-only';
            }
            labelHTML += addAllService.addAll(scope, 'Label', null, options) + ' class="' + classes + '">' + fieldInfo.label;
            if (addButtonMarkup) {
              const disableCond = handleReadOnlyDisabled(fieldInfo, scope);
              labelHTML += ` <i ${disableCond} id="add_${fieldInfo.id}" ng-click="add('${fieldInfo.name}', $event)" class="${glyphClass()}-plus-sign"></i>`;
            }
            labelHTML += '</label>';
            if (fieldInfo.linklabel) {
              let value: string = '<fng-link fld="' + fieldInfo.name + '" ref="' + fieldInfo.ref + '" text="' + escape(labelHTML) + '"' ;
              if (fieldInfo.form) {
                value += ' form="' + fieldInfo.form + '"';
              }
              if (fieldInfo.linktab) {
                value += ' linktab="' + fieldInfo.linktab + '"';
              }
              value += '></fng-link>';
              labelHTML = value;
            }
          }
          return labelHTML;
        },

        glyphClass,

        allInputsVars: function allInputsVars(scope: angular.IScope, fieldInfo: fng.IFormInstruction, options: fng.IFormOptions, modelString: string, idString: string, nameString: string): Partial<fng.IBuildingBlocks> {

          var placeHolder = fieldInfo.placeHolder;

          var common: string;
          var compactClass = '';
          var sizeClassBS3 = '';
          var sizeClassBS2 = '';
          var formControl = '';

          if (cssFrameworkService.framework() === 'bs3') {
            compactClass = (['horizontal', 'vertical', 'inline'].indexOf(options.formstyle) === -1) ? ' input-sm' : '';
            sizeClassBS3 = 'col-sm-' + inputSizeHelper.sizeAsNumber(fieldInfo.size);
            formControl = ' form-control';
          } else {
            sizeClassBS2 = (fieldInfo.size ? ' input-' + fieldInfo.size : '');
          }

          if (['inline','stacked'].includes(options.formstyle)) {
            placeHolder = placeHolder || fieldInfo.label;
          }
          common = 'data-ng-model="' + modelString + '"';
          if (idString) {
            common += ` id="${idString}"`;
          }
          if (nameString) {
            common += ` name="${nameString}"`;
          } else if (idString) {
            common += ` name="${idString}"`;
          }
          if (placeHolder) {
            common += ` placeholder="${placeHolder}"`;
          }
          if (fieldInfo.popup) {
            common += ` title="${fieldInfo.popup}"`;
          }
          if (fieldInfo.ariaLabel) {
            common += ` aria-label="${fieldInfo.ariaLabel}"`;
          }
          common += addAllService.addAll(scope, 'Field', null, options);
          return {
            common: common,
            sizeClassBS3: sizeClassBS3,
            sizeClassBS2: sizeClassBS2,
            compactClass: compactClass,
            formControl: formControl
          };
        },

        inputChrome: function inputChrome(value, fieldInfo: fng.IFormInstruction, options: fng.IFormOptions, markupVars) {
          if (cssFrameworkService.framework() === 'bs3' && isHorizontalStyle(options.formstyle, true) && fieldInfo.type !== 'checkbox') {
            value = '<div class="bs3-input ' + markupVars.sizeClassBS3 + '">' + value + '</div>';
          }
          // Hack to cope with inline help in directives
          var inlineHelp = (fieldInfo.helpInline || '') + (fieldInfo.helpinline || '');
          if (inlineHelp.length > 0) {
            let helpMarkup = cssFrameworkService.framework() === 'bs2' ? { el: 'span', cl: 'help-inline'} : {el: 'div', cl: 'help-block'};
            value += `<${helpMarkup.el} class="${helpMarkup.cl}">${inlineHelp}</${helpMarkup.el}>`;
          }
          // this is a dummy tag identifying where the input ends and the messages block (that is only visible when the form field is $dirty)
          // begins.  our caller could replace this tag with anything it needs to insert between these two things.
          value += "<dms/>";
          if (!options.noid) {
            value += `<div ng-if="${(options.name || 'myForm')}['${fieldInfo.id}'].$dirty" class="help-block">` +
                ` <div ng-messages="${(options.name || 'myForm')}['${fieldInfo.id}'].$error">` +
                '  <div ng-messages-include="error-messages.html">' +
                '  </div>' +
                ' </div>' +
                '</div>';
          }
          if (fieldInfo.help) {
            value += '<div class="help-block">' + fieldInfo.help + '</div>';
          }
          return value;
        },

        generateSimpleInput: function generateSimpleInput(common: string, fieldInfo: fng.IFormInstruction, options: fng.IFormOptions) {
          var result = '<input ' + common + 'type="' + fieldInfo.type + '" ';
          if (!fieldInfo.label && !fieldInfo.ariaLabel) {
            result += `aria-label="${fieldInfo.name.replace(/\./g,' ')}" `
          } else if (options.subschema) {
            result += `aria-label="${fieldInfo.label ? ($filter('titleCase')(options.subschemaroot) + ' ' + fieldInfo.label) : (fieldInfo.popup || fieldInfo.name.replace(/\./g,' '))}" `
          }
          if (options.formstyle === 'inline' && cssFrameworkService.framework() === 'bs2' && !fieldInfo.size) {
            result += 'class="input-small"';
          }
          result += ' />';
          return result;
        },

        controlDivClasses: function controlDivClasses(options: fng.IFormOptions) {
          var result = [];
          if (isHorizontalStyle(options.formstyle, false)) {
            result.push(cssFrameworkService.framework() === 'bs2' ? 'controls' : 'col-sm-9');
          }
          return result;
        },

        handleInputAndControlDiv: function handleInputAndControlDiv(inputMarkup: string, controlDivClasses: string[]): string {
          if (controlDivClasses.length > 0) {
            inputMarkup = '<div class="' + controlDivClasses.join(' ') + '">' + inputMarkup + '</div>';
          }
          return inputMarkup;
        },

        handleArrayInputAndControlDiv: function handleArrayInputAndControlDiv(inputMarkup: string, controlDivClasses: string[], scope: fng.IFormScope, info: fng.IFormInstruction, options: fng.IFormOptions): string {
          let indentStr = cssFrameworkService.framework() === 'bs3' ? 'ng-class="skipCols($index)" ' : "";
          const arrayStr = (options.model || 'record') + '.' + info.name;
          let result = "";
          result += '<div id="' + info.id + 'List" class="' + controlDivClasses.join(' ') + '" ' + indentStr + ' ng-repeat="arrayItem in ' + arrayStr + ' track by $index">';
          const disableCond = handleReadOnlyDisabled(info, scope);
          const removeBtn = info.type !== 'link'
            ? `<i ${disableCond} ng-click="remove('${info.name}', $index, $event)" id="remove_${info.id}_{{$index}}" class="${glyphClass()}-minus-sign"></i>`
            : "";
          result += inputMarkup.replace("<dms/>", removeBtn);
          result += '</div>';
          indentStr = cssFrameworkService.framework() === 'bs3' ? 'ng-class="skipCols(' + arrayStr + '.length)" ' : "";
          if (info.help) {
              result += '<div class="array-help-block ' + controlDivClasses.join(' ') + '" ' + indentStr + ' id="empty' + info.id + 'ListHelpBlock">' + info.help + '</div>';
          }
          return result;
        },

        addTextInputMarkup: function addTextInputMarkup(allInputsVars, fieldInfo, requiredStr) {
          var result = '';
          var setClass = allInputsVars.formControl.trim() + allInputsVars.compactClass + allInputsVars.sizeClassBS2 + (fieldInfo.class ? ' ' + fieldInfo.class : '');
          if (setClass.length !== 0) {
            result += 'class="' + setClass + '"';
          }
          if (fieldInfo.add) {
            result += ' ' + fieldInfo.add + ' ';
          }
          result += requiredStr;
          return result;
        },

        handleReadOnlyDisabled,

        generateArrayElementIdString
      }
    }
}
