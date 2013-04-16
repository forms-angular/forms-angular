angular.module('formsAngular.form', [])
    .directive('formInput', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            priority: 1,
            compile: function () {
                return function (scope, element, attrs) {
                    scope.$watch(attrs.formInput, function () {

                        var generateInput = function (fieldInfo, modelString, isRequired, idString) {
                            var focusStr = '';
                            if (!modelString) {
                                if (fieldInfo.name.indexOf('.') != -1 && element[0].outerHTML.indexOf('schema="true"') != -1) {
                                    // Schema handling - need to massage the ngModel and the id
                                    var compoundName = fieldInfo.name,
                                        lastPartStart = compoundName.lastIndexOf('.');
                                    modelString = 'record.' + compoundName.slice(0, lastPartStart) + '.' + scope.$parent.$index + '.' + compoundName.slice(lastPartStart + 1);
                                    idString = modelString.replace(/\./g, '-')
                                } else {
                                    modelString = 'record.' + fieldInfo.name;
                                    if (scope.$index === 0) {
                                        focusStr = "autofocus ";
                                    }
                                }
                            }
                            var value
                                , requiredStr = (isRequired || fieldInfo.required) ? ' required' : '';

                            if (fieldInfo.type == 'select') {
                                value = '<select ' + focusStr + 'ng-model="' + modelString + '" id="' + idString + '" name="' + idString + '">';
                                value += '<option ng-repeat="option in ' + fieldInfo.options + '">{{option}}</option>';
                                value += '</select>';
                            } else if (fieldInfo.type == 'textarea') {
                                value = '<textarea ' + focusStr + (fieldInfo.rows ? 'rows = "' + fieldInfo.rows + '" ' : '') + 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '"' : '') + requiredStr + (fieldInfo.add ? fieldInfo.add : '') + ' />';
                            } else {
                                value = '<input ' + focusStr + 'type="' + info.type + '" ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '"' : '') + requiredStr + (fieldInfo.add ? fieldInfo.add : '') + '/>';
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
                            var template = '<div class="control-group" id="cg_' + info.id + '">';
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
                                    '<div class="sub-doc well" id="' + info.id + 'List" ng-subdoc-repeat="subDoc in record.' + info.name + '">' +
// When upgrade to 1.14 works OK    '<div class="sub-doc well" id="' + info.id + 'List" ng-repeat="subDoc in record.' + info.name + ' track by $index">' +
                                    '<div class="row-fluid">' +
                                    '<div class="pull-left">' +
                                    '<form-input ng-repeat="' + schemaLoop + '" info="{{field}}" schema="true"></form-input>' +
                                    '</div>' +
                                    '<div class="pull-left sub-doc-btns">' +
                                    '<button id="remove_' + info.id + '_btn" class="btn btn-mini form-btn" ng-click="remove(this,$index)">' +
                                    '<i class="icon-minus"></i> Remove' +
                                    '</button>' +
                                    '</div> ' +
                                    '</div>' +
                                    '</div>' +
                                    '<div class = "schema-foot well">' +
                                    '<button id="add_' + info.id + '_btn" class="btn btn-mini form-btn" ng-click="add(this)">' +
                                    '<i class="icon-plus"></i> Add' +
                                    '</button>' +
                                    '</div>';

                            } else {
                                // Handle arrays here
                                if (info.array) {
                                    template += generateLabel(info, ' <i id="add_' + info.id + ' " ng-click="add(this)" class="icon-plus-sign"></i>') +
                                        '<div class="controls" id="' + info.id + 'List" ng-repeat="arrayItem in record.' + info.name + '">' +
                                        generateInput(info, "arrayItem.x", true, null) +
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
                            thisElement = element[0];
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
                                        newElement += ' info="' + JSON.stringify(options).replace(/\"/g,'&quot;') + '"'
                                        break;
                                    default :
                                        newElement += ' ' + thisAttr.nodeName + '="' + thisAttr.nodeValue + '"';
                                }
                            }
                            newElement += '></' + info.directive + '>'
                            element.replaceWith($compile(newElement)(scope));
                        } else {
                            var template = handleField(info);
                            element.replaceWith($compile(template)(scope));
                        }

                        if (scope.updateDataDependentDisplay) {
                            // If this is not a test force the data dependent updates to the DOM
                            scope.updateDataDependentDisplay(scope.record, null, true);
                        }
                    });
                };
            }
        };
    })

    .directive('formButtons', function ($compile) {
        return {
            restrict: 'A',
            compile: function () {
                return function ($scope, $element) {
                    var template = '<div class="btn-group pull-right">' +
                        '<button id="saveButton" class="btn btn-mini btn-primary form-btn" ng-click="save()" ' +
                        'ng-disabled="isSaveDisabled()"><i class="icon-ok"></i> Save</button>' +
                        '<button id="cancelButton" class="btn btn-mini btn-warning form-btn" ng-click="cancel()" ' +
                        'ng-disabled="isCancelDisabled()"><i class="icon-remove"></i> Cancel</button>' +
                        '</div>' +
                        '<div class="btn-group btn-group pull-right">' +
                        '<button id="newButton" class="btn btn-mini btn-success form-btn" ng-click="new()">' +
                        '<i class="icon-plus"></i> New</button>' +
                        '<button id="deleteButton" class="btn btn-mini btn-danger form-btn" ng-click="delete()">' +
                        '<i class="icon-minus"></i> Delete</button>' +
                        '</div>';
                    $element.replaceWith($compile(template)($scope));
                }
            }
        }
    })

// Directive to handle subdocs.  Mostly a copy of ng-repeat, but needed to simplify it a bit to make it work
    .directive('ngSubdocRepeat', function () {
        return {
            transclude: 'element',
            priority: 1000,
            terminal: true,
            compile: function (element, attr, linker) {
                return function (scope, iterStartElement, attr) {
                    var expression = attr.ngSubdocRepeat;
                    var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
                        lhs, rhs, valueIdent, keyIdent;
                    if (!match) {
                        throw Error("Expected ngSubdocRepeat in form of '_item_ in _collection_' but got '" +
                            expression + "'.");
                    }
                    lhs = match[1];
                    rhs = match[2];
                    match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
                    if (!match) {
                        throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
                            lhs + "'.");
                    }
                    valueIdent = match[3] || match[1];
                    keyIdent = match[2];

                    // Store a list of elements from previous run - an array of objects with following properties:
                    //   - scope: bound scope
                    //   - element: previous element.
                    var lastOrderArr = [];

                    scope.$watch(function ngSubdocRepeatWatch(scope) {
                        var index, length,
                            collection = scope.$eval(rhs),
                            cursor = iterStartElement,     // current position of the node
                        // Same as lastOrder but it has the current state. It will become the
                        // lastOrder on the next iteration.
                            nextOrderArr = [],
                            arrayLength,
                            childScope,
                            key, value, // key/value of iteration
                            array,
                            last;       // last object information {scope, element, index}
                        if (!angular.isArray(collection)) {
                            // if object, extract keys, sort them and use to determine order of iteration over obj props
                            array = [];
                            for (key in collection) {
                                if (collection.hasOwnProperty(key) && key.charAt(0) != '$') {
                                    array.push(key);
                                }
                            }
                            array.sort();
                        } else {
                            array = collection || [];
                        }

                        arrayLength = array.length;

                        // we are not using forEach for perf reasons (trying to avoid #call)
                        for (index = 0, length = array.length; index < length; index++) {
                            key = (collection === array) ? index : array[index];
                            value = collection[key];

                            last = lastOrderArr.shift();

                            if (last) {
                                // if we have already seen this object, then we need to reuse the
                                // associated scope/element
                                childScope = last.scope;
                                nextOrderArr.push(last);
                                cursor = last.element;
                            } else {
                                // new item which we don't know about
                                childScope = scope.$new();
                            }

                            childScope[valueIdent] = value;
                            if (keyIdent) childScope[keyIdent] = key;
                            childScope.$index = index;

                            childScope.$first = (index === 0);
                            childScope.$last = (index === (arrayLength - 1));
                            childScope.$middle = !(childScope.$first || childScope.$last);

                            if (!last) {
                                linker(childScope, function (clone) {
                                    cursor.after(clone);
                                    last = {
                                        scope: childScope,
                                        element: (cursor = clone),
                                        index: index
                                    };
                                    nextOrderArr.push(last);
                                });
                            }
                        }

                        //shrink children
                        for (var j = 0; j < lastOrderArr.length ; j++) {
                            lastOrderArr[j].element.remove();
                            lastOrderArr[j].scope.$destroy();
                        }

                        lastOrderArr = nextOrderArr;
                    });
                };
            }
        }
    });

