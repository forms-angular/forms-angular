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


                            if (attrs.subschema && fieldInfo.name.indexOf('.') != -1 && attrs.index) { //scope.$index doesn't work for hierarchies

                                // Schema handling - need to massage the ngModel and the id
                                var compoundName = fieldInfo.name,
                                    lastPartStart = compoundName.lastIndexOf('.'),
                                    // thisArrayIndex = scope.record[compoundName.slice(0, lastPartStart)].length-1;
                                modelString = 'record.' + compoundName.slice(0, lastPartStart) + '.' + attrs.index + '.' + compoundName.slice(lastPartStart + 1);
                                idString = modelString.slice(7).replace(/\./g, '-')

                            }

                            // We are dealing with an array of sub schemas
                            else
                             if (attrs.subschema && fieldInfo.name.indexOf('.') != -1) {
                                // Schema handling - need to massage the ngModel and the id
                                var compoundName = fieldInfo.name,
                                    lastPartStart = compoundName.lastIndexOf('.');
                                modelString = 'record.' + compoundName.slice(0, lastPartStart) + '.' + scope.$index + '.' + compoundName.slice(lastPartStart + 1);
                                idString = modelString.slice(7).replace(/\./g, '-')
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
                        common +=   addAll("Field");
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
                            value = '<a ng-href="/#/' + fieldInfo.ref + '/{{ ' + modelString + '}}/edit">' + fieldInfo.linkText + '</a>';
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

                    var handleField = function (info, parentId) {

                        var parentString = (parentId ? ' ui-toggle="showHide' + parentId + '"' : '');

                          var template = isHorizontalStyle(attrs.formstyle) ? '<div' + addAll("Group", 'control-group') + parentString + ' id="cg_' + info.id + '">' : '<div ' + parentString + ' id="cg_' + info.id + '">';

                          var template = '<div' + addAll("Group", 'control-group') + parentString +  ' id="cg_' + info.id + '">';

                        if (info.schema && info.hierarchy) {//display as a hierarchy not control group
                                                           
                            var schemaDefName = ('__schema_'+info.name).replace(/\./g,'_');

                            scope[schemaDefName] = info.schema;

                            template += '<fng-hierarchy-list data-record="record.' + info.name + '" data-schema="' + schemaDefName + '"></fng-hierarchy-list>';

                        } else
                         if (info.schema) { // display as a control group
                            //schemas (which means they are arrays in Mongoose)

                            var niceName = info.name.replace(/\./g,'_');
                            var schemaDefName = '__schema_' + niceName;
                            scope[schemaDefName] = info.schema;
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

                          else {
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
                        template += '</div>';
                        return template;
                    };

                    var processInstructions = function (instructionsArray, topLevel, groupId) {
                        for (var anInstruction = 0; anInstruction < instructionsArray.length; anInstruction++) {
                            var info = instructionsArray[anInstruction];
                            if (anInstruction === 0  && topLevel && !attrs.schema.match(/__schema_/) ) {
                                info.add = ((info.add || '') + "autofocus ");
                            }
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
                            } else if (info.containerType) {
                                switch (info.containerType) {
                                    case 'pane' :
                                        // maintain support for simplified pane syntax for now
                                        if (!tabsSetup) {
                                            tabsSetup = 'forced';
                                            elementHtml += '<tabs>';
                                        }
                                        elementHtml += '<pane heading="' + info.title + '" active="' + (info.active || 'false') + '">';
                                        processInstructions(info.content);
                                        elementHtml += '</pane>';
                                        break;
                                    case 'tab' :
                                        elementHtml += '<tabs>';
                                        processInstructions(info.content);
                                        elementHtml += '</tabs>';
                                        tabsSetup = true;
                                        break;
                                    case 'well' :
                                        elementHtml += '<div class="well">';
                                        processInstructions(info.content);
                                        elementHtml += '</div>';
                                        break;
                                    case 'well-large' :
                                        elementHtml += '<div class="well well-large">';
                                        processInstructions(info.content);
                                        elementHtml += '</div>';
                                        break;
                                    case 'well-small' :
                                        elementHtml += '<div class="well well-small">';
                                        processInstructions(info.content);
                                        elementHtml += '</div>';
                                        break;
                                    case 'fieldset' :
                                        elementHtml += '<fieldset>';
                                        if (info.title) {
                                            elementHtml += '<legend>' + info.title + '</legend>';
                                        }
                                        processInstructions(info.content);
                                        elementHtml += '</fieldset>';
                                        break;
                                    case 'container' :
                                        elementHtml += '<fieldset>';
                                        if (info.title) {
                                            elementHtml += '<a ng-click="toggleFolder(\''+ info.id +'\')" class="container-header"><i class="icon-folder-open ' + info.id + '"></i>';
                                            elementHtml +=  info.title ;
                                            elementHtml += '</a><i class="icon-plus-sign"></i>';

                                        }
                                        processInstructions(info.content, null, info.id);
                                        elementHtml += '</fieldset>';
                                        break; 
                                    default:
                                        elementHtml += '<div class="' + info.containerType + '">';
                                        if (info.title) {
                                            var titleLook = info.titleTagOrClass || "";
                                            if (titleLook.match(/h[1-6]/)) {
                                                elementHtml += '<' + titleLook + '>' + info.title + '</' + info.titleLook + '>';
                                            } else {
                                                elementHtml += '<p class="' + titleLook + '">'+ info.title +'</p>'
                                            }
                                        }
                                        processInstructions(info.content);
                                        elementHtml += '</fieldset>';
                                        break;
                                }
                            } else {
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
