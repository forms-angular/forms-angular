formsAngular
    .directive('formInput', ['$compile', '$rootScope','utils', function ($compile, $rootScope, utils) {
        return {
            restrict: 'E',
            compile: function () {
                return function (scope, element, attrs) {

                    var elementHtml = ''
                        , tabsSetup = false

                    var parseMoveOptions = function (info) {
                        //this function handles MoveOptions for drag and drop plugin angular-ui:drag-drop (http://codef0rmer.github.com/angular-dragdrop/)
                        //api looks like this:
                        // <form-input schema="formSchema" moveOptions="{
                        // 'drag-drop': true,
                        // 'ng-model': 'record',
                        // 'class': 'dragelement',
                        // 'data-jqyoui-options': '{revert: true}',
                        // 'jqyoui-draggable': {'animate':false, 'onDrop': 'onDrop'}
                        // }"></form-input>
                        // TODO - only works with the sample drag drop app pre-release 2/9/13

                        var jqyouiDraggable
                            , opt
                            , fieldName
                            , optionsString = '';

                        if (attrs.moveoptions) {
                            opt = JSON.parse(attrs.moveoptions.replace(/'/g, '"'));

                            fieldName = (opt['ng-model'] || 'record') + '.' + info.name.replace(" ", "");

                            if (opt['jqyoui-draggable']) {
                                jqyouiDraggable = JSON.stringify(opt['jqyoui-draggable']).replace(/"/g, "'")
                            } else {
                                jqyouiDraggable = '';
                            }

                            optionsString = ' data-drag="' + opt['drag-drop'] + '" ng-model="' + fieldName + '" class="' + opt['class'] + '" data-jqyoui-options="' + opt['data-jqyoui-options'] + '" jqyoui-draggable="' + jqyouiDraggable + '" ';
                        }
                        return optionsString;
                    };

                    var generateInput = function (fieldInfo, modelString, isRequired, idString) {
                        if (!modelString) {
                            // We are dealing with an array of sub schemas
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
                            , readonlyStr = fieldInfo.readonly ? ' readonly' : '';

                        var common = 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '" ' : ' ') + (fieldInfo.placeHolder ? ('placeholder="' + fieldInfo.placeHolder + '" ') : "");
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
                                value = '<input ' + common + 'type="' + fieldInfo.type + '" />';
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

                    var generateLabel = function (fieldInfo, addButton) {
                        var labelHTML = '';
                        if (fieldInfo.label !== '' || addButton) {
                            labelHTML = '<label class="control-label" for="' + fieldInfo.id + '">' + fieldInfo.label + (addButton || '') + '</label>';
                        }
                        return labelHTML;
                    };

                    var handleField = function (info) {
                        var template = '<div' + addAll("Group") + 'class="control-group" id="cg_' + info.id + '" ' + parseMoveOptions(info) + '>';
                        if (info.schema) {
                            //schemas (which means they are arrays in Mongoose)

                            var schemaDefName = ('__schema_'+info.name).replace(/\./g,'_');
                            scope[schemaDefName] = info.schema;
                            template += '<div class="schema-head well">' + info.label + '</div>' +
                                '<div class="sub-doc well" id="' + info.id + 'List_{{$index}}" ng-repeat="subDoc in record.' + info.name + ' track by $index">' +
                                '<div class="row-fluid">' +
                                '<div class="pull-left">' +
                                '<form-input schema="' + schemaDefName + '" subschema="true"></form-input>' +
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
                                '<div class = "schema-foot well">';
                            if (!info.noAdd) {
                                template += '<button id="add_' + info.id + '_btn" class="btn btn-mini form-btn" ng-click="add(\''+info.name+'\')">' +
                                    '<i class="icon-plus"></i> Add' +
                                    '</button>'
                            }
                            template += '</div>';

                        } else {
                            // Handle arrays here
                            if (info.array) {
                                template += generateLabel(info, ' <i id="add_' + info.id + '" ng-click="add(\''+info.name+'\')" class="icon-plus-sign"></i>') +
                                    '<div class="controls" id="' + info.id + 'List" ng-repeat="arrayItem in record.' + info.name + '">' +
                                    generateInput(info, "arrayItem.x", true, info.id + '_{{$index}}') +
                                    '<i ng-click="remove(\''+info.name+'\',$index)" id="remove_' + info.id + '_{{$index}}" class="icon-minus-sign"></i>' +
                                    '</div>';
                            } else {
                                // Single fields here
                                template += generateLabel(info) +
                                    '<div class="controls">' +
                                    generateInput(info, null, attrs.required, info.id) +
                                    '</div>';
                            }
                        }
                        template += '</div>';
                        return template;
                    };

                    var processInstructions = function (instructionsArray, topLevel) {
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
                                elementHtml += handleField(info);
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

                    function addAll (type) {

                        var action = 'getAddAll' + type + 'Options'

                        return utils[action](scope, attrs) || [];

                    }
                }
            }
        }
    }]);
