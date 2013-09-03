formsAngular
    .directive('formInput', ['$compile', '$rootScope', function ($compile, $rootScope) {
        return {
            restrict: 'E',
            replace: true,
            priority: 1,
            compile: function () {
                return function (scope, element, attrs) {
                    scope.$watch(attrs.formInput, function () {

                        //this function handles MoveOptions for drag and drop plugin angular-ui:drag-drop (http://codef0rmer.github.com/angular-dragdrop/)
                        //api looks like this:
                        // <form-input ng-repeat="field in formSchema" info="{{field}}" moveOptions="{
                        // 'drag-drop': true, 
                        // 'ng-model': 'record', 
                        // 'class': 'dragelement', 
                        // 'data-jqyoui-options': '{revert: true}', 
                        // 'jqyoui-draggable': {'animate':false, 'onDrop': 'onDrop'}
                        // }"></form-input>
                        // TODO - only works with the sample drag drop app pre-release 2/9/13
                        var parseMoveOptions = function () {

                            var jqyouiDraggable
                                , opt
                                , fieldName;

                            if (attrs.moveoptions) {
                                opt = JSON.parse(attrs.moveoptions.replace(/'/g, '"'));

                                fieldName = (opt['ng-model'] || 'record') + '.' + JSON.parse(attrs.info).name

                                if (opt['jqyoui-draggable']) {
                                  jqyouiDraggable =  JSON.stringify(opt['jqyoui-draggable']).replace(/"/g, "'") 
                                } else {
                                    jqyouiDraggable = '';
                                }

                                 return  ' data-drag="' + opt['drag-drop'] + '" ng-model="' + fieldName + '" class="' + opt['class'] + '" data-jqyoui-options="' + opt['data-jqyoui-options'] + '" jqyoui-draggable="' + jqyouiDraggable + '" ';
                            }  
                            
                        };

                        var generateInput = function (fieldInfo, modelString, isRequired, idString) {
                            var focusStr = '', placeHolder = '';
                            if (!modelString) {
                                if (fieldInfo.name.indexOf('.') != -1 && element[0].outerHTML.indexOf('schema="true"') != -1) {
                                    // Schema handling - need to massage the ngModel and the id
                                    var compoundName = fieldInfo.name,
                                        lastPartStart = compoundName.lastIndexOf('.');
                                    modelString = 'record.' + compoundName.slice(0, lastPartStart) + '.' + scope.$parent.$index + '.' + compoundName.slice(lastPartStart + 1);
                                    idString = modelString.slice(7).replace(/\./g, '-')
                                } else {
                                    modelString = (attrs.model || 'record') + '.' + fieldInfo.name;
                                    if (scope.$index === 0) {
                                        focusStr = "autofocus ";
                                    }
                                }
                            }
                            var value
                                , requiredStr = (isRequired || fieldInfo.required) ? ' required' : ''
                                , readonlyStr = fieldInfo.readonly ? ' readonly' : ''
                                , common;

                            var common = focusStr + 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '" ' : ' ') + (fieldInfo.placeHolder ? ('placeholder="'+fieldInfo.placeHolder+'" ') : "");
                            if (fieldInfo.type === 'select') {
                                common += (fieldInfo.readonly ? 'disabled ' : '');
                                if (fieldInfo.select2) {
                                    common += 'class="fng-select2' + (fieldInfo.size ? ' input-' + fieldInfo.size : '') + '"';
                                    if ( fieldInfo.select2.fngAjax) {
                                        value  = '<div class="input-append">';
                                        value +=   '<input ui-select2="' + fieldInfo.select2.fngAjax +'" ' + common + '>';
                                        value +=   '<button class="btn" type="button" data-select2-open="' + idString + '" ng-click="openSelect2($event)"><i class="icon-search"></i></button>';
                                        value += '</div>';
                                    } else if (fieldInfo.select2) {
                                        value = '<input ui-select2="'+ fieldInfo.select2.s2query +'" ' + (fieldInfo.readonly ? 'disabled ' : '') + common + '>';
                                    }
                                } else {
                                    value = '<select ' + common + (fieldInfo.size ? 'class="input-' + fieldInfo.size + '" ' : '')+ '>';
                                    if (!isRequired) { value += '<option></option>';}
                                    value += '<option ng-repeat="option in ' + fieldInfo.options + '">{{option}}</option>';
                                    value += '</select>';
                                }
                            } else if (fieldInfo.type === 'link') {
                                value = '<a ng-href="/#/' + fieldInfo.ref + '/{{ ' + modelString  + '}}/edit">' + fieldInfo.linkText + '</a>';
                            } else {
                                common += (fieldInfo.size ? 'class="input-' + fieldInfo.size + '" ' : '') + (fieldInfo.add ? fieldInfo.add : '') + 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '"' : '') + requiredStr + readonlyStr + ' ';
                                if (fieldInfo.type == 'textarea') {
                                    value = '<textarea ' + common + (fieldInfo.rows ? 'rows = "' + fieldInfo.rows + '" ' : '') + ' />';
                                } else {
                                    value = '<input '    + common + 'type="' + info.type + '" />';
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
                            var template = '<div class="control-group" id="cg_' + info.id + '" ' + parseMoveOptions() + '>';
                            if (info.schema) {
                                //schemas (which means they are arrays in Mongoose)

                                var schemaLoop;
                                if (scope.formSchema[scope.$index] && info.id === scope.formSchema[scope.$index].id) {
                                    schemaLoop = 'field in formSchema[' + scope.$index + '].schema'
                                } else {
                                    // we are in a pane
                                    schemaLoop = 'field in panes[' + scope.$parent.$index + '].content[' + scope.$index + '].schema'
                                }

                                template += '<div class="schema-head well">' + info.label + '</div>' +
// for angular 1.0 branch     '<div class="sub-doc well" id="' + info.id + 'List" ng-subdoc-repeat="subDoc in record.' + info.name + '">' +
                                '<div class="sub-doc well" id="' + info.id + 'List[{{$index}}]" ng-repeat="subDoc in record.' + info.name + ' track by $index">' +
                                    '<div class="row-fluid">' +
                                    '<div class="pull-left">' +
                                    '<form-input ng-repeat="' + schemaLoop + '" info="{{field}}" schema="true"></form-input>' +
                                    '</div>';

                                if (!info.noRemove) {
                                    template += '<div class="pull-left sub-doc-btns">' +
                                        '<button id="remove_' + info.id + '_btn" class="btn btn-mini form-btn" ng-click="remove(this,$index)">' +
                                        '<i class="icon-minus"></i> Remove' +
                                        '</button>' +
                                        '</div> '
                                }

                                template += '</div>' +
                                    '</div>' +
                                    '<div class = "schema-foot well">';
                                if (!info.noAdd) {
                                    template += '<button id="add_' + info.id + '_btn" class="btn btn-mini form-btn" ng-click="add(this)">' +
                                        '<i class="icon-plus"></i> Add' +
                                        '</button>'
                                }
                                template += '</div>';

                            } else {
                                // Handle arrays here
                                if (info.array) {
                                    template += generateLabel(info, ' <i id="add_' + info.id + '" ng-click="add(this)" class="icon-plus-sign"></i>') +
                                        '<div class="controls" id="' + info.id + 'List" ng-repeat="arrayItem in record.' + info.name + '">' +
                                        generateInput(info, "arrayItem.x", true, info.id+'[{{$index}}]') +
                                        '<i ng-click="remove(this,$index)" class="icon-minus-sign"></i>' +
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

                        var info = JSON.parse(attrs.info);
                        if (info.directive) {
                            var newElement = '<' + info.directive;
                            var thisElement = element[0];
                            for (var i = 0; i < thisElement.attributes.length; i++) {
                                var thisAttr = thisElement.attributes[i];
                                switch (thisAttr.nodeName) {
                                    case 'ng-repeat' :
                                        break;
                                    case 'class' :
                                        var classes = thisAttr.nodeValue.replace('ng-scope','');
                                        if (classes.length > 0) {
                                            newElement += ' class="' + classes + '"';
                                        }
                                        break;
                                    case 'info' :
                                        var options = JSON.parse(thisAttr.nodeValue);
                                        delete options.directive;
                                        newElement += ' info="' + JSON.stringify(options).replace(/\"/g,'&quot;') + '"';
                                        break;
                                    default :
                                        newElement += ' ' + thisAttr.nodeName + '="' + thisAttr.nodeValue + '"';
                                }
                            }
                            newElement += '></' + info.directive + '>';
                            element.replaceWith($compile(newElement)(scope));
                        } else {
                            var template = handleField(info);
                            element.replaceWith($compile(template)(scope));
                        }

                        if (scope.updateDataDependentDisplay) {
                            // If this is not a test force the data dependent updates to the DOM
                            scope.updateDataDependentDisplay(scope.record, null, true);
                        }
                        // Todo - find a better way of communicating with controllers
                        $rootScope.$broadcast('formInputDone',info)
                    });
                };
            }
        };
    }]);

