formsAngular
    .directive('formInput', ['$compile', '$rootScope','utils', function ($compile, $rootScope, utils) {
        return {
            restrict: 'E',
            compile: function () {
                return function (scope, element, attrs) {

//                    generate markup for bootstrap forms
//
//                    Horizontal (default)
//                    <div class="control-group">
//                        <label class="control-label" for="inputEmail">Email</label>
//                        <div class="controls">
//                            <input type="text" id="inputEmail" placeholder="Email">
//                        </div>
//                    </div>
//
//                    Vertical
//                    <label>Label name</label>
//                    <input type="text" placeholder="Type something…">
//                    <span class="help-block">Example block-level help text here.</span>
//
//                    Inline
//                    <input type="text" class="input-small" placeholder="Email">

                    var elementHtml = ''
                        , subkeys = []
                        , tabsSetup = false;

                    scope.toggleFolder = function(groupId) {
                        scope['showHide'+groupId] = !scope['showHide' + groupId];
                        $('i.' + groupId).toggleClass('icon-folder-open icon-folder-close');
                    };

                    var isHorizontalStyle = function(formStyle) {
                        return (!formStyle || formStyle === "undefined" || formStyle === 'horizontal' || formStyle === 'horizontalCompact');
                    };

                    var generateInput = function (fieldInfo, modelString, isRequired, idString) {
                        if (!modelString) {
                            // We are dealing with an array of sub schemas
                            if (attrs.subschema && fieldInfo.name.indexOf('.') != -1) {
                                // Schema handling - need to massage the ngModel and the id
                                var compoundName = fieldInfo.name,
                                    lastPartStart = compoundName.lastIndexOf('.');

                                if (attrs.subkey) {
                                    modelString = 'record.' + compoundName.slice(0, lastPartStart) + '[' + '__arrayOffset_' + compoundName.slice(0, lastPartStart).replace(/\./g,'_') + '_' + attrs.subkeyno + '].' + compoundName.slice(lastPartStart + 1);
                                    idString = compoundName + '_subkey';
                                } else {
                                    modelString = 'record.' + compoundName.slice(0, lastPartStart) + '.' + scope.$index + '.' + compoundName.slice(lastPartStart + 1);
                                    idString = modelString.slice(7).replace(/\./g, '-')
                                }
                            } else {
                                modelString = (attrs.model || 'record') + '.' + fieldInfo.name;
                            }
                        }
                        var value
                            , requiredStr = (isRequired || fieldInfo.required) ? ' required' : ''
                            , readonlyStr = fieldInfo.readonly ? ' readonly' : ''
                            , placeHolder = fieldInfo.placeHolder;

                        if (attrs.formstyle === 'inline') placeHolder = placeHolder || fieldInfo.label;
                        var common = 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '" ' : ' ') + (placeHolder ? ('placeholder="' + placeHolder + '" ') : "");
                        common += addAll("Field");
                        if (fieldInfo.type === 'select') {
                            common += (fieldInfo.readonly ? 'disabled ' : '');
                            if (fieldInfo.select2) {
                                common += 'class="fng-select2' + (fieldInfo.size ? ' input-' + fieldInfo.size : '') + '"';
                                if (fieldInfo.select2.fngAjax) {
                                    value = '<div class="input-append">';
                                    value += '<input ui-select2="' + fieldInfo.select2.fngAjax + '" ' + common + '>';
                                    value += '<button class="btn" type="button" data-select2-open="' + idString + '" ng-click="openSelect2($event)"><i class="icon-search"></i></button>';
                                    value += '</div>';
                                } else if (fieldInfo.select2) {
                                    value = '<input ui-select2="' + fieldInfo.select2.s2query + '" ' + (fieldInfo.readonly ? 'disabled ' : '') + common + '>';
                                }
                            } else {
                                value = '<select ' + common + (fieldInfo.size ? 'class="input-' + fieldInfo.size + '" ' : '') + '>';
                                if (!isRequired) {
                                    value += '<option></option>';
                                }
                                value += '<option ng-repeat="option in ' + fieldInfo.options + '">{{option}}</option>';
                                value += '</select>';
                            }
                        } else if (fieldInfo.type === 'link') {
                            value = '<a ng-href="/#/' + fieldInfo.ref + (fieldInfo.form ? '/'+fieldInfo.form : '') + '/{{ ' + modelString + '}}/edit">' + fieldInfo.linkText + '</a>';
                        } else {
                            common += (fieldInfo.size ? 'class="input-' + fieldInfo.size + '" ' : '') + (fieldInfo.add ? fieldInfo.add : '') + 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '"' : '') + requiredStr + readonlyStr + ' ';
                            if (fieldInfo.type == 'textarea') {
                                if (fieldInfo.rows) {
                                    if (fieldInfo.rows == 'auto') {
                                        common += 'msd-elastic="\n" class="ng-animate" ';
                                    } else {
                                        common += 'rows = "' + fieldInfo.rows + '" ';
                                    }
                                }
                                value = '<textarea ' + common + ' />';
                            } else {
                                value = '<input ' + common + 'type="' + fieldInfo.type + '"';
                                if (attrs.formstyle === 'inline') {
                                    if (!fieldInfo.size) {
                                        value += ' class="input-small"';
                                    }
                                }
                                value += ' />';
                            }
                        }
                        if (fieldInfo.helpInline) {
                            value += '<span class="help-inline">' + fieldInfo.helpInline + '</span>';
                        }
                        if (fieldInfo.help) {
                            value += '<span class="help-block">' + fieldInfo.help + '</span>';
                        }
                        return value;
                    };

                    var convertFormStyleToClass = function(aFormStyle) {
                        switch (aFormStyle) {
                            case 'horizontal' :
                                return 'form-horizontal';
                                break;
                            case 'vertical' :
                                return '';
                                break;
                            case 'inline' :
                                return 'form-inline';
                                break;
                            case 'horizontalCompact' :
                                return 'form-horizontal compact';
                                break;
                            default:
                                return 'form-horizontal compact';
                                break;
                        }
                    };

                    var containerInstructions = function(info) {
                        var result = {before:'', after:''};
                        switch (info.containerType) {
                            case 'pane' :
                                result.before = '<pane heading="' + info.title + '" active="' + (info.active || 'false') + '">';
                                result.after = '</pane>';
                                break;
                            case 'tab' :
                                result.before = '<tabs>';
                                result.after = '</tabs>';
                                break;
                            case 'well' :
                                result.before = '<div class="well">';
                                if (info.title) {
                                    result.before += '<h4>' + info.title + '</h4>';
                                }
                                result.after = '</div>';
                                break;
                            case 'well-large' :
                                result.before = '<div class="well well-large">';
                                result.after = '</div>';
                                break;
                            case 'well-small' :
                                result.before = '<div class="well well-small">';
                                result.after = '</div>';
                                break;
                            case 'fieldset' :
                                result.before = '<fieldset>';
                                if (info.title) {
                                    result.before += '<legend>' + info.title + '</legend>';
                                }
                                result.after = '</fieldset>';
                                break;
                            case 'container' :
                                result.before = '<fieldset>';
                                if (info.title) {
                                    result.before += '<a ng-click="toggleFolder(\''+ info.id +'\')" class="container-header"><i class="icon-folder-open ' + info.id + '"></i>';
                                    result.before +=  info.title ;
                                    result.before += '</a><i class="icon-plus-sign"></i>';

                                }
                                processInstructions(info.content, null, info.id);
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
                                    var titleLook = info.titleTagOrClass || "h4";
                                    if (titleLook.match(/h[1-6]/)) {
                                        result.before += '<' + titleLook + '>' + info.title + '</' + info.titleLook + '>';
                                    } else {
                                        result.before += '<p class="' + titleLook + '">'+ info.title +'</p>'
                                    }
                                }
                                result.after = '</div>';
                                break;
                        }
                        return result;
                    };

                    var generateLabel = function (fieldInfo, addButtonMarkup) {
                        var labelHTML = '';
                        if ((attrs.formstyle !== 'inline' && fieldInfo.label !== '') || addButtonMarkup) {
                            labelHTML = '<label';
                            if (isHorizontalStyle(attrs.formstyle)) {
                                labelHTML += ' for="' + fieldInfo.id + '"' + addAll('Label', 'control-label');
                            }
                            labelHTML += '>' + fieldInfo.label + (addButtonMarkup || '') + '</label>';
                        }
                        return labelHTML;
                    };

                    var processSubKey = function(niceName, thisSubkey, schemaDefName, info, subkeyNo) {
                        scope['__arrayOffset_' + niceName + '_' + subkeyNo] = 0;
                        var topAndTail = containerInstructions(thisSubkey);
                        var markup = topAndTail.before;
                        markup += '<form-input schema="' + schemaDefName + '" subschema="true" formStyle="' + attrs.formstyle + '" subkey="' + schemaDefName+'_subkey" subkeyno = "' + subkeyNo + '"></form-input>';
                        markup += topAndTail.after;
                        return markup;
                    };

                    var handleField = function (info, parentId) {

                        var parentString = (parentId ? ' ui-toggle="showHide' + parentId + '"' : '')
                        , styling = isHorizontalStyle(attrs.formstyle)
                        , template = styling ? '<div' + addAll("Group", 'control-group') + parentString + ' id="cg_' + info.id + '">' : '<span ' + parentString + ' id="cg_' + info.id + '">';
                        if (info.schema) {
                            //schemas (which means they are arrays in Mongoose)

                            var niceName = info.name.replace(/\./g,'_');
                            var schemaDefName = '__schema_' + niceName;
                            scope[schemaDefName] = info.schema;

                            // Check for subkey - selecting out one or more of the array
                            if (info.subkey) {
                                info.subkey.path = info.name;
                                scope[schemaDefName+'_subkey'] = info.subkey;

                                if (angular.isArray(info.subkey)) {
                                    for (var arraySel = 0 ; arraySel < info.subkey.length; arraySel++) {
                                        template += processSubKey(niceName, info.subkey[arraySel], schemaDefName, info, arraySel);
                                    }
                                } else {
                                    template += processSubKey(niceName, info.subkey, schemaDefName, info, '0');
                                }
                                subkeys.push(info);
                            } else {
                                template += '<div class="schema-head">' + info.label + '</div>' +
                                    '<div ng-form class="' + convertFormStyleToClass(info.formStyle) + '" name="form_' + niceName + '{{$index}}" class="sub-doc well" id="' + info.id + 'List_{{$index}}" ng-repeat="subDoc in record.' + info.name + ' track by $index">' +
                                    '<div class="row-fluid sub-doc">' +
                                    '<div class="pull-left">' +
                                    '<form-input schema="' + schemaDefName + '" subschema="true" formStyle="' + info.formStyle + '"></form-input>' +
                                    '</div>';

                                if (!info.noRemove) {
                                    template += '<div class="pull-left sub-doc-btns">' +
                                        '<button id="remove_' + info.id + '_btn" class="btn btn-mini form-btn" ng-click="remove(\''+info.name+'\',$index)">' +
                                        '<i class="icon-minus"></i> Remove' +
                                        '</button>' +
                                        '</div> '
                                }

                                template += '</div>' +
                                    '</div>' +
                                    '<div class = "schema-foot">';
                                if (!info.noAdd) {
                                    template += '<button id="add_' + info.id + '_btn" class="btn btn-mini form-btn" ng-click="add(\''+info.name+'\')">' +
                                        '<i class="icon-plus"></i> Add' +
                                        '</button>'
                                }
                                template += '</div>';
                            }
                        } else {
                            // Handle arrays here
                            var controlClass = (isHorizontalStyle(attrs.formstyle)) ? ' class="controls"' : '';
                            if (info.array) {
                                if (attrs.formstyle === 'inline') throw "Cannot use arrays in an inline form";
                                template += generateLabel(info, ' <i id="add_' + info.id + '" ng-click="add(\''+info.name+'\')" class="icon-plus-sign"></i>') +
                                    '<div '+controlClass+' id="' + info.id + 'List" ng-repeat="arrayItem in record.' + info.name + '">' +
                                    generateInput(info, "arrayItem.x", true, info.id + '_{{$index}}') +
                                    '<i ng-click="remove(\''+info.name+'\',$index)" id="remove_' + info.id + '_{{$index}}" class="icon-minus-sign"></i>' +
                                    '</div>';
                            } else {
                                // Single fields here
                                template += generateLabel(info);
                                if (controlClass !== '') template += '<div '+controlClass+'>';
                                template += generateInput(info, null, attrs.required, info.id);
                                if (controlClass !== '') template += '</div>';
                            }
                        }
                        template += styling ? '</div>' : '</span>';
                        return template;
                    };

                    var processInstructions = function (instructionsArray, topLevel, groupId) {
                        for (var anInstruction = 0; anInstruction < instructionsArray.length; anInstruction++) {
                            var info = instructionsArray[anInstruction];
                            if (anInstruction === 0  && topLevel && !attrs.schema.match(/__schema_/)) {
                                info.add = (info.add || '');
                                if (info.add.indexOf('ui-date') == -1) {
                                    info.add = info.add + "autofocus ";
                                }
                            }
                            var callHandleField = true;
                            if (info.directive) {
                                var directiveName = info.directive;
                                var newElement = '<' + directiveName;
                                var thisElement = element[0];
                                for (var i = 0; i < thisElement.attributes.length; i++) {
                                    var thisAttr = thisElement.attributes[i];
                                    switch (thisAttr.nodeName) {
                                        case 'ng-repeat' :
                                            break;
                                        case 'class' :
                                            var classes = thisAttr.nodeValue.replace('ng-scope', '');
                                            if (classes.length > 0) {
                                                newElement += ' class="' + classes + '"';
                                            }
                                            break;
                                        case 'schema' :
                                            var options = angular.copy(info);
                                            delete options.directive;
                                            var bespokeSchemaDefName = ('bespoke_' + info.name).replace(/\./g,'_');
                                            newElement += ' ng-init="' + bespokeSchemaDefName + '=[' + JSON.stringify(options).replace(/\"/g,"'") + ']" schema="' + bespokeSchemaDefName + '"';
                                            break;
                                        default :
                                            newElement += ' ' + thisAttr.nodeName + '="' + thisAttr.nodeValue + '"';
                                    }
                                }
                                newElement += '></' + directiveName + '>';
                                elementHtml += newElement;
                                callHandleField = false;
                            } else if (info.containerType) {
                                var parts = containerInstructions(info);
                                switch (info.containerType) {
                                    case 'pane' :
                                        // maintain support for simplified pane syntax for now
                                        if (!tabsSetup) {
                                            tabsSetup = 'forced';
                                            elementHtml += '<tabs>';
                                        }

                                        elementHtml += parts.before;
                                        processInstructions(info.content);
                                        elementHtml += parts.after;
                                        break;
                                    case 'tab' :
                                        tabsSetup = true;
                                        elementHtml += parts.before;
                                        processInstructions(info.content);
                                        elementHtml += parts.after;
                                        break;
                                    case 'container' :
                                        elementHtml += parts.before;
                                        processInstructions(info.content, null, info.id);
                                        elementHtml += parts.after;
                                        break;
                                    default:
                                        // includes wells, fieldset
                                        elementHtml += parts.before;
                                        processInstructions(info.content);
                                        elementHtml += parts.after;
                                        break;
                                }
                                callHandleField = false;
                            } else if (attrs.subkey) {
                                // Don't do fields that form part of the subkey
                                var objectToSearch = angular.isArray(scope[attrs.subkey]) ? scope[attrs.subkey][0].keyList : scope[attrs.subkey].keyList;
                                if (_.find(objectToSearch, function(value, key){return scope[attrs.subkey].path + '.' + key === info.name})) {
                                    callHandleField = false;
                                }
                            }
                            if (callHandleField) {
                                if (groupId) {
                                    scope['showHide' + groupId] = true;
                                }
                                elementHtml += handleField(info, groupId);
                            }
                            // Todo - find a better way of communicating with controllers
                        }
                    };

                    var unwatch = scope.$watch(attrs.schema, function (newValue) {
                        if (newValue) {
                            if (!angular.isArray(newValue)) {
                                newValue = [newValue];   // otherwise some old tests stop working for no real reason
                            }
                            if (newValue.length > 0) {
                                unwatch();
                                elementHtml = '';
                                processInstructions(newValue, true);
                                if (tabsSetup === 'forced') {
                                    elementHtml += '</tabs>';
                                }
                                element.replaceWith($compile(elementHtml)(scope));

                                // If there are subkeys we need to fix up ng-model references when record is read
                                if (subkeys.length > 0) {

                                    var unwatch2 = scope.$watch('phase', function (newValue) {
                                        if (newValue === 'ready') {
                                            unwatch2();
                                            for (var subkeyCtr = 0 ; subkeyCtr < subkeys.length ; subkeyCtr ++) {
                                                var info = subkeys[subkeyCtr],
                                                    arrayOffset,
                                                    matching,
                                                    arrayToProcess;

                                                if (!angular.isArray(info.subkey)) {
                                                    arrayToProcess = [info.subkey];
                                                } else {
                                                    arrayToProcess = info.subkey;
                                                }
                                                for (var thisOffset = 0; thisOffset < arrayToProcess.length; thisOffset++) {
                                                    var thisSubkeyList = arrayToProcess[thisOffset].keyList;
                                                    var dataVal = scope.record[info.name] = scope.record[info.name] || [];
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
                                                        arrayOffset = scope.record[info.name].push(thisSubkeyList) - 1;
                                                    }
                                                    scope['__arrayOffset_' + info.name.replace(/\./g,'_') + '_' + thisOffset] = arrayOffset;
                                                }
                                            }
                                        }
                                    });
                                }

                                $rootScope.$broadcast('formInputDone');

                                if (scope.updateDataDependentDisplay) {
                                    // If this is not a test force the data dependent updates to the DOM
                                    scope.updateDataDependentDisplay(scope.record, null, true);
                                }
                            }
                        }

                    }, true);

                    function addAll (type, additionalClasses) {

                        var action = 'getAddAll' + type + 'Options';

                        return utils[action](scope, attrs, additionalClasses) || [];

                    }
                }
            }
        }
    }]);
