/// <reference path="../../index.d.ts" />

module fng.directives {

  enum tabsSetupState {Y, N, Forced}

  /*@ngInject*/
  export function formInput(
    $compile: angular.ICompileService,
    $rootScope: angular.IRootScopeService,
    $filter,
    $timeout: angular.ITimeoutService,
    CssFrameworkService: fng.ICssFrameworkService,
    FormGeneratorService: fng.IFormGeneratorService,
    FormMarkupHelperService: fng.IFormMarkupHelperService,
    SecurityService: fng.ISecurityService
  ): angular.IDirective {
    return {
      restrict: 'EA',
      link: function (scope:fng.IFormScope, element, attrs:fng.IFormAttrs) {
//                generate markup for bootstrap forms
//
//                Bootstrap 3
//                Horizontal (default)
//                <div class="form-group">
//                    <label for="inputEmail3" class="col-sm-2 control-label">Email</label>
//                    <div class="col-sm-10">
//                        <input type="email" class="form-control" id="inputEmail3" placeholder="Email">
//                    </div>
//                 </div>
//
//                Vertical
//                <div class="form-group">
//                    <label for="exampleInputEmail1">Email address</label>
//                    <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Enter email">
//                </div>
//
//                Inline or stacked
//                <div class="form-group">
//                    <label class="sr-only" for="exampleInputEmail2">Email address</label>
//                    <input type="email" class="form-control" id="exampleInputEmail2" placeholder="Enter email">
//                </div>

//                Bootstrap 2
//                Horizontal (default)
//                <div class="control-group">
//                    <label class="control-label" for="inputEmail">Email</label>
//                    <div class="controls">
//                        <input type="text" id="inputEmail" placeholder="Email">
//                    </div>
//                </div>
//
//                Vertical
//                <label>Label name</label>
//                <input type="text" placeholder="Type something…">
//                <span class="help-block">Example block-level help text here.</span>
//
//                Inline or Stacked
//                <input type="text" class="input-small" placeholder="Email">

        var subkeys = [];
        var tabsSetup:tabsSetupState = tabsSetupState.N;

        var generateInput = function (fieldInfo, modelString, isRequired, options) {

          function generateEnumInstructions() : IEnumInstruction{
            var enumInstruction:IEnumInstruction;
            if (Array.isArray(scope[fieldInfo.options])) {
              enumInstruction = {repeat: fieldInfo.options, value: 'option'};
            } else if (scope[fieldInfo.options] && Array.isArray(scope[fieldInfo.options].values)) {
              if (Array.isArray(scope[fieldInfo.options].labels)) {
                enumInstruction = {
                  repeat: fieldInfo.options + '.values',
                  value: fieldInfo.options + '.values[$index]',
                  label: fieldInfo.options + '.labels[$index]'
                };
              } else {
                enumInstruction = {
                  repeat: fieldInfo.options + '.values',
                  value: fieldInfo.options + '.values[$index]'
                };
              }
            } else {
              throw new Error('Invalid enumeration setup in field ' + fieldInfo.name);
            }
            return enumInstruction;
          }

          let idString = fieldInfo.id;
          if (fieldInfo.array || options.subschema) {
            idString = FormMarkupHelperService.generateArrayElementIdString(idString, fieldInfo, options);
          }
          let nameString: string;
          if (!modelString) {
            var modelBase = (options.model || 'record') + '.';
            modelString = modelBase;
            if (options.subschema && fieldInfo.name.indexOf('.') !== -1) {
              // Schema handling - need to massage the ngModel and the id
              var compoundName = fieldInfo.name;
              var root = options.subschemaroot;
              var lastPart = compoundName.slice(root.length + 1);
              if (options.index) {
                modelString += root + '[' + options.index + '].' + lastPart;
                idString = 'f_' + modelString.slice(modelBase.length).replace(/(\.|\[|]\.)/g, '-');
              } else {
                modelString += root;
                if (options.subkey) {
                  idString = modelString.slice(modelBase.length).replace(/\./g, '-') + '-subkey' + options.subkeyno + '-' + lastPart;
                  modelString += '[' + '$_arrayOffset_' + root.replace(/\./g, '_') + '_' + options.subkeyno + '].' + lastPart;
                } else {
                  modelString += '[$index].' + lastPart;
                  nameString = compoundName.replace(/\./g, '-');
                }
              }
            } else {
              modelString += fieldInfo.name;
            }
          }

          var allInputsVars = FormMarkupHelperService.allInputsVars(scope, fieldInfo, options, modelString, idString, nameString);
          var common = allInputsVars.common;
          var value;
          isRequired = isRequired || fieldInfo.required;
          var requiredStr = isRequired ? ' required ' : '';
          var enumInstruction: IEnumInstruction;

          switch (fieldInfo.type) {
            case 'select' :
              if (fieldInfo.select2) {
                value = '<input placeholder="fng-select2 has been removed" readonly>';
              } else {
                common += FormMarkupHelperService.handleReadOnlyDisabled(fieldInfo, scope).join(" ");
                common += fieldInfo.add ? (' ' + fieldInfo.add + ' ') : '';
                common += ` aria-label="${fieldInfo.label && fieldInfo.label !== "" ? fieldInfo.label : fieldInfo.name}" `;
                value = '<select ' + common + 'class="' + allInputsVars.formControl.trim() + allInputsVars.compactClass + allInputsVars.sizeClassBS2 + '" ' + requiredStr + '>';

                if (!isRequired) {
                  value += '<option value="">' + (fieldInfo.placeHolder || "") + '</option>';
                }
                if (angular.isArray(fieldInfo.options)) {
                  angular.forEach(fieldInfo.options, function (optValue) {
                    if (_.isObject(optValue)) {
                      value += '<option value="' + ((<any>optValue).val || (<any>optValue).id) + '">' + ((<any>optValue).label || (<any>optValue).text) + '</option>';
                    } else {
                      value += '<option>' + optValue + '</option>';
                    }
                  });
                } else {
                  enumInstruction = generateEnumInstructions();
                  value += '<option ng-repeat="option in ' + enumInstruction.repeat + '"';
                  if (enumInstruction.label) {
                    value += ' value="{{' + enumInstruction.value + '}}"> {{ ' + enumInstruction.label + ' }} </option> ';
                  } else {
                    value += '>{{' + enumInstruction.value + '}}</option> ';
                  }
                }
                value += '</select>';
              }
              break;
            case 'link' :
              value = '<fng-link model="' + modelString + '" ref="' + fieldInfo.ref + '"';
              if (fieldInfo.form) {
                value += ' form="' + fieldInfo.form + '"';
              }
              if (fieldInfo.linktab) {
                value += ' linktab="' + fieldInfo.linktab + '"';
              }
              if (fieldInfo.linktext) {
                value += ' text="' + fieldInfo.linktext + '"';
              }
              if (fieldInfo.readonly) {
                if (typeof fieldInfo.readonly === "boolean") {
                  value += ` readonly="true"`;
                } else {
                  value += ` ng-readonly="${fieldInfo.readonly}"`;
                }
              }
              value += '></fng-link>';
              break;
            case 'radio' :
              value = '';
              common += requiredStr;
              common += FormMarkupHelperService.handleReadOnlyDisabled(fieldInfo, scope).join(" ");;
              common += fieldInfo.add ? (' ' + fieldInfo.add + ' ') : '';
              var separateLines = options.formstyle === 'vertical' || (options.formstyle !== 'inline' && !fieldInfo.inlineRadio);

              if (angular.isArray(fieldInfo.options)) {
                if (options.subschema) {
                  common = common.replace('name="', 'name="{{$index}}-');
                  common = common.replace('id="', 'id="{{$index}}-');
                }
                let thisCommon: string;
                angular.forEach(fieldInfo.options, function (optValue, idx) {
                  thisCommon = common.replace('id="', 'id="' + idx + '-');
                  value += `<input ${thisCommon} type="radio" aria-label="${optValue}" value="${optValue}">${optValue}`;
                  if (separateLines) {
                    value += '<br />';
                  }
                });
              } else {
                var tagType = separateLines ? 'div' : 'span';
                if (options.subschema) {
                  common = common.replace('$index', '$parent.$index')
                    .replace('name="', 'name="{{$parent.$index}}-')
                    .replace('id="', 'id="{{$parent.$index}}-');
                }
                enumInstruction = generateEnumInstructions();
                value += '<' + tagType + ' ng-repeat="option in ' + enumInstruction.repeat + '">';
                value += `<input ${common.replace('id="', 'id="{{$index}}-')} type="radio" aria-label="${enumInstruction.value}" value="{{ ${enumInstruction.value} }}"> {{ ${enumInstruction.label || enumInstruction.value} }} </${tagType}> `;
              }
              break;
            case 'checkbox' :
              common += requiredStr;
              common += FormMarkupHelperService.handleReadOnlyDisabled(fieldInfo, scope).join(" ");;
              common += fieldInfo.add ? (' ' + fieldInfo.add + ' ') : '';
              value = FormMarkupHelperService.generateSimpleInput(common, fieldInfo, options);
              if (CssFrameworkService.framework() === 'bs3') {
                value = '<div class="checkbox">' + value + '</div>';
              }
              break;
            default:
              common += FormMarkupHelperService.addTextInputMarkup(allInputsVars, fieldInfo, requiredStr);
              common += FormMarkupHelperService.handleReadOnlyDisabled(fieldInfo, scope).join(" ");;
              if (fieldInfo.type === 'textarea') {
                if (fieldInfo.rows) {
                  if (fieldInfo.rows === 'auto') {
                    common += 'msd-elastic="\n" class="ng-animate" ';
                  } else {
                    common += 'rows = "' + fieldInfo.rows + '" ';
                  }
                }
                if (fieldInfo.editor === 'ckEditor') {
                  console.log('Deprecation Warning: "editor" property deprecated - use "add"');
                  common += 'ckeditor = "" ';
                  if (CssFrameworkService.framework() === 'bs3') {
                    allInputsVars.sizeClassBS3 = 'col-xs-12';
                  }
                }
                value = '<textarea ' + common + '></textarea>';
              } else {
                value = FormMarkupHelperService.generateSimpleInput(common, fieldInfo, options);
              }
          }
          return FormMarkupHelperService.inputChrome(value, fieldInfo, options, allInputsVars);
        };

        var convertFormStyleToClass = function (aFormStyle) {
          var result;
          switch (aFormStyle) {
            case 'horizontal' :
              result = 'form-horizontal';
              break;
            case 'vertical' :
              result = '';
              break;
            case 'inline' :
              result = 'form-inline';
              break;
            case 'stacked' :
              result = 'form-stacked';
              break;
            case 'horizontalCompact' :
              result = 'form-horizontal compact';
              break;
            default:
              result = 'form-horizontal compact';
              break;
          }
          return result;
        };

        var containerInstructions = function (info: IContainer): fng.IContainerInstructions {
          var result: fng.IContainerInstructions;
          if (typeof info.containerType === 'function') {
            result = info.containerType(info);
          } else {
            result = {};
            switch (info.containerType) {
              case 'tab' :
                var tabNo = -1;
                for (var i = 0; i < scope.tabs.length; i++) {
                  if (scope.tabs[i].title === info.title) {
                    tabNo = i;
                    break;
                  }
                }
                if (tabNo >= 0) {
                  // TODO Figure out tab history updates (check for other tab-history-todos)
                  // result.before = '<uib-tab deselect="tabDeselect($event, $selectedIndex)" select="updateQueryForTab(\'' + info.title + '\')" heading="' + info.title + '"'
                  const idStr = `${_.camelCase(info.title)}Tab`;
                  const visibility = SecurityService.considerVisibility(idStr, scope);
                  if (visibility.omit) {
                    // we already know this field should be invisible, so we needn't add anything for it
                    result.omit = true;
                  } else {
                    let attrs = `id="${idStr}"`;
                    if (visibility.visibilityAttr) {
                      // an angular expression to determine the visibility of this field later...
                      attrs += ` ${visibility.visibilityAttr}`;
                    }
                    attrs += SecurityService.generateDisabledAttr(idStr, scope, { attr: "disable", attrRequiresValue: true }); // uib-tab expects 'disable="true"` rather than 'disabled="true"' or just disabled
                    result.before = "";
                    const cleanTitle = info.title.replace(/["']/g, '');
                    if (info.hideable) {
                      const templateId = `customTemplate_${idStr}.html`;
                      // $parent.hideTab is needed in the template below because the uib-tab directive has an isolated scope,
                      // so even though our form is on its parent scope, it cannot be seen
                      result.before +=
                        `<script type="text/ng-template" id="${templateId}">` + 
                        `   <li ng-class="[{active: active, disabled: disabled}, classes]" class="uib-tab nav-item">` +
                        `     <div class="hideable-tab">` +
                        `       <span class="class="nav-link" data-ng-click="select($event)">${cleanTitle}</span>&nbsp;` +
                        `       <button name="hide_${idStr}_btn" data-ng-click="$parent.hideTab($event, '${cleanTitle}', '${info.hiddenTabArrayProp}')"` +
                        `         style="position: relative; z-index: 20;" type="button" class="close pull-right">` +
                        `         <span aria-hidden="true">×</span><span class="sr-only">Close</span>` +
                        `       </button>` +
                        `     </div>` +
                        `   </li>` +
                        `</script>`;
                      attrs += ` template-url="${templateId}"`;
                      attrs += ` data-ng-show="!${info.hiddenTabArrayProp} || !${info.hiddenTabArrayProp}.includes('${cleanTitle}')"`
                    } else {
                      attrs += ` heading="${cleanTitle}"`;
                    }
                    if (tabNo > 0) {
                      attrs += ` active="tabs[${tabNo}].active"`;
                    }
                    result.before += `<uib-tab ${attrs} deselect="tabDeselect($event, $selectedIndex)" select="updateQueryForTab('${cleanTitle}')"`;
                    result.before += '>';
                    result.after = '</uib-tab>';
                  }
                } else {
                  result.before = `<p>Error! Tab ${info.title} not found in tab list</p>`;
                  result.after = '';
                }
                break;
              case '+tab' :
                const idStr = `addTabsTab`;
                const popoverTemplateId = `customTemplate_${idStr}_popover.html`;
                result.before =
                  `<script type="text/ng-template" id="${popoverTemplateId}">` + 
                  `  <div id="addableTabsList">` + 
                  `    <div class="item" data-ng-repeat="tab in $parent.${info.hiddenTabArrayProp}">` + 
                  `      <button type="button" class="addTabButton btn" data-ng-click="$parent.addTab($event, tab, '${info.hiddenTabArrayProp}')">{{ tab }}` + 
                  `    </div>` + 
                  `  </div>` +
                  `</script>`;                
                const tabTemplateId = `customTemplate_${idStr}.html`;
                result.before +=
                  `<script type="text/ng-template" id="${tabTemplateId}">` + 
                  `  <li class="uib-tab nav-item" data-ng-if="$parent.${info.hiddenTabArrayProp} && $parent.${info.hiddenTabArrayProp}.length > 0">` +
                  `    <div id="${idStr}">` +
                  `      <button name="addTabsBtn" popover-trigger="'outsideClick'" popover-placement="bottom" popover-append-to-body="true" title="Reintroduce Optional Sections..." uib-popover-template="'${popoverTemplateId}'"` +
                  `        style="position: relative; z-index: 20;" type="button" class="close pull-right">` +
                  `        <span aria-hidden="true">+</span><span class="sr-only">Add</span>` +
                  `      </button>` +
                  `    </div>` +
                  `  </li>` +
                  `</script>`;
                result.before += `<uib-tab template-url="${tabTemplateId}">`;
                result.after = '</uib-tab>';
                break;                
              case 'tabset' :
                result.before = '<uib-tabset>';
                result.after = '</uib-tabset>';
                break;
              case 'well' :
                result.before = '<div class="well">';
                if (info.title) {
                  result.before += '<h4>' + info.title + '</h4>';
                }
                result.after = '</div>';
                break;
              case 'well-large' :
                result.before = '<div class="well well-lg well-large">';
                result.after = '</div>';
                break;
              case 'well-small' :
                result.before = '<div class="well well-sm well-small">';
                result.after = '</div>';
                break;
              case 'fieldset' :
                result.before = '<fieldset>';
                if (info.title) {
                  result.before += '<legend>' + info.title + '</legend>';
                }
                result.after = '</fieldset>';
                break;
              case undefined:
                break;
              case null:
                break;
              case '':
                break;
              default:
                result.before = '<div class="' + info.containerType + '">';
                if (info.title) {
                  var titleLook = info.titleTagOrClass || 'h4';
                  if (titleLook.match(/h[1-6]/)) {
                    result.before += '<' + titleLook + '>' + info.title + '</' + titleLook + '>';
                  } else {
                    result.before += '<p class="' + titleLook + '">' + info.title + '</p>';
                  }
                }
                result.after = '</div>';
                break;
            }
          }
          return result;
        };

        var generateInlineHeaders = function (instructionsArray, options: fng.IFormOptions, model: string, evenWhenEmpty: boolean) {
          // "column" headers for nested schemas that use formStyle: "inline" will only line up with their respective
          // controls when widths are applied to both the cg_f_xxxx and col_label_xxxx element using css.
          // Likely, the widths will need to be the same, so consider using the following:
          //    div[id$="_f_<collection>_<field>"] {
          //      width: 100px;
          //    }
          // one column can grow to the remaining available width thus:
          //    div[id$="_f_<collection>_<field>"] {
          //      flex-grow: 1;
          //    }
          let hideWhenEmpty = evenWhenEmpty ? "" : `ng-hide="!${model} || ${model}.length === 0"`;
          let res = `<div class="inline-col-headers" style="display:flex" ${hideWhenEmpty}>`;
          for (const info of instructionsArray) {
              // need to call this now to ensure the id is set. will probably be (harmlessly) called again later. 
              inferMissingProperties(info, options);
              res += '<div ';
              info.showWhen = info.showWhen || info.showwhen; // deal with use within a directive
              if (info.showWhen) {
                  if (typeof info.showWhen === 'string') {
                      res += 'ng-show="' + info.showWhen + '"';
                  }
                  else {
                      res += 'ng-show="' + FormMarkupHelperService.generateNgShow(info.showWhen, model) + '"';
                  }
              }
              if (info.id && typeof info.id.replace === "function") {
                  res += ' id="col_label_' + info.id.replace(/\./g, '-') + '"';
              }
              res += ` class="inline-col-header"><label for="${info.id}" class="control-label">${info.label}</label></div>`;
          }
          res += "</div>";
          return res;
        };        

        var handleField = function (info, options: fng.IFormOptions) {
          var fieldChrome = FormMarkupHelperService.fieldChrome(scope, info, options);
          if (fieldChrome.omit) {
            return "";
          }
          var template = fieldChrome.template;

          if (info.schema) {
            var niceName = info.name.replace(/\./g, '_');
            var schemaDefName = '$_schema_' + niceName;
            scope[schemaDefName] = info.schema;
            if (info.schema) { // display as a control group
              //schemas (which means they are arrays in Mongoose)
              // Check for subkey - selecting out one or more of the array
              if (info.subkey) {
                info.subkey.path = info.name;
                scope[schemaDefName + '_subkey'] = info.subkey;

                var subKeyArray = angular.isArray(info.subkey) ? info.subkey : [info.subkey];
                for (var arraySel = 0; arraySel < subKeyArray.length; arraySel++) {
                  var topAndTail = containerInstructions(subKeyArray[arraySel]);
                  template += topAndTail.before;
                  template += processInstructions(info.schema, null, {
                    subschema: 'true',          // We are trying to behave like attrs here
                    formstyle: options.formstyle,
                    subkey: schemaDefName + '_subkey',
                    subkeyno: arraySel,
                    subschemaroot: info.name,
                    suppressNestingWarning: info.suppressNestingWarning
                  });
                  template += topAndTail.after;
                }
                subkeys.push(info);
              } else {
                if (options.subschema) {
                  if (!options.suppressNestingWarning) {
                    console.log('Attempts at supporting deep nesting have been removed - will hopefully be re-introduced at a later date');
                  }
                } else {
                  let model: string = (options.model || 'record') + '.' + info.name;
                  /* Array header */
                  if (typeof info.customHeader == 'string') {
                    template += info.customHeader;
                  } else {
                    let topButton: string = '';
                    if (info.unshift) {
                      topButton = '<button id="unshift_' + info.id + '_btn" class="add-btn btn btn-default btn-xs btn-mini form-btn" ng-click="unshift(\'' + info.name + '\',$event)">' +
                        '<i class="' + FormMarkupHelperService.glyphClass() + '-plus"></i> Add</button>';
                    }

                    if (CssFrameworkService.framework() === 'bs3') {
                      template += '<div class="row schema-head"><div class="col-sm-offset-3">' + info.label + topButton + '</div></div>';
                    } else {
                      template += '<div class="schema-head">' + info.label + topButton + '</div>';
                    }
                  }

                  /* Array body */
                  if (info.formStyle === "inline" && info.inlineHeaders) {
                    template += generateInlineHeaders(info.schema, options, model, info.inlineHeaders === "always");
                  }
                  // handleReadOnlyDisabled() returns two strings - the 'disabled' attribute(s), and the 'disableable'
                  // attributes.  for the purpose of deciding if / how to disable sorting if the list itself is
                  // disabled, we're only interested in the former...
                  const disableCond: string = FormMarkupHelperService.handleReadOnlyDisabled(info, scope)[0];
                  // if we already know that the field is disabled (only possible when formsAngular.elemSecurityFuncBinding === "instant")
                  // then we don't need to add the sortable attribute at all
                  // otherwise, we need to include the ng-disabled on the <ol> so this can be referenced by the ui-sortable directive
                  // (see sortableOptions)
                  const sortableStr = info.sortable && disableCond.trim().toLowerCase() !== "disabled"
                    ? `${disableCond} ui-sortable="sortableOptions" ng-model="${model}"`
                    : "";
                  template += `<ol class="sub-doc" ${sortableStr}>`;
                  // if a "disabled + children" DOM effect is applied to the list, this should serve to disable all of the
                  // fields in the list sub-schema, along with the remove and add buttons for this list.  the following
                  // string will be added to the list items and the add and remove buttons to identify this fact.
                  const disableableAncestorStr = FormMarkupHelperService.genDisableableAncestorStr(info.id);
                  template +=
                    `<li ng-form id="${info.id}List_{{$index}}" name="form_${niceName}{{$index}}" ${disableableAncestorStr}` + 
                    `  class="${convertFormStyleToClass(info.formStyle)}` +
                    `  ${CssFrameworkService.framework() === 'bs2' ? 'row-fluid' : ''}`  +
                    `  ${info.inlineHeaders ? 'width-controlled' : ''}` +
                    `  ${info.ngClass ? "ng-class:" + info.ngClass : ''}"` +
                    `  ng-repeat="subDoc in ${model} track by $index"` + 
                    `  ${info.filterable ? 'data-ng-hide="subDoc._hidden"' : ''}` + 
                    `>`;
                  if (CssFrameworkService.framework() === 'bs2') {
                    template += '<div class="row-fluid sub-doc">';
                  }
                  if (info.noRemove !== true || info.customSubDoc) {
                    // we need to put disableableAncestorStr on the div rather than on the remove button because the
                    // way that is styled means that any coloured outlines that might be added when "Identify page elements" is on
                    // will be masked
                    template += `   <div class="sub-doc-btns" ${info.noRemove !== true ? disableableAncestorStr : ""}>`;
                    if (typeof info.customSubDoc == 'string') {
                      template += info.customSubDoc;
                    }
                    if (info.noRemove !== true) {                      
                      template += `<button ${disableCond} ${info.noRemove ? 'ng-hide="' + info.noRemove + '"' : ''} name="remove_${info.id}_btn" ng-click="remove('${info.name}', $index, $event)"`;
                      if (info.remove) {
                        template += ' class="remove-btn btn btn-mini btn-default btn-xs form-btn"><i class="' + FormMarkupHelperService.glyphClass() + '-minus"></i> Remove';
                      } else {
                        template += ' style="position: relative; z-index: 20;" type="button" class="close pull-right">';
                        if (CssFrameworkService.framework() === 'bs3') {
                          template += '<span aria-hidden="true">×</span><span class="sr-only">Close</span>';
                        } else {
                          template += '<span>×</span>';
                        }
                      }
                      template += '</button>';
                    }
                    template += '</div> ';
                  }
                  let parts: fng.IContainerInstructions;
                  if (info.subDocContainerType) {
                      const containerType = scope[info.subDocContainerType] || info.subDocContainerType;
                      const containerProps = Object.assign({ containerType }, info.subDocContainerProps);
                      parts = containerInstructions(containerProps);
                  }
                  if (parts?.before) {
                      template += parts.before;
                  }
                  template += processInstructions(info.schema, false, {
                    subschema: 'true',
                    formstyle: info.formStyle,
                    model: options.model,
                    subschemaroot: info.name,
                    suppressNestingWarning: info.suppressNestingWarning
                  });
                  if (parts?.after) {
                    template += parts.after;
                  }
                  if (CssFrameworkService.framework() === 'bs2') {
                    template += '   </div>';
                  }
                  template += '</li>';

                  template += '</ol>';

                  /* Array footer */
                  if (info.noAdd !== true || typeof info.customFooter == 'string' || info.noneIndicator) {
                    let footer: string = '';
                    const hasCustomFooter = typeof info.customFooter == 'string';
                    if (hasCustomFooter) {
                      footer = info.customFooter;
                    }
                    let hideCond = '';
                    let indicatorShowCond = `${model}.length == 0`;
                    if (info.noAdd === true) {
                      indicatorShowCond = `ng-show="${indicatorShowCond}"`;
                    } else {                    
                      hideCond = info.noAdd ? `ng-hide="${info.noAdd}"` : '';
                      indicatorShowCond = info.noAdd ? `ng-show="${info.noAdd} && ${indicatorShowCond}"` : '';
                      // we need the button to have disableCond (to actually disable it, if the list is disabled)
                      // adding disableableAncestorStr seems more correct than for it to have the disableable attribute
                      footer +=
                        `<button ${hideCond} ${disableCond} ${disableableAncestorStr} id="add_${info.id}_btn" class="add-btn btn btn-default btn-xs btn-mini" ng-click="add('${info.name}',$event)">` + 
                        ` <i class="${FormMarkupHelperService.glyphClass()}-plus"></i> Add ` + 
                        `</button>`;
                    }
                    if (info.noneIndicator) {
                      footer += `<span ${indicatorShowCond} class="none_indicator" id="no_${info.id}_indicator">None</span>`;
                      // hideCond for the schema-foot is if there's no add button, no custom footer and no indicator
                      if (!hasCustomFooter) {
                        hideCond = `${model}.length > 0`;
                        if (info.noAdd === true) {
                          hideCond = `ng-hide="${hideCond}"`;
                        } else {
                          hideCond = info.noAdd ? `ng-hide="${info.noAdd} && ${hideCond}"` : '';
                        }
                      }
                    }                    
                    if (footer !== '') {
                      if (CssFrameworkService.framework() === 'bs3') {
                        template += `<div ${hideCond} class="row schema-foot"><div class="col-sm-offset-3">${footer}</div></div>`;
                      } else {
                        template += `<div ${hideCond} class = "schema-foot ">${footer}</div>`;
                      }
                    }
                  }
                }
              }
            }
          }
          else {
            // NB: Any changes to what properties we support @@-wrapped pseudonyms for here should be repeated in
            // PluginHelperService.extractFromAttr
            info.help = FormMarkupHelperService.handlePseudos(scope, info.help);
            info.label = FormMarkupHelperService.handlePseudos(scope, info.label);
            info.popup = FormMarkupHelperService.handlePseudos(scope, info.popup);
            // Handle arrays here
            var controlDivClasses = FormMarkupHelperService.controlDivClasses(options, info);
            if (info.array) {
              controlDivClasses.push('fng-array');
              if (options.formstyle === 'inline' || options.formstyle === 'stacked') {
                throw new Error('Cannot use arrays in an inline or stacked form');
              }
              template += FormMarkupHelperService.label(scope, info, info.type !== 'link', options);
              const stashedHelp = info.help;
              delete info.help;
              const inputHtml = generateInput(info, info.type === 'link' ? null : 'arrayItem.x', true, options);
              info.help = stashedHelp;
              template += FormMarkupHelperService.handleArrayInputAndControlDiv(inputHtml, controlDivClasses, scope, info, options);
            } else {
              // Single fields here
              template += FormMarkupHelperService.label(scope, info, null, options);
              template += FormMarkupHelperService.handleInputAndControlDiv(generateInput(info, null, (<any>options).required, options), controlDivClasses);
            }
          }
          template += fieldChrome.closeTag;
          return template;
        };

        const inferMissingProperties = function (info: IFormInstruction, options?: IBaseFormOptions) {
          // infer missing values
          info.type = info.type || 'text';
          if (info.id) {
            if (typeof info.id === 'number' || info.id.match(/^[0-9]/)) {
              info.id = '_' + info.id;
            }
          } else {
            if (options && options.noid) {
              info.id = null;
            } else {
              info.id = 'f_' + info.name.replace(/\./g, '_');
            }
          }
          info.label = (info.label !== undefined) ? (info.label === null ? '' : info.label) : $filter('titleCase')(info.name.split('.').slice(-1)[0]);
        };

//              var processInstructions = function (instructionsArray, topLevel, groupId) {
//  removing groupId as it was only used when called by containerType container, which is removed for now
        var processInstructions = function (instructionsArray, topLevel, options:fng.IFormOptions) {
          var result = '';
          if (instructionsArray) {
            for (var anInstruction = 0; anInstruction < instructionsArray.length; anInstruction++) {
              var info = instructionsArray[anInstruction];
              if (options.viewform) {
                info = angular.copy(info);
                info.readonly = true;
              }
              if (anInstruction === 0 && topLevel && !options.schema.match(/\$_schema_/) && typeof info.add !== 'object') {
                info.add = info.add ? ' ' + info.add + ' ' : '';
                if (info.add.indexOf('ui-date') === -1 && !options.noautofocus && !info.containerType) {
                  info.add = info.add + 'autofocus ';
                }
              }

              var callHandleField = true;
              if (info.directive) {
                var directiveName = info.directive;
                var newElement = info.customHeader || "";
                newElement += '<' + directiveName + ' model="' + (options.model || 'record') + '"';
                var thisElement = element[0];
                inferMissingProperties(info, options);
                for (var i = 0; i < thisElement.attributes.length; i++) {
                  var thisAttr = thisElement.attributes[i];
                  switch (thisAttr.nodeName) {
                    case 'class' :
                      var classes = thisAttr.value.replace('ng-scope', '');
                      if (classes.length > 0) {
                        newElement += ' class="' + classes + '"';
                      }
                      break;
                    case 'schema' :
                      var bespokeSchemaDefName = ('bespoke_' + info.name).replace(/\./g, '_');
                      scope[bespokeSchemaDefName] = angular.copy(info);
                      delete scope[bespokeSchemaDefName].directive;
                      newElement += ' schema="' + bespokeSchemaDefName + '"';
                      break;
                    default :
                      newElement += ' ' + thisAttr.nodeName + '="' + thisAttr.value + '"';
                  }
                }
                newElement += ' ';
                var directiveCamel = $filter('camelCase')(info.directive);
                for (var prop in info) {
                  if (info.hasOwnProperty(prop)) {
                    switch (prop) {
                      case 'directive' :
                        break;
                      case 'schema' :
                        break;
                      case 'add' :
                        switch (typeof info.add) {
                          case 'string' :
                            newElement += ' ' + info.add;
                            break;
                          case 'object' :
                            for (var subAdd in info.add) {
                              if (info.add.hasOwnProperty(subAdd)) {
                                newElement += ' ' + subAdd + '="' + info.add[subAdd].toString().replace(/"/g, '&quot;') + '"';
                              }
                            }
                            break;
                          default:
                            throw new Error('Invalid add property of type ' + typeof(info.add) + ' in directive ' + info.name);
                        }
                        break;
                      case directiveCamel :
                        for (var subProp in info[prop]) {
                          if (info[prop].hasOwnProperty(subProp)) {
                            newElement += ` ${info.directive}-${subProp}="`;
                            if (typeof info[prop][subProp] === 'string') {
                              newElement += `${info[prop][subProp].replace(/"/g, '&quot;')}"`;
                            } else {
                              newElement += `${(JSON.stringify(info[prop][subProp]) || "").replace(/"/g, '&quot;')}"`;
                            }
                          }
                        }
                        break;
                      default:
                        if (info[prop]) {
                          if (typeof info[prop] === 'string') {
                            newElement += ' fng-fld-' + prop + '="' + info[prop].replace(/"/g, '&quot;') + '"';
                          } else {
                            newElement += ' fng-fld-' + prop + '="' + (JSON.stringify(info[prop]) || "").replace(/"/g, '&quot;') + '"';
                          }
                        }
                        break;
                    }
                  }
                }
                for (prop in options) {
                  if (options.hasOwnProperty(prop) && prop[0] !== '$' && typeof options[prop] !== 'undefined') {
                    newElement += ' fng-opt-' + prop + '="' + options[prop].toString().replace(/"/g, '&quot;') + '"';
                  }
                }

                newElement += 'ng-model="' + info.name + '"></' + directiveName + '>';
                newElement += (info.customFooter || "");
                result += newElement;
                callHandleField = false;
              } else if (info.containerType) {
                // for now, the following call will only consider security for tabs and not other container types.
                // hence why we...
                var parts = containerInstructions(info);
                switch (info.containerType) {
                  case 'tab' :
                    // maintain support for simplified tabset syntax for now
                    if (tabsSetup === tabsSetupState.N) {
                      tabsSetup = tabsSetupState.Forced;
                      result += '<uib-tabset active="activeTabNo">';
                      let activeTabNo: number = _.findIndex(scope.tabs, (tab) => (tab.active));
                      scope.activeTabNo = activeTabNo >= 0 ? activeTabNo : 0;
                    }
                    // ...only check for this here!
                    if (!parts.omit) {
                      result += parts.before;
                      result += processInstructions(info.content, null, options);
                      result += parts.after;
                    }
                    break;
                  case 'tabset' :
                    tabsSetup = tabsSetupState.Y;
                    result += parts.before;
                    result += processInstructions(info.content, null, options);
                    result += parts.after;
                    break;
                  default:
                    // includes wells, fieldset
                    result += parts.before;
                    result += processInstructions(info.content, null, options);
                    result += parts.after;
                    break;
                }
                callHandleField = false;
              } else if (options.subkey) {
                // Don't display fields that form part of the subkey, as they should not be edited (because in these circumstances they form some kind of key)
                var objectToSearch = angular.isArray(scope[options.subkey]) ? scope[options.subkey][0].keyList : scope[options.subkey].keyList;
                if (_.find(objectToSearch, (value, key) => scope[options.subkey].path + '.' + key === info.name )) {
                  callHandleField = false;
                }
              }
              if (callHandleField) {
                //                            if (groupId) {
                //                                scope['showHide' + groupId] = true;
                //                            }
                inferMissingProperties(info, options);
                result += handleField(info, options);
              }
            }
          } else {
            console.log('Empty array passed to processInstructions');
            result = '';
          }
          return result;
        };

        scope.$on("regenerateFormMarkup", function (event: angular.IAngularEvent, formId: string) {
          if (!attrs.formid || attrs.formid !== formId) {
            return;
          }
          tabsSetup = tabsSetupState.N;
          generateForm(scope[attrs.schema]);
        });

        var unwatch = scope.$watch(attrs.schema, function (newValue: any) {
          if (newValue) {
            var newArrayValue: Array<any> = angular.isArray(newValue) ? newValue : [newValue];   // otherwise some old tests stop working for no real reason
            if (newArrayValue.length > 0 && typeof unwatch === "function") {
              unwatch();
              unwatch = null;
              generateForm(newArrayValue);
            }
          }
        }, true);
        
        let formElement: JQLite;              

        var generateForm = function (schema: (fng.IContainer | fng.IFormInstruction)[]): void {
          var elementHtml = '';
          var recordAttribute = attrs.model || 'record'; // By default data comes from scope.record
          var theRecord = scope[recordAttribute];
          const hideableTabs = schema.filter((s) => s && s.containerType === "tab" && s.hideable);
          let hiddenTabArrayProp: string;
          let hiddenTabReintroductionMethod: HiddenTabReintroductionMethod;
          for (const tab of hideableTabs) {
            if (tab.hiddenTabArrayProp) {
              if (hiddenTabArrayProp && tab.hiddenTabArrayProp !== hiddenTabArrayProp) {
                throw new Error("Currently, tab sets with more than one value for hiddenTabArrayProp are not supported");
              }
              hiddenTabArrayProp = tab.hiddenTabArrayProp;
            }
            if (tab.hiddenTabReintroductionMethod) {
              if (hiddenTabReintroductionMethod && tab.hiddenTabReintroductionMethod !== hiddenTabReintroductionMethod) {
                throw new Error("Currently, tab sets with more than one value for hiddenTabReintroductionMethod are not supported");
              }
              hiddenTabReintroductionMethod = tab.hiddenTabReintroductionMethod;
            }
          }
          // now we have established that we don't have more than one value for hiddenTabArrayProp, apply a default if no
          // value has been provided at all...
          if (!hiddenTabArrayProp) {
            hiddenTabArrayProp = "record.hiddenTabs";
          }
          // ...and then replace all blanks with this value so the processInstructions() call made below can deal with
          // each tab independently of the others
          for (const tab of hideableTabs) {
            tab.hiddenTabArrayProp = hiddenTabArrayProp;
          }
          if (hiddenTabReintroductionMethod === "tab") {
            (schema as fng.IContainer[]).push({
              containerType: "+tab",
              hiddenTabArrayProp,
              content: []
            })        
          }
          theRecord = theRecord || {};
          if ((attrs.subschema || attrs.model) && !attrs.forceform) {
            elementHtml = '';
          } else {
            scope.topLevelFormName = attrs.name || 'myForm';     // Form name defaults to myForm
            // Copy attrs we don't process into form
            var customAttrs = '';
            for (var thisAttr in attrs) {
              if (attrs.hasOwnProperty(thisAttr)) {
                if (thisAttr[0] !== '$' && ['name', 'formstyle', 'schema', 'subschema', 'model', 'viewform'].indexOf(thisAttr) === -1) {
                  customAttrs += ' ' + attrs.$attr[thisAttr] + '="' + attrs[thisAttr] + '"';
                }
              }
            }
            let tag = attrs.forceform ? 'ng-form' : 'form';
            elementHtml = `<${tag} name="${scope.topLevelFormName}" class="${convertFormStyleToClass(attrs.formstyle)}" novalidate ${customAttrs}>`;
          }
          if (theRecord === scope.topLevelFormName) {
            throw new Error('Model and Name must be distinct - they are both ' + theRecord);
          }
          elementHtml += processInstructions(schema, true, attrs);
          if (tabsSetup === tabsSetupState.Forced) {
            elementHtml += '</uib-tabset>';
          }
          elementHtml += attrs.subschema ? '' : '</form>';
          const compiledFormElement = $compile(elementHtml)(scope);
          if (formElement) {
            const topLevelForm = scope[scope.topLevelFormName];
            formElement.replaceWith(compiledFormElement);
            // the replaceWith will cause the scope[scope.topLevelFormName] to be cleared, so we need to...:
            scope[scope.topLevelFormName] = topLevelForm;
          } else {
            element.replaceWith(compiledFormElement);
          }          
          // remember the element that we're now represented by (which is no longer the value
          // of element passed to our link function).  This will enable us to replace the 
          // correct element upon receipt of a regenerateFormMarkup request.
          formElement = compiledFormElement;
          // If there are subkeys we need to fix up ng-model references when record is read
          // If we have modelControllers we need to let them know when we have form + data
          let sharedData = scope[attrs.shared || 'sharedData'];
          let modelControllers = sharedData ? sharedData.modelControllers : [];
          if ((subkeys.length > 0 || modelControllers.length > 0)  && !scope.phaseWatcher){
            var unwatch2 = scope.$watch('phase', function (newValue) {
              scope.phaseWatcher = true;
              if (newValue === 'ready' && typeof unwatch2 === "function") {
                unwatch2();
                unwatch2 = null;

                // Tell the 'model controllers' that the form and data are there
                for (var i = 0; i < modelControllers.length; i++) {
                  if (modelControllers[i].onAllReady) {
                    modelControllers[i].onAllReady(scope);
                  }
                }

                // For each one of the subkeys sets in the form we need to fix up ng-model references
                for (var subkeyCtr = 0; subkeyCtr < subkeys.length; subkeyCtr++) {
                  var info = subkeys[subkeyCtr];
                  var arrayOffset;
                  var matching;
                  var arrayToProcess = angular.isArray(info.subkey) ? info.subkey : [info.subkey];

                  var parts = info.name.split('.');
                  var dataVal = theRecord;
                  while (parts.length > 1) {
                    dataVal = dataVal[parts.shift()] || {};
                  }
                  dataVal = dataVal[parts[0]] = dataVal[parts[0]] || [];

                  // For each of the required subkeys of this type
                  for (var thisOffset = 0; thisOffset < arrayToProcess.length; thisOffset++) {

                    if (arrayToProcess[thisOffset].selectFunc) {
                      // Get the array offset from a function
                      if (!scope[arrayToProcess[thisOffset].selectFunc] || typeof scope[arrayToProcess[thisOffset].selectFunc] !== 'function') {
                        throw new Error('Subkey function ' + arrayToProcess[thisOffset].selectFunc + ' is not properly set up');
                      }
                      arrayOffset = scope[arrayToProcess[thisOffset].selectFunc](theRecord, info);

                    } else if (arrayToProcess[thisOffset].keyList) {
                      // We are choosing the array element by matching one or more keys
                      var thisSubkeyList = arrayToProcess[thisOffset].keyList;

                      for (arrayOffset = 0; arrayOffset < dataVal.length; arrayOffset++) {
                        matching = true;
                        for (var keyField in thisSubkeyList) {
                          if (thisSubkeyList.hasOwnProperty(keyField)) {
                            // Not (currently) concerned with objects here - just simple types and lookups
                            if (dataVal[arrayOffset][keyField] !== thisSubkeyList[keyField] &&
                              (typeof dataVal[arrayOffset][keyField] === 'undefined' || !dataVal[arrayOffset][keyField].text || dataVal[arrayOffset][keyField].text !== thisSubkeyList[keyField])) {
                              matching = false;
                              break;
                            }
                          }
                        }
                        if (matching) {
                          break;
                        }
                      }
                      if (!matching) {
                        // There is no matching array element
                        switch (arrayToProcess[thisOffset].onNotFound) {
                          case 'error' :
                            var errorMessage = 'Cannot find matching ' + (arrayToProcess[thisOffset].title || arrayToProcess[thisOffset].path);
                            //Have to do this async as setPristine clears it
                            $timeout(function() {
                              scope.showError(errorMessage, 'Unable to set up form correctly');
                            });
                            arrayOffset = -1;
                            //throw new Error(scope.errorMessage);
                            break;
                          case 'create':
                          default:
                            let nameElements = info.name.split('.');
                            let lastPart: string = nameElements.pop();
                            let possibleArray: string = nameElements.join('.');
                            let obj = theRecord;

                            // Should loop here when / if we re-introduce nesting
                            if (possibleArray) {
                              obj = obj[possibleArray];
                            }
                            arrayOffset = obj[lastPart].push(thisSubkeyList) - 1;
                            break;
                        }
                      }
                    } else {
                      throw new Error('Invalid subkey setup for ' + info.name);
                    }
                    scope['$_arrayOffset_' + info.name.replace(/\./g, '_') + '_' + thisOffset] = arrayOffset;
                  }
                }
              }
            });
          }

          $rootScope.$broadcast('formInputDone', attrs.name);

          if (FormGeneratorService.updateDataDependentDisplay && theRecord && Object.keys(theRecord).length > 0) {
            // If this is not a test force the data dependent updates to the DOM
            FormGeneratorService.updateDataDependentDisplay(theRecord, null, true, scope);
          }
        }
      }
    };
  }

}
