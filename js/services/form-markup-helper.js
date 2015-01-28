'use strict';

formsAngular.factory('formMarkupHelper', [
  'cssFrameworkService', 'inputSizeHelper', 'addAllService',
  function (cssFrameworkService, inputSizeHelper, addAllService) {
    var exports = {};

    exports.isHorizontalStyle = function (formStyle) {
      return (!formStyle || formStyle === 'undefined' || ['vertical', 'inline'].indexOf(formStyle) === -1);
    };

    exports.fieldChrome = function (scope, info, options, insert) {
      var classes = '';
      var template = '';
      var closeTag = '';

      if (cssFrameworkService.framework() === 'bs3') {
        classes = 'form-group';
        if (options.formstyle === 'vertical' && info.size !== 'block-level') {
          template += '<div class="row">';
          classes += ' col-sm-' + inputSizeHelper.sizeAsNumber(info.size);
          closeTag += '</div>';
        }
        template += '<div' + addAllService.addAll(scope, 'Group', classes, options);
        closeTag += '</div>';
      } else {
        if (exports.isHorizontalStyle(options.formstyle)) {
          template += '<div' + addAllService.addAll(scope, 'Group', 'control-group', options);
          closeTag = '</div>';
        } else {
          template += '<span ';
          closeTag = '</span>';
        }
      }
      template += (insert || '') + '>';
      return {template: template, closeTag: closeTag};
    };

    exports.label = function (scope, fieldInfo, addButtonMarkup, options) {
      var labelHTML = '';
      if ((cssFrameworkService.framework() === 'bs3' || (options.formstyle !== 'inline' && fieldInfo.label !== '')) || addButtonMarkup) {
        labelHTML = '<label';
        var classes = 'control-label';
        if (exports.isHorizontalStyle(options.formstyle)) {
          labelHTML += ' for="' + fieldInfo.id + '"';
          if (typeof fieldInfo.labelDefaultClass !== 'undefined') {
            // Override default label class (can be empty)
            classes += ' ' + fieldInfo.labelDefaultClass;
          } else if (cssFrameworkService.framework() === 'bs3') {
            classes += ' col-sm-2';
          }
        } else if (options.formstyle === 'inline') {
          labelHTML += ' for="' + fieldInfo.id + '"';
          classes += ' sr-only';
        }
        labelHTML += addAllService.addAll(scope, 'Label', null, options) + ' class="' + classes + '">' + fieldInfo.label;
        if (addButtonMarkup) {
          labelHTML += ' <i id="add_' + fieldInfo.id + '" ng-click="add(\'' + fieldInfo.name + '\',$event)" class="' + exports.glyphClass() + '-plus-sign"></i>';
        }
        labelHTML += '</label>';
      }
      return labelHTML;
    };

    exports.glyphClass = function() {
      return (cssFrameworkService.framework() === 'bs2') ? 'icon' : 'glyphicon glyphicon';
    };

    exports.allInputsVars = function (scope, fieldInfo, options, modelString, idString, nameString) {

      var placeHolder = fieldInfo.placeHolder;

      var common;
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

      if (options.formstyle === 'inline') {
        placeHolder = placeHolder || fieldInfo.label;
      }
      common = 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '" ' : ' name="' + nameString + '" ');
      common += (placeHolder ? ('placeholder="' + placeHolder + '" ') : '');
      if (fieldInfo.popup) {
        common += 'title="' + fieldInfo.popup + '" ';
      }
      common += addAllService.addAll(scope, 'Field', null, options);
      return {
        common: common,
        sizeClassBS3: sizeClassBS3,
        sizeClassBS2: sizeClassBS2,
        compactClass: compactClass,
        formControl: formControl
      };
    };

    exports.inputChrome = function (value, fieldInfo, options, markupVars) {
      if (cssFrameworkService.framework() === 'bs3' && exports.isHorizontalStyle(options.formstyle) && fieldInfo.type !== 'checkbox') {
        value = '<div class="bs3-input ' + markupVars.sizeClassBS3 + '">' + value + '</div>';
      }
      if (fieldInfo.helpInline) {
        value += '<span class="' + (cssFrameworkService.framework() === 'bs2' ? 'help-inline' : 'help-block') + '">' + fieldInfo.helpInline + '</span>';
      }
      if (fieldInfo.help) {
        value += '<span class="help-block">' + fieldInfo.help + '</span>';
      }
      return value;
    };

    exports.generateSimpleInput = function (common, fieldInfo, options) {
      var result = '<input ' + common + 'type="' + fieldInfo.type + '"';
      if (options.formstyle === 'inline' && cssFrameworkService.framework() === 'bs2' && !fieldInfo.size) {
        result += 'class="input-small"';
      }
      result += ' />';
      return result;
    };

    exports.controlDivClasses = function (options) {
      var result = [];
      if (exports.isHorizontalStyle(options.formstyle)) {
        result.push(cssFrameworkService.framework() === 'bs2' ? 'controls' : 'col-sm-10');
      }
      return result;
    };

    exports.handleInputAndControlDiv = function (inputMarkup, controlDivClasses) {
      if (controlDivClasses.length > 0) {
        inputMarkup = '<div class="' + controlDivClasses.join(' ') + '">' + inputMarkup + '</div>';
      }
      return inputMarkup;
    };

    exports.handleArrayInputAndControlDiv = function(inputMarkup, controlDivClasses, info, options) {
      var result = '<div ';
      if (cssFrameworkService.framework() === 'bs3') { result += 'ng-class="skipCols($index)" '; }
      result += 'class="' + controlDivClasses.join(' ') + '" id="' + info.id + 'List" ';
      result += 'ng-repeat="arrayItem in ' + (options.model || 'record') + '.' + info.name + ' track by $index">';
      result += inputMarkup;
      result += '<i ng-click="remove(\'' + info.name + '\',$index,$event)" id="remove_' + info.id + '_{{$index}}" class="' + exports.glyphClass() + '-minus-sign"></i>';
      result += '</div>';
      return result;
    };

    exports.addTextInputMarkup = function(allInputsVars, fieldInfo, requiredStr) {
      var result = '';
      var setClass = allInputsVars.formControl.trim() + allInputsVars.compactClass + allInputsVars.sizeClassBS2 + (fieldInfo.class ? ' ' + fieldInfo.class : '');
      if (setClass.length !== 0) { result += 'class="' + setClass + '"' ; }
      if (fieldInfo.add) { result += ' ' + fieldInfo.add + ' '; }
      result += requiredStr + (fieldInfo.readonly ? ' readonly' : '') + ' ';
      return result;
    };

    return exports;
  }]);

