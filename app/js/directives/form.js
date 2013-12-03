formsAngular
    .directive('formInput', ['$compile', '$rootScope', 'utils', function ($compile, $rootScope, utils) {
        return {
            restrict: 'EA',
            link: function (scope, element, attrs) {

//                generate markup for bootstrap forms
//
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

                var subkeys = []
                    , tabsSetup = false;

                var isHorizontalStyle = function (formStyle) {
                    return (!formStyle || formStyle === "undefined" || formStyle === 'horizontal' || formStyle === 'horizontalCompact');
                };

                var generateInput = function (fieldInfo, modelString, isRequired, idString, options) {
                    var nameString;
                    if (!modelString) {
                        modelString = (options.model || 'record') + '.';
                        if (options.subschema && fieldInfo.name.indexOf('.') != -1) {
                            // Schema handling - need to massage the ngModel and the id
                            var compoundName = fieldInfo.name,
                                lastPartStart = compoundName.lastIndexOf('.'),
                                lastPart = compoundName.slice(lastPartStart + 1);
                            if (options.index) {
                                var cut = modelString.length;
                                modelString += compoundName.slice(0, lastPartStart) + '.' + options.index + '.' + lastPart;
                                idString = 'f_' + modelString.slice(cut).replace(/\./g, '-')
                            } else {
                                modelString += compoundName.slice(0, lastPartStart);
                                if (options.subkey) {
                                    modelString += '[' + '$_arrayOffset_' + compoundName.slice(0, lastPartStart).replace(/\./g, '_') + '_' + options.subkeyno + '].' + lastPart;
                                    idString = compoundName + '_subkey';
                                } else {
                                    modelString += '[$index].' + lastPart;
                                    idString = null;
                                    nameString = compoundName.replace(/\./g,'-')
                                }
                            }
                        } else {
                            modelString += fieldInfo.name;
                        }
                    }
                    var value
                        , requiredStr = (isRequired || fieldInfo.required) ? ' required' : ''
                        , readonlyStr = fieldInfo.readonly ? ' readonly' : ''
                        , placeHolder = fieldInfo.placeHolder;

                    if (options.formstyle === 'inline') placeHolder = placeHolder || fieldInfo.label;
                    var common = 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '" ' : ' name="'+ nameString +'" ') + (placeHolder ? ('placeholder="' + placeHolder + '" ') : "");
                    if (fieldInfo.popup) {
                        common += 'title="' + fieldInfo.popup + '" ';
                    }
                    common += addAll("Field", null, options);
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
                        value = '<a ng-href="/#/' + fieldInfo.ref + (fieldInfo.form ? '/' + fieldInfo.form : '') + '/{{ ' + modelString + '}}/edit">' + fieldInfo.linkText + '</a>';
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
                            if (options.formstyle === 'inline') {
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

                var convertFormStyleToClass = function (aFormStyle) {
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

                var containerInstructions = function (info) {
                    var result = {before: '', after: ''};
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
//  Don't understand this seems to be introducing generic container as containerType?  Removing for now
//                        case 'container' :
//                            result.before = '<fieldset>';
//                            if (info.title) {
//                                result.before += '<a ng-click="toggleFolder(\''+ info.id +'\')" class="container-header"><i class="icon-folder-open ' + info.id + '"></i>';
//                                result.before +=  info.title ;
//                                result.before += '</a><i class="icon-plus-sign"></i>';
//
//                            }
//                            processInstructions(info.content, null, info.id);
//                            result.after = '</fieldset>';
//                            break;
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
                                    result.before += '<p class="' + titleLook + '">' + info.title + '</p>'
                                }
                            }
                            result.after = '</div>';
                            break;
                    }
                    return result;
                };

                var generateLabel = function (fieldInfo, addButtonMarkup, options) {
                    var labelHTML = '';
                    if ((options.formstyle !== 'inline' && fieldInfo.label !== '') || addButtonMarkup) {
                        labelHTML = '<label';
                        if (isHorizontalStyle(options.formstyle)) {
                            labelHTML += ' for="' + fieldInfo.id + '"' + addAll('Label', 'control-label', options);
                        }
                        labelHTML += addAll('Label', 'control-label', options);
                        labelHTML += '>' + fieldInfo.label + (addButtonMarkup || '') + '</label>';
                    }
                    return labelHTML;
                };

                var handleField = function (info, options) {

//                    var parentString = (parentId ? ' ui-toggle="showHide' + parentId + '"' : '')
                    var template = '', closeTag = '';
                    if (isHorizontalStyle(options.formstyle)) {
                        template += '<div' + addAll("Group", 'control-group', options);
                        closeTag = '</div>';
                    } else {
                        template += '<span ';
                        closeTag = '</span>';
                    }

//                  template += (parentId ? ' ui-toggle="showHide' + parentId + '"' : '') + ' id="cg_' + info.id.replace('.', '-' + attrs.index + '-') + '">';
                    var includeIndex = false;
                    if (options.index) {
                        try {
                            parseInt(options.index);
                            includeIndex = true
                        } catch(err) {
                            // Nothing to do
                        }
                    }
                    if (includeIndex) {
                        template += ' id="cg_' + info.id.replace('.', '-' + attrs.index + '-') + '">';
                    } else {
                        template += ' id="cg_' + info.id.replace(/\./g,'-') + '">';
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
                                template += '<div class="schema-head">' + info.label + '</div>' +
                                    '<div ng-form class="' + convertFormStyleToClass(info.formStyle) + '" name="form_' + niceName + '{{$index}}" class="sub-doc well" id="' + info.id + 'List_{{$index}}" ng-repeat="subDoc in ' + (options.model || 'record') + '.' + info.name + ' track by $index">' +
                                    '<div class="row-fluid sub-doc">' +
                                    '<div class="pull-left">' +
                                    processInstructions(info.schema, false, {subschema: true, formstyle: info.formStyle}) +
                                    '</div>';

                                if (!info.noRemove) {
                                    template += '<div class="pull-left sub-doc-btns">' +
                                        '<button name="remove_' + info.id + '_btn" class="remove-btn btn btn-mini form-btn" ng-click="remove(\'' + info.name + '\',$index,$event)">' +
                                        '<i class="icon-minus"></i> Remove' +
                                        '</button>' +
                                        '</div> '
                                }

                                template += '</div>' +
                                    '</div>' +
                                    '<div class = "schema-foot">';
                                if (!info.noAdd) {
                                    template += '<button id="add_' + info.id + '_btn" class="add-btn btn btn-mini form-btn" ng-click="add(\'' + info.name + '\',$event)">' +
                                        '<i class="icon-plus"></i> Add' +
                                        '</button>'
                                }
                                template += '</div>';
                            }
                        }
                    }
                    else {
                        // Handle arrays here
                        var controlClass = ['fng-array'];
                        if (isHorizontalStyle(options.formstyle)) {controlClass.push('controls'); }
                        if (info.array) {
                            if (options.formstyle === 'inline') throw "Cannot use arrays in an inline form";
                            template += generateLabel(info, ' <i id="add_' + info.id + '" ng-click="add(\'' + info.name + '\',$event)" class="icon-plus-sign"></i>', options) +
                                '<div class="' + controlClass.join(' ') + '" id="' + info.id + 'List" ng-repeat="arrayItem in ' + (options.model || 'record') + '.' + info.name + '">' +
                                generateInput(info, "arrayItem.x", true, info.id + '_{{$index}}', options) +
                                '<i ng-click="remove(\'' + info.name + '\',$index,$event)" id="remove_' + info.id + '_{{$index}}" class="icon-minus-sign"></i>' +
                                '</div>';
                        } else {
                            // Single fields here
                            template += generateLabel(info, null, options);
                            if (controlClass !== '') template += '<div ' + controlClass + '>';
                            template += generateInput(info, null, options.required, info.id, options);
                            if (controlClass !== '') template += '</div>';
                        }
                    }
                    template += closeTag;
                    return template;
                };

//              var processInstructions = function (instructionsArray, topLevel, groupId) {
//  removing groupId as it was only used when called by containerType container, which is removed for now
                var processInstructions = function (instructionsArray, topLevel, options) {
                    var result = '';
                    for (var anInstruction = 0; anInstruction < instructionsArray.length; anInstruction++) {
                        var info = instructionsArray[anInstruction];
                        if (anInstruction === 0 && topLevel && !options.schema.match(/$_schema_/)) {
                            info.add = (info.add || '');
                            if (info.add.indexOf('ui-date') == -1) {
                                info.add = info.add + "autofocus ";
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
                                case 'pane' :
                                    // maintain support for simplified pane syntax for now
                                    if (!tabsSetup) {
                                        tabsSetup = 'forced';
                                        result += '<tabs>';
                                    }

                                    result += parts.before;
                                    result += processInstructions(info.content, null, options);
                                    result += parts.after;
                                    break;
                                case 'tab' :
                                    tabsSetup = true;
                                    result += parts.before;
                                    result += processInstructions(info.content, null, options);
                                    result += parts.after;
                                    break;
//  Don't understand this seems to be introducing generic container as containerType?  Removing for now
//                                case 'container' :
//                                    result += parts.before;
//                                    processInstructions(info.content, null, info.id);
//                                    result += parts.after;
//                                    break;
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
                                return scope[options.subkey].path + '.' + key === info.name
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
                    return result;
                };

                var unwatch = scope.$watch(attrs.schema, function (newValue) {
                    if (newValue) {
                        newValue = angular.isArray(newValue) ? newValue : [newValue];   // otherwise some old tests stop working for no real reason
                        if (newValue.length > 0) {
                            unwatch();
                            scope.topLevelFormName = attrs.name || 'myForm';     // Form name defaults to myForm
                            var theRecord = scope[attrs.model || 'record'];      // By default data comes from scope.record
                            var elementHtml = attrs.subschema ? '' : '<form name="' + scope.topLevelFormName + '" class="' + convertFormStyleToClass(attrs.style) + ' novalidate">';
                            elementHtml += processInstructions(newValue, true, attrs);
                            if (tabsSetup === 'forced') {
                                elementHtml += '</tabs>';
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

                            if (scope.updateDataDependentDisplay) {
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
        }
    }])
;
