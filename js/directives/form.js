'use strict';

formsAngular
  .directive('formInput', ['$compile', '$rootScope', 'utils', '$filter', 'urlService', 'cssFrameworkService', function ($compile, $rootScope, utils, $filter, urlService, cssFrameworkService) {
    return {
      restrict: 'EA',
      link: function (scope, element, attrs) {
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
//                Inline
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
//                Inline
//                <input type="text" class="input-small" placeholder="Email">

        var sizeMapping = [1, 2, 4, 6, 8, 10, 12],
          sizeDescriptions = ['mini', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'block-level'],
          defaultSizeOffset = 2, // medium, which was the default for Twitter Bootstrap 2
          subkeys = [],
          tabsSetup = false;

        var isHorizontalStyle = function (formStyle) {
          return (!formStyle || formStyle === 'undefined' || ['vertical', 'inline'].indexOf(formStyle) === -1);
        };

        var generateNgShow = function (showWhen, model) {

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

          if (conditionPos === -1) { throw new Error('Invalid comparison in showWhen'); }
          return evaluateSide(showWhen.lhs) + conditionSymbols[conditionPos] + evaluateSide(showWhen.rhs);
        };

        var generateDefault = function (common, options, fieldInfo) {
          var result = '<input ' + common + 'type="' + fieldInfo.type + '"';
          if (options.formstyle === 'inline' && cssFrameworkService.framework() === 'bs2' && !fieldInfo.size) {
            result += 'class="input-small"';
          }
          result += ' />';
          return result;
        };

        var generateInput = function (fieldInfo, modelString, isRequired, idString, options) {
          var nameString;
          if (!modelString) {
            modelString = (options.model || 'record') + '.';
            if (options.subschema && fieldInfo.name.indexOf('.') !== -1) {
              // Schema handling - need to massage the ngModel and the id
              var compoundName = fieldInfo.name,
                lastPartStart = compoundName.lastIndexOf('.'),
                lastPart = compoundName.slice(lastPartStart + 1);
              if (options.index) {
                var cut = modelString.length;
                modelString += compoundName.slice(0, lastPartStart) + '.' + options.index + '.' + lastPart;
                idString = 'f_' + modelString.slice(cut).replace(/\./g, '-');
              } else {
                modelString += compoundName.slice(0, lastPartStart);
                if (options.subkey) {
                  modelString += '[' + '$_arrayOffset_' + compoundName.slice(0, lastPartStart).replace(/\./g, '_') + '_' + options.subkeyno + '].' + lastPart;
                  idString = compoundName + '_subkey';
                } else {
                  modelString += '[$index].' + lastPart;
                  idString = null;
                  nameString = compoundName.replace(/\./g, '-');
                }
              }
            } else {
              modelString += fieldInfo.name;
            }
          }
          var value,
            requiredStr = (isRequired || fieldInfo.required) ? ' required' : '',
            readonlyStr = fieldInfo.readonly ? ' readonly' : '',
            placeHolder = fieldInfo.placeHolder,
            compactClass = '',
            sizeClassBS3 = '',
            sizeClassBS2 = '',
            formControl = '';

          if (cssFrameworkService.framework() === 'bs3') {
            compactClass = (['horizontal', 'vertical', 'inline'].indexOf(options.formstyle) === -1) ? ' input-sm' : '';
            sizeClassBS3 = 'col-xs-' + sizeMapping[fieldInfo.size ? sizeDescriptions.indexOf(fieldInfo.size) : defaultSizeOffset];
            formControl = ' form-control';
          } else {
            sizeClassBS2 = (fieldInfo.size ? ' input-' + fieldInfo.size : '');
          }

          if (options.formstyle === 'inline') { placeHolder = placeHolder || fieldInfo.label; }
          var common = 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '" ' : ' name="' + nameString + '" ');
          common += (placeHolder ? ('placeholder="' + placeHolder + '" ') : '');
          if (fieldInfo.popup) {
            common += 'title="' + fieldInfo.popup + '" ';
          }
          common += addAll('Field', null, options);
          switch (fieldInfo.type) {
            case 'select' :
              common += (fieldInfo.readonly ? 'disabled ' : '');
              if (fieldInfo.select2) {
                common += 'class="fng-select2' + formControl + compactClass + sizeClassBS2 + '"';
                if (fieldInfo.select2.fngAjax) {
                  if (cssFrameworkService.framework() === 'bs2') {
                    value = '<div class="input-append">';
                    value += '<input ui-select2="' + fieldInfo.select2.fngAjax + '" ' + common + '>';
                    value += '<button class="btn" type="button" data-select2-open="' + idString + '" ng-click="openSelect2($event)"><i class="icon-search"></i></button>';
                    value += '</div>';
                  } else {
                    value = '<div class="input-group">';
                    value += '<input ui-select2="' + fieldInfo.select2.fngAjax + '" ' + common + '>';
                    value += '<span class="input-group-addon' + compactClass + '" data-select2-open="' + idString + '" ';
                    value += '    ng-click="openSelect2($event)"><i class="glyphicon glyphicon-search"></i></span>';
                    value += '</div>';
                  }
                } else if (fieldInfo.select2) {
                  value = '<input ui-select2="' + fieldInfo.select2.s2query + '" ' + (fieldInfo.readonly ? 'disabled ' : '') + common + '>';
                }
              } else {
                value = '<select ' + common + 'class="' + formControl.trim() + compactClass + sizeClassBS2 + '">';
                if (!isRequired) {
                  value += '<option></option>';
                }
                if (angular.isArray(fieldInfo.options)) {
                  angular.forEach(fieldInfo.options, function (optValue) {
                    if (_.isObject(optValue)) {
                      value += '<option value="' + (optValue.val || optValue.id) + '">' + (optValue.label || optValue.text) + '</option>';
                    } else {
                      value += '<option>' + optValue + '</option>';
                    }
                  });
                } else {
                  value += '<option ng-repeat="option in ' + fieldInfo.options + '">{{option}}</option>';
                }
                value += '</select>';
              }
              break;
            case 'fileuploader':

              value = '<ng-upload-form url="/file/upload" auto-upload="true" size-limit="50000000"></ng-upload-form>';
              break;
            case 'link' :
              value = '<a ng-href="/' + urlService.buildUrl('') + fieldInfo.ref + (fieldInfo.form ? '/' + fieldInfo.form : '') + '/{{ ' + modelString + '}}/edit">' + fieldInfo.linkText + '</a>';
              break;
            case 'radio' :
              value = '';
              var separateLines = (options.formstyle !== 'inline' && !fieldInfo.inlineRadio);

              if (angular.isArray(fieldInfo.options)) {
                if (options.subschema) { common = common.replace('name="', 'name="{{$index}}-'); }
                angular.forEach(fieldInfo.options, function (optValue) {
                  value += '<input ' + common + 'type="radio"';
                  value += ' value="' + optValue + '">' + optValue;
                  if (separateLines) { value += '<br />'; }
                });
              } else {
                var tagType = separateLines ? 'div' : 'span';
                if (options.subschema) { common = common.replace('$index', '$parent.$index').replace('name="', 'name="{{$parent.$index}}-'); }
                value += '<' + tagType + ' ng-repeat="option in ' + fieldInfo.options + '"><input ' + common + ' type="radio" value="{{option}}"> {{option}} </' + tagType + '> ';
              }
              break;
            case 'checkbox' :
              if (cssFrameworkService.framework() === 'bs3') {
                value = '<div class="checkbox"><input ' + common + 'type="checkbox"></div>';
              } else {
                value = generateDefault(common, options, fieldInfo);
              }
              break;
            default:
              common += 'class="' + formControl.trim() + compactClass + sizeClassBS2 + '"' + (fieldInfo.add ? fieldInfo.add : '');
              common += 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '"' : '') + requiredStr + readonlyStr + ' ';
              if (fieldInfo.type === 'textarea') {
                if (fieldInfo.rows) {
                  if (fieldInfo.rows === 'auto') {
                    common += 'msd-elastic="\n" class="ng-animate" ';
                  } else {
                    common += 'rows = "' + fieldInfo.rows + '" ';
                  }
                }
                if (fieldInfo.editor === 'ckEditor') {
                  common += 'ckeditor = "" ';
                  if (cssFrameworkService.framework() === 'bs3') { sizeClassBS3 = 'col-xs-12'; }
                }
                value = '<textarea ' + common + ' />';
              } else {
                value = generateDefault(common, options, fieldInfo);
              }
          }
          if (cssFrameworkService.framework() === 'bs3' && isHorizontalStyle(options.formstyle) && fieldInfo.type !== 'checkbox') {
            value = '<div class="' + sizeClassBS3 + '">' + value + '</div>';
          }
          if (fieldInfo.helpInline && fieldInfo.type !== 'checkbox') {
            value += '<span class="help-inline">' + fieldInfo.helpInline + '</span>';
          }
          if (fieldInfo.help) {
            value += '<span class="help-block ' + sizeClassBS3 + '">' + fieldInfo.help + '</span>';
          }
          return value;
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
            case 'horizontalCompact' :
              result = 'form-horizontal compact';
              break;
            default:
              result = 'form-horizontal compact';
              break;
          }
          return result;
        };

        var containerInstructions = function (info) {
          var result = {before: '', after: ''};
          if (typeof info.containerType === 'function') {
            result = info.containerType(info);
          } else {
            switch (info.containerType) {
              case 'tab' :
                result.before = '<tab heading="' + info.title + '">';
                result.after = '</tab>';
                break;
              case 'tabset' :
                result.before = '<tabset>';
                result.after = '</tabset>';
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
                    result.before += '<' + titleLook + '>' + info.title + '</' + info.titleLook + '>';
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

        var generateLabel = function (fieldInfo, addButtonMarkup, options) {
          var labelHTML = '';
          if ((cssFrameworkService.framework() === 'bs3' || (options.formstyle !== 'inline' && fieldInfo.label !== '')) || addButtonMarkup) {
            labelHTML = '<label';
            if (isHorizontalStyle(options.formstyle)) {
              labelHTML += ' for="' + fieldInfo.id + '"';
              if (cssFrameworkService.framework() === 'bs3') { labelHTML += addAll('Label', 'col-sm-2', options); }
            } else if (options.formstyle === 'inline') {
              labelHTML += ' for="' + fieldInfo.id + '" class="sr-only"';
            }
            labelHTML += addAll('Label', 'control-label', options);
            labelHTML += '>' + fieldInfo.label + (addButtonMarkup || '') + '</label>';
          }
          return labelHTML;
        };

        var handleField = function (info, options) {

          info.type = info.type || 'text';
          info.id = info.id || 'f_' + info.name.replace(/\./g, '_');
          info.label = (info.label !== undefined) ? (info.label === null ? '' : info.label) : $filter('titleCase')(info.name.split('.').slice(-1)[0]);

          var template = '', closeTag = '';
          var classes = '';
          if (cssFrameworkService.framework() === 'bs3') {
            classes = 'form-group';
            if (options.formstyle === 'vertical' && info.size !== 'block-level') {
              template += '<div class="row">';
              classes += ' col-xs-' + sizeMapping[info.size ? sizeDescriptions.indexOf(info.size) : defaultSizeOffset];
              closeTag += '</div>';
            }
            template += '<div' + addAll('Group', classes, options);
            closeTag += '</div>';
          } else {
            if (isHorizontalStyle(options.formstyle)) {
              template += '<div' + addAll('Group', 'control-group', options);
              closeTag = '</div>';
            } else {
              template += '<span ';
              closeTag = '</span>';
            }
          }

          var includeIndex = false;
          if (options.index) {
            try {
              parseInt(options.index);
              includeIndex = true;
            } catch (err) {
              // Nothing to do
            }
          }
          if (info.showWhen) {
            if (typeof info.showWhen === 'string') {
              template += 'ng-show="' + info.showWhen + '"';
            } else {
              template += 'ng-show="' + generateNgShow(info.showWhen, options.model) + '"';
            }
          }
          if (includeIndex) {
            template += ' id="cg_' + info.id.replace('_', '-' + attrs.index + '-') + '">';
          } else {
            template += ' id="cg_' + info.id.replace(/\./g, '-') + '">';
          }

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
                  template += processInstructions(info.schema, null, {subschema: true, formStyle: options.formstyle, subkey: schemaDefName + '_subkey', subkeyno: arraySel});
                  template += topAndTail.after;
                }
                subkeys.push(info);
              } else {
                template += '<div class="schema-head">' + info.label +
                  '</div>' +
                  '<div ng-form class="' + (cssFrameworkService.framework() === 'bs2' ? 'row-fluid ' : '') +
                  convertFormStyleToClass(info.formStyle) + '" name="form_' + niceName + '{{$index}}" class="sub-doc well" id="' + info.id + 'List_{{$index}}" ' +
                  ' ng-repeat="subDoc in ' + (options.model || 'record') + '.' + info.name + ' track by $index">' +
                  '   <div class="' + (cssFrameworkService.framework() === 'bs2' ? 'row-fluid' : 'row') + ' sub-doc">' +
                  '      <div class="pull-left">' + processInstructions(info.schema, false, {subschema: true, formstyle: info.formStyle, model: options.model}) +
                  '      </div>';

                if (!info.noRemove || info.customSubDoc) {
                  template += '   <div class="pull-left sub-doc-btns">';
                  if (info.customSubDoc) {
                    template += info.customSubDoc;
                  }
                  if (!info.noRemove) {
                    if (cssFrameworkService.framework() === 'bs2') {
                      template += '      <button name="remove_' + info.id + '_btn" class="remove-btn btn btn-mini form-btn" ng-click="remove(\'' + info.name + '\',$index,$event)">' +
                        '          <i class="icon-minus">';

                    } else {
                      template += '      <button name="remove_' + info.id + '_btn" class="remove-btn btn btn-default btn-xs form-btn" ng-click="remove(\'' + info.name + '\',$index,$event)">' +
                        '          <i class="glyphicon glyphicon-minus">';
                    }
                    template += '          </i> Remove' +
                      '      </button>';
                  }
                  template += '  </div> ';
                }
                template += '   </div>' +
                  '</div>';
                if (!info.noAdd || info.customFooter) {
                  template += '<div class = "schema-foot">';
                  if (info.customFooter) {
                    template += info.customFooter;
                  }
                  if (!info.noAdd) {
                    if (cssFrameworkService.framework() === 'bs2') {
                      template += '    <button id="add_' + info.id + '_btn" class="add-btn btn btn-mini form-btn" ng-click="add(\'' + info.name + '\',$event)">' +
                        '        <i class="icon-plus"></i> Add';
                    } else {
                      template += '    <button id="add_' + info.id + '_btn" class="add-btn btn btn-default btn-xs form-btn" ng-click="add(\'' + info.name + '\',$event)">' +
                        '        <i class="glyphicon glyphicon-plus"></i> Add';
                    }
                    template += '    </button>';
                  }
                  template += '</div>';
                }
              }
            }
          }
          else {
            // Handle arrays here
            var controlClass = [];
            if (isHorizontalStyle(options.formstyle)) {
              controlClass.push(cssFrameworkService.framework() === 'bs2' ? 'controls' : 'col-sm-10');
            }
            if (info.array) {
              controlClass.push('fng-array');
              if (options.formstyle === 'inline') { throw 'Cannot use arrays in an inline form'; }
              if (cssFrameworkService.framework() === 'bs2') {
                template += generateLabel(info, ' <i id="add_' + info.id + '" ng-click="add(\'' + info.name + '\',$event)" class="icon-plus-sign"></i>', options) +
                  '<div class="' + controlClass.join(' ') + '" id="' + info.id + 'List" ng-repeat="arrayItem in ' + (options.model || 'record') + '.' + info.name + '">' +
                  generateInput(info, 'arrayItem.x', true, info.id + '_{{$index}}', options) +
                  '<i ng-click="remove(\'' + info.name + '\',$index,$event)" id="remove_' + info.id + '_{{$index}}" class="icon-minus-sign"></i>' +
                  '</div>';
              } else {
                template += generateLabel(info, ' <i id="add_' + info.id + '" ng-click="add(\'' + info.name + '\',$event)" class="glyphicon glyphicon-plus-sign"></i>', options) +
                  '<div ng-class="skipCols($index)" class="' + controlClass.join(' ') + '" id="' + info.id + 'List" ng-repeat="arrayItem in ' + (options.model || 'record') + '.' + info.name + '">' +
                  generateInput(info, 'arrayItem.x', true, info.id + '_{{$index}}', options) +
                  '<i ng-click="remove(\'' + info.name + '\',$index,$event)" id="remove_' + info.id + '_{{$index}}" class="glyphicon glyphicon-minus-sign"></i>' +
                  '</div>';
              }
            } else {
              // Single fields here
              template += generateLabel(info, null, options);
              if (controlClass.length > 0) { template += '<div class="' + controlClass.join(' ') + '">'; }
              template += generateInput(info, null, options.required, info.id, options);
              if (controlClass.length > 0) { template += '</div>'; }
            }
          }
          template += closeTag;
          return template;
        };

//              var processInstructions = function (instructionsArray, topLevel, groupId) {
//  removing groupId as it was only used when called by containerType container, which is removed for now
        var processInstructions = function (instructionsArray, topLevel, options) {
          var result = '';
          if (instructionsArray) {
            for (var anInstruction = 0; anInstruction < instructionsArray.length; anInstruction++) {
              var info = instructionsArray[anInstruction];
              if (anInstruction === 0 && topLevel && !options.schema.match(/$_schema_/)) {
                info.add = (info.add || '');
                if (info.add.indexOf('ui-date') === -1 && !options.noautofocus && !info.containerType) {
                  info.add = info.add + 'autofocus ';
                }
              }
              var callHandleField = true;
              if (info.directive) {
                var directiveName = info.directive;
                var newElement = '<' + directiveName + ' model="' + (options.model || 'record') + '"';
                var thisElement = element[0];
                for (var i = 0; i < thisElement.attributes.length; i++) {
                  var thisAttr = thisElement.attributes[i];
                  switch (thisAttr.nodeName) {
                    case 'class' :
                      var classes = thisAttr.nodeValue.replace('ng-scope', '');
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
                      newElement += ' ' + thisAttr.nodeName + '="' + thisAttr.nodeValue + '"';
                  }
                }
                newElement += '></' + directiveName + '>';
                result += newElement;
                callHandleField = false;
              } else if (info.containerType) {
                var parts = containerInstructions(info);
                switch (info.containerType) {
                  case 'tab' :
                    // maintain support for simplified tabset syntax for now
                    if (!tabsSetup) {
                      tabsSetup = 'forced';
                      result += '<tabset>';
                    }

                    result += parts.before;
                    result += processInstructions(info.content, null, options);
                    result += parts.after;
                    break;
                  case 'tabset' :
                    tabsSetup = true;
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
                if (_.find(objectToSearch, function (value, key) {
                  return scope[options.subkey].path + '.' + key === info.name;
                })) {
                  callHandleField = false;
                }
              }
              if (callHandleField) {
                //                            if (groupId) {
                //                                scope['showHide' + groupId] = true;
                //                            }
                result += handleField(info, options);
              }
            }
          } else {
            console.log('Empty array passed to processInstructions');
            result = '';
          }
          return result;

        };

        var unwatch = scope.$watch(attrs.schema, function (newValue) {
          if (newValue) {
            newValue = angular.isArray(newValue) ? newValue : [newValue];   // otherwise some old tests stop working for no real reason
            if (newValue.length > 0) {
              unwatch();
              var elementHtml = '';
              var theRecord = scope[attrs.model || 'record'];      // By default data comes from scope.record
              if ((attrs.subschema || attrs.model) && !attrs.forceform) {
                elementHtml = '';
              } else {
                scope.topLevelFormName = attrs.name || 'myForm';     // Form name defaults to myForm
                // Copy attrs we don't process into form
                var customAttrs = '';
                for (var thisAttr in attrs) {
                  if (attrs.hasOwnProperty(thisAttr)) {
                    if (thisAttr[0] !== '$' && ['name', 'formstyle', 'schema', 'subschema', 'model'].indexOf(thisAttr) === -1) {
                      customAttrs += ' ' + attrs.$attr[thisAttr] + '="' + attrs[thisAttr] + '"';
                    }
                  }
                }
                elementHtml = '<form name="' + scope.topLevelFormName + '" class="' + convertFormStyleToClass(attrs.formstyle) + ' novalidate"' + customAttrs + '>';
              }
              if (theRecord === scope.topLevelFormName) { throw new Error('Model and Name must be distinct - they are both ' + theRecord); }
              elementHtml += processInstructions(newValue, true, attrs);
              if (tabsSetup === 'forced') {
                elementHtml += '</tabset>';
              }
              elementHtml += attrs.subschema ? '' : '</form>';
              element.replaceWith($compile(elementHtml)(scope));
              // If there are subkeys we need to fix up ng-model references when record is read
              if (subkeys.length > 0) {
                var unwatch2 = scope.$watch('phase', function (newValue) {
                  if (newValue === 'ready') {
                    unwatch2();
                    for (var subkeyCtr = 0; subkeyCtr < subkeys.length; subkeyCtr++) {
                      var info = subkeys[subkeyCtr],
                        arrayOffset,
                        matching,
                        arrayToProcess = angular.isArray(info.subkey) ? info.subkey : [info.subkey];

                      for (var thisOffset = 0; thisOffset < arrayToProcess.length; thisOffset++) {
                        var thisSubkeyList = arrayToProcess[thisOffset].keyList;
                        var dataVal = theRecord[info.name] = theRecord[info.name] || [];
                        for (arrayOffset = 0; arrayOffset < dataVal.length; arrayOffset++) {
                          matching = true;
                          for (var keyField in thisSubkeyList) {
                            if (thisSubkeyList.hasOwnProperty(keyField)) {
                              // Not (currently) concerned with objects here - just simple types
                              if (dataVal[arrayOffset][keyField] !== thisSubkeyList[keyField]) {
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
                          // There is no matching array element - we need to create one
                          arrayOffset = theRecord[info.name].push(thisSubkeyList) - 1;
                        }
                        scope['$_arrayOffset_' + info.name.replace(/\./g, '_') + '_' + thisOffset] = arrayOffset;
                      }
                    }
                  }
                });
              }

              $rootScope.$broadcast('formInputDone');

              if (scope.updateDataDependentDisplay && theRecord && Object.keys(theRecord).length > 0) {
                // If this is not a test force the data dependent updates to the DOM
                scope.updateDataDependentDisplay(theRecord, null, true);
              }
            }
          }

        }, true);

        function addAll(type, additionalClasses, options) {
          var action = 'getAddAll' + type + 'Options';
          return utils[action](scope, options, additionalClasses) || [];
        }
      }
    };
  }])
;
