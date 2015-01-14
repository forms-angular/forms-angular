'use strict';

/**
 *
 * Manipulate record items for generating a form
 *
 * All methods should be state-less
 *
 */

formsAngular.factory('formGenerator', function (
    $location, $timeout,
    SubmissionsService, routingService, recordHandler) {
    var exports = {};

    // utility for apps that use forms-angular
    exports.generateEditUrl = function (obj, $scope) {
        return routingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + obj._id + '/edit');
    };

    exports.generateNewUrl = function ($scope) {
        return routingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + 'new');
    };


    function updateInvalidClasses(value, id, select2, ctrlState) {
        var target = '#' + ((select2) ? 'cg_' : '') + id;
        var element = angular.element(document.querySelector(target));
        if (value) {
            element.removeClass(ctrlState.fngInvalidRequired);
        } else {
            element.addClass(ctrlState.fngInvalidRequired);
        }
    }


    exports.handleSchema = function (description, source, destForm, destList, prefix, doRecursion, $scope, ctrlState, handleError) {

        function handletabInfo(tabName, thisInst) {
            var tabTitle = angular.copy(tabName);
            var tab = _.find($scope.tabs, function (atab) {
                return atab.title === tabTitle;
            });
            if (!tab) {
                if ($scope.tabs.length === 0) {
                    if ($scope.formSchema.length > 0) {
                        $scope.tabs.push({title: 'Main', content: [], active: ($scope.tab==='Main' || !$scope.tab)});
                        tab = $scope.tabs[0];
                        for (var i = 0; i < $scope.formSchema.length; i++) {
                            tab.content.push($scope.formSchema[i]);
                        }
                    }
                }
              tab = $scope.tabs[$scope.tabs.push({title: tabTitle, containerType: 'tab', content: [], active: (tabTitle===$scope.tab)}) - 1];
            }
            tab.content.push(thisInst);
        }

        for (var field in source) {
            if (field !== '_id' && source.hasOwnProperty(field)) {
                var mongooseType = source[field],
                    mongooseOptions = mongooseType.options || {};
                var formData = mongooseOptions.form || {};
                if (!formData.hidden) {
                    if (mongooseType.schema) {
                        if (doRecursion && destForm) {
                            var schemaSchema = [];
                            exports.handleSchema('Nested ' + field, mongooseType.schema, schemaSchema, null, field + '.', true, $scope, ctrlState, handleError);
                            var sectionInstructions = basicInstructions(field, formData, prefix);
                            sectionInstructions.schema = schemaSchema;
                            if (formData.tab) {
                                handletabInfo(formData.tab, sectionInstructions);
                            }
                            if (formData.order !== undefined) {
                                destForm.splice(formData.order, 0, sectionInstructions);
                            } else {
                                destForm.push(sectionInstructions);
                            }
                        }
                    } else {
                        if (destForm) {
                            var formInstructions = basicInstructions(field, formData, prefix);
                            if (handleConditionals(formInstructions.showIf, formInstructions.name, $scope) && field !== 'options') {
                                var formInst = exports.handleFieldType(formInstructions, mongooseType, mongooseOptions, $scope, ctrlState, handleError);
                                if (formInst.tab) {
                                    handletabInfo(formInst.tab, formInst);
                                }
                                if (formData.order !== undefined) {
                                    destForm.splice(formData.order, 0, formInst);
                                } else {
                                    destForm.push(formInst);
                                }
                            }
                        }
                        if (destList) {
                            handleListInfo(destList, mongooseOptions.list, field);
                        }
                    }
                }
            }
        }
//        //if a hash is defined then make that the selected tab is displayed
//        if ($scope.tabs.length > 0 && $location.hash()) {
//            var tab = _.find($scope.tabs, function (atab) {
//                return atab.title === $location.hash();
//            });
//
//            if (tab) {
//                for (var i = 0; i < $scope.tabs.length; i++) {
//                    $scope.tabs[i].active = false;
//                }
//                tab.active = true;
//            }
//        }
//
//        //now add a hash for the active tab if none exists
//        if ($scope.tabs.length > 0 && !$location.hash()) {
//            console.log($scope.tabs[0]['title'])
//            $location.hash($scope.tabs[0]['title']);
//        }

        if (destList && destList.length === 0) {
            handleEmptyList(description, destList, destForm, source);
        }
    };

    exports.handleFieldType = function (formInstructions, mongooseType, mongooseOptions, $scope, ctrlState, handleError) {

        var select2ajaxName;
        if (mongooseType.caster) {
            formInstructions.array = true;
            mongooseType = mongooseType.caster;
            angular.extend(mongooseOptions, mongooseType.options);
            if (mongooseType.options && mongooseType.options.form) {
              angular.extend(formInstructions, mongooseType.options.form);
            }
        }
        if (mongooseType.instance === 'String') {
            if (mongooseOptions.enum) {
                formInstructions.type = formInstructions.type || 'select';
                if (formInstructions.select2) {
                    $scope.conversions[formInstructions.name] = formInstructions.select2;

                    // Hacky way to get required styling working on select2 controls
                if (mongooseOptions.required) {

                    $scope.$watch('record.' + formInstructions.name, function (newValue) {
                        updateInvalidClasses(newValue, formInstructions.id, formInstructions.select2, ctrlState);
                    }, true);
                    // FIXME: use $timeout?
                    setTimeout(function () {
                        updateInvalidClasses($scope.record[formInstructions.name], formInstructions.id, formInstructions.select2, ctrlState);
                    }, 0);
                }
                    if (formInstructions.select2 === true) {formInstructions.select2 = {}; }
                    formInstructions.select2.s2query = 'select2' + formInstructions.name.replace(/\./g, '_');
                    $scope[formInstructions.select2.s2query] = {
                        allowClear: !mongooseOptions.required,

                        initSelection: function (element, callback) {
                            function executeCallback() {

                                function drillIntoObject(parts, dataVal, fn) {
                                    if (dataVal) {
                                        if (parts.length === 0) {
                                            fn(dataVal);
                                        } else {
                                            if (angular.isArray(dataVal)) {
                                                // extract the array offset of the subkey from the element id
                                                var workString = element.context.getAttribute('ng-model');
                                                var pos = workString.indexOf('.'+parts[0]);
                                                workString = workString.slice(0,pos);
                                                pos = workString.lastIndexOf('.');
                                                workString = workString.slice(pos+1);
                                                workString = /.+\[(.+)\]/.exec(workString);
                                                dataVal = dataVal[$scope[workString[1]]];
                                            }
                                            dataVal = dataVal[parts.shift()];
                                            drillIntoObject(parts, dataVal, fn);
                                        }
                                    }
                                }

                                var dataVal = $scope.record;
                                if (dataVal) {
                                    var parts = formInstructions.name.split('.');
                                    drillIntoObject(parts, dataVal, function(leafVal) {
                                        setTimeout(updateInvalidClasses(leafVal, formInstructions.id, formInstructions.select2, ctrlState));
                                        if (leafVal) {
                                            if (formInstructions.array) {
                                                var offset = parseInt(element.context.id.match('_[0-9].*$')[0].slice(1));
                                                if (leafVal[offset].x) {
                                                    recordHandler.preservePristine(element, function() { callback(leafVal[offset].x);});
                                                }
                                            } else {
                                              recordHandler.preservePristine(element, function() { callback(leafVal);});
                                            }
                                        }
                                    });
                                } else {
                                    $timeout(executeCallback);
                                }
                            }
                            $timeout(executeCallback);
                        },
                        query: function (query) {
                            var data = {results: []},
                                searchString = query.term.toUpperCase();
                            for (var i = 0; i < mongooseOptions.enum.length; i++) {
                                if (mongooseOptions.enum[i].toUpperCase().indexOf(searchString) !== -1) {
                                    data.results.push({id: i, text: mongooseOptions.enum[i]});
                                }
                            }
                            query.callback(data);
                        }
                    };
                    _.extend($scope[formInstructions.select2.s2query], formInstructions.select2);
                    if (formInstructions.select2 === true) { formInstructions.select2 = {}; }  // In case they have used select2: true syntax
                    $scope.select2List.push(formInstructions.name);
                } else {
                    formInstructions.options = recordHandler.suffixCleanId(formInstructions, 'Options');
                    $scope[formInstructions.options] = mongooseOptions.enum;
                }
            } else {
                if (!formInstructions.type) {
                    formInstructions.type = (formInstructions.name.toLowerCase().indexOf('password') !== -1) ? 'password' : 'text';
                }
                if (mongooseOptions.match) {
                    formInstructions.add = 'pattern="' + mongooseOptions.match + '" ' + (formInstructions.add || '');
                }
            }
        } else if (mongooseType.instance === 'ObjectID') {
            formInstructions.ref = mongooseOptions.ref;
            if (formInstructions.link && formInstructions.link.linkOnly) {
                formInstructions.type = 'link';
                formInstructions.linkText = formInstructions.link.text;
                formInstructions.form = formInstructions.link.form;
                delete formInstructions.link;
            } else {
                formInstructions.type = 'select';

// Support both of the syntaxes below
//            team : [ { type: Schema.Types.ObjectId , ref: 'f_nested_schema', form: {select2: {fngAjax: true}}} ],
//            team2:   { type:[Schema.Types.ObjectId], ref: 'f_nested_schema', form: {select2: {fngAjax: true}}},
                if (formInstructions.select2 || (mongooseOptions.form && mongooseOptions.form.select2)) {
                    if (!formInstructions.select2) {formInstructions.select2 = mongooseOptions.form.select2;}
                    if (formInstructions.select2 === true) {formInstructions.select2 = {}; }
                    $scope.select2List.push(formInstructions.name);
                    $scope.conversions[formInstructions.name] = formInstructions.select2;
                    if (formInstructions.select2.fngAjax) {
                        // create the instructions for select2
                        select2ajaxName = 'ajax' + formInstructions.name.replace(/\./g, '');
                        // If not required then generate a place holder if none specified (see https://github.com/forms-angular/forms-angular/issues/53)
                        if (!mongooseOptions.required && !formInstructions.placeHolder) {
                            formInstructions.placeHolder = 'Select...';
                        }
                        $scope[select2ajaxName] = {
                            allowClear: !mongooseOptions.required,
                            minimumInputLength: 2,
                            initSelection: function (element, callback) {
                                var theId = element.val();
                                if (theId && theId !== '') {
                                  SubmissionsService.getListAttributes(mongooseOptions.ref, theId)
                                    .success(function (data) {
                                      if (data.success === false) {
                                        $location.path('/404');
                                      }
                                      var display = {id: theId, text: data.list};
                                      recordHandler.preservePristine(element, function () {
                                        callback(display);
                                      });
                                    }).error(handleError);
                                  //                                } else {
                                  //                                    throw new Error('select2 initSelection called without a value');
                                }
                            },
                            ajax: {
                                url: '/api/search/' + mongooseOptions.ref,
                                data: function (term, page) { // page is the one-based page number tracked by Select2
                                    var queryList = {
                                        q: term, //search term
                                        pageLimit: 10, // page size
                                        page: page // page number
                                    };
                                    var queryListExtension;
                                    if (typeof mongooseOptions.form.searchQuery === 'object') {
                                        queryListExtension = mongooseOptions.form.searchQuery;
                                    } else if (typeof mongooseOptions.form.searchQuery === 'function') {
                                        queryListExtension = mongooseOptions.form.searchQuery($scope, mongooseOptions);
                                    }
                                    if (queryListExtension){
                                        _.extend(queryList, queryListExtension);
                                    }
                                    return queryList;
                                },
                                results: function (data) {
                                    return {results: data.results, more: data.moreCount > 0};
                                }
                            }
                        };
                        _.extend($scope[select2ajaxName], formInstructions.select2);
                        formInstructions.select2.fngAjax = select2ajaxName;
                    } else {
                        if (formInstructions.select2 === true) {
                            formInstructions.select2 = {};
                        }
                        formInstructions.select2.s2query = 'select2' + formInstructions.name.replace(/\./g, '_');
                        $scope['select2' + formInstructions.select2.s2query] = {
                            allowClear: !mongooseOptions.required,
                            initSelection: function (element, callback) {
                                var myId = element.val();
                                if (myId !== '' && $scope[formInstructions.ids].length > 0) {
                                    var myVal = recordHandler.convertIdToListValue(myId, $scope[formInstructions.ids], $scope[formInstructions.options], formInstructions.name);
                                    var display = {id: myId, text: myVal};
                                    callback(display);
                                }
                            },
                            query: function (query) {
                                var data = {results: []},
                                    searchString = query.term.toUpperCase();
                                for (var i = 0; i < $scope[formInstructions.options].length; i++) {
                                    if ($scope[formInstructions.options][i].toUpperCase().indexOf(searchString) !== -1) {
                                        data.results.push({id: $scope[formInstructions.ids][i], text: $scope[formInstructions.options][i]});
                                    }
                                }
                                query.callback(data);
                            }
                        };
                        _.extend($scope[formInstructions.select2.s2query], formInstructions.select2);
                        formInstructions.options = recordHandler.suffixCleanId(formInstructions, 'Options');
                        formInstructions.ids = recordHandler.suffixCleanId(formInstructions, '_ids');
                        recordHandler.setUpSelectOptions(mongooseOptions.ref, formInstructions, $scope, ctrlState, exports.handleSchema, handleError);
                    }
                } else if (!formInstructions.directive ||
                  !formInstructions[$.camelCase(formInstructions.directive)] ||
                  !formInstructions[$.camelCase(formInstructions.directive)].fngAjax
                ) {
                    formInstructions.options = recordHandler.suffixCleanId(formInstructions, 'Options');
                    formInstructions.ids = recordHandler.suffixCleanId(formInstructions, '_ids');
                    recordHandler.setUpSelectOptions(mongooseOptions.ref, formInstructions, $scope, ctrlState, exports.handleSchema, handleError);
                }
            }
        } else if (mongooseType.instance === 'Date') {
            if (!formInstructions.type) {
                if (formInstructions.readonly) {
                    formInstructions.type = 'text';
                } else {
                    formInstructions.type = 'text';
                    formInstructions.add = 'ui-date ui-date-format datepicker-popup-fix ';
                }
            }
        } else if (mongooseType.instance === 'boolean') {
            formInstructions.type = 'checkbox';
        } else if (mongooseType.instance === 'Number') {
            formInstructions.type = 'number';
            if (mongooseOptions.min) {
                formInstructions.add = 'min="' + mongooseOptions.min + '" ' + (formInstructions.add || '');
            }
            if (mongooseOptions.max) {
                formInstructions.add = 'max="' + mongooseOptions.max + '" ' + (formInstructions.add || '');
            }
            if (formInstructions.step) {
                formInstructions.add = 'step="' + formInstructions.step + '" ' + (formInstructions.add || '');
            }
        } else {
            throw new Error('Field ' + formInstructions.name + ' is of unsupported type ' + mongooseType.instance, formInstructions, mongooseType);
        }
        if (mongooseOptions.required) {
            formInstructions.required = true;
        }
        if (mongooseOptions.readonly) {
            formInstructions.readonly = true;
        }
        return formInstructions;
    };

    // TODO: Do this in form
    var basicInstructions = function (field, formData, prefix) {
        formData.name = prefix + field;
//        formData.id = formData.id || 'f_' + prefix + field.replace(/\./g, '_');
//        formData.label = (formData.hasOwnProperty('label') && formData.label) == null ? '' : (formData.label || $filter('titleCase')(field));
        return formData;
    };

    var handleListInfo = function (destList, listOptions, field) {
        var listData = listOptions || {hidden: true};
        if (!listData.hidden) {
            if (typeof listData === 'object') {
                listData.name = field;
                destList.push(listData);
            } else {
                destList.push({name: field});
            }
        }
    };

    var handleEmptyList = function (description, destList, destForm, source) {
        // If no list fields specified use the first non hidden string field
        if (destForm) {
            for (var i = 0, l = destForm.length; i < l; i++) {
                if (destForm[i].type === 'text') {
                    destList.push({name: destForm[i].name});
                    break;
                }
            }
            if (destList.length === 0 && destForm.length !== 0) {
                // If it is still blank then just use the first field
                destList.push({name: destForm[0].name});
            }
        }

        if (destList.length === 0) {
            // If it is still blank then just use the first field from source
            for (var field in source) {
                if (field !== '_id' && source.hasOwnProperty(field)) {
                    destList.push({name: field});
                    break;
                }
            }
            if (destList.length === 0) {
                throw new Error('Unable to generate a title for ' + description);
            }
        }
    };

    var evaluateConditional = function (condition, data, select2List) {

        function evaluateSide(side) {
            var result = side;
            if (typeof side === 'string' && side.slice(0, 1) === '$') {
                var sideParts = side.split('.');
                switch (sideParts.length) {
                    case 1:
                        result = recordHandler.getListData(data, side.slice(1), select2List);
                        break;
                    case 2 :
                        // this is a sub schema element, and the appropriate array element has been passed
                        result = recordHandler.getListData(data, sideParts[1], select2List);
                        break;
                    default:
                        throw new Error('Unsupported showIf format');
                }
            }
            return result;
        }

        var lhs = evaluateSide(condition.lhs),
            rhs = evaluateSide(condition.rhs),
            result;

        switch (condition.comp) {
            case 'eq' :
                result = (lhs === rhs);
                break;
            case 'ne' :
                result = (lhs !== rhs);
                break;
            default :
                throw new Error('Unsupported comparator ' + condition.comp);
        }
        return result;
    };


    // Conditionals
    // $scope.dataDependencies is of the form {fieldName1: [fieldId1, fieldId2], fieldName2:[fieldId2]}
    var handleConditionals = function (condInst, name, $scope) {

        var dependency = 0;

        function handleVar(theVar) {
            if (typeof theVar === 'string' && theVar.slice(0, 1) === '$') {
                var fieldName = theVar.slice(1);
                var fieldDependencies = $scope.dataDependencies[fieldName] || [];
                fieldDependencies.push(name);
                $scope.dataDependencies[fieldName] = fieldDependencies;
                dependency += 1;
            }
        }

        var display = true;
        if (condInst) {
            handleVar(condInst.lhs);
            handleVar(condInst.rhs);
            if (dependency === 0 && !evaluateConditional(condInst, undefined, $scope.select2List)) {
                display = false;
            }
        }
        return display;
    };

    // Conventional view is that this should go in a directive.  I reckon it is quicker here.
    exports.updateDataDependentDisplay = function (curValue, oldValue, force, $scope) {
        var depends, i, j, k, element;

        var forceNextTime;
        for (var field in $scope.dataDependencies) {
            if ($scope.dataDependencies.hasOwnProperty(field)) {
                var parts = field.split('.');
                // TODO: what about a simple (non array) subdoc?
                if (parts.length === 1) {
                    if (force || !oldValue || curValue[field] !== oldValue[field]) {
                        depends = $scope.dataDependencies[field];
                        for (i = 0; i < depends.length; i += 1) {
                            var name = depends[i];
                            for (j = 0; j < $scope.formSchema.length; j += 1) {
                                if ($scope.formSchema[j].name === name) {
                                    element = angular.element(document.querySelector('#cg_' + $scope.formSchema[j].id));
                                    if (evaluateConditional($scope.formSchema[j].showIf, curValue, $scope.select2List)) {
                                        element.removeClass('ng-hide');
                                    } else {
                                        element.addClass('ng-hide');
                                    }
                                }
                            }
                        }
                    }
                } else if (parts.length === 2) {
                    if (forceNextTime === undefined) {
                        forceNextTime = true;
                    }
                    if (curValue[parts[0]]) {
                        for (k = 0; k < curValue[parts[0]].length; k++) {
                            // We want to carry on if this is new array element or it is changed
                            if (force || !oldValue || !oldValue[parts[0]] || !oldValue[parts[0]][k] || curValue[parts[0]][k][parts[1]] !== oldValue[parts[0]][k][parts[1]]) {
                                depends = $scope.dataDependencies[field];
                                for (i = 0; i < depends.length; i += 1) {
                                    var nameParts = depends[i].split('.');
                                    if (nameParts.length !== 2) {
                                        throw new Error('Conditional display must control dependent fields at same level ');
                                    }
                                    for (j = 0; j < $scope.formSchema.length; j += 1) {
                                        if ($scope.formSchema[j].name === nameParts[0]) {
                                            var subSchema = $scope.formSchema[j].schema;
                                            for (var l = 0; l < subSchema.length; l++) {
                                                if (subSchema[l].name === depends[i]) {
                                                    element = angular.element(document.querySelector('#f_' + nameParts[0] + 'List_' + k + ' #cg_f_' + depends[i].replace('.', '_')));
                                                    if (element.length === 0) {
                                                        // Test Plait care plan structures if you change next line
                                                        element = angular.element(document.querySelector('#f_elements-' + k + '-' + nameParts[1]));
                                                    } else {
                                                        forceNextTime = false;  // Because the sub schema has been rendered we don't need to do this again until the record changes
                                                    }
                                                    if (element.length > 0) {
                                                        if (evaluateConditional($scope.formSchema[j].schema[l].showIf, curValue[parts[0]][k], $scope.select2List)) {
                                                            element.show();
                                                        } else {
                                                            element.hide();
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // TODO: this needs rewrite for nesting
                    throw new Error('You can only go down one level of subdocument with showIf');
                }
            }
        }
        return forceNextTime;
    };

    function getArrayFieldToExtend(fieldName, $scope) {
      var fieldParts = fieldName.split('.');
      var arrayField = $scope.record;
      for (var i = 0, l = fieldParts.length; i < l; i++) {
        if (!arrayField[fieldParts[i]]) {
          if (i === l - 1) {
            arrayField[fieldParts[i]] = [];
          } else {
            arrayField[fieldParts[i]] = {};
          }
        }
        arrayField = arrayField[fieldParts[i]];
      }
      return arrayField;
    }

    exports.add = function (fieldName, $event, $scope) {
        var arrayField = getArrayFieldToExtend(fieldName, $scope);
        arrayField.push({});
        $scope.setFormDirty($event);
    };

    exports.unshift = function (fieldName, $event, $scope) {
      var arrayField = getArrayFieldToExtend(fieldName, $scope);
      arrayField.unshift({});
      $scope.setFormDirty($event);
    };

    exports.remove = function (fieldName, value, $event, $scope) {
        // Remove an element from an array
        var fieldParts = fieldName.split('.');
        var arrayField = $scope.record;
        for (var i = 0, l = fieldParts.length; i < l; i++) {
            arrayField = arrayField[fieldParts[i]];
        }
        arrayField.splice(value, 1);
        $scope.setFormDirty($event);
    };

    exports.decorateScope = function($scope, formGeneratorInstance, recordHandlerInstance, sharedStuff) {
        $scope.record = sharedStuff.record;
        $scope.phase = 'init';
        $scope.disableFunctions = sharedStuff.disableFunctions;
        $scope.dataEventFunctions = sharedStuff.dataEventFunctions;
        $scope.topLevelFormName = undefined;
        $scope.formSchema = [];
        $scope.tabs = [];
        $scope.listSchema = [];
        $scope.recordList = [];
        $scope.dataDependencies = {};
        $scope.select2List = [];
        $scope.conversions = {};
        $scope.pageSize = 60;
        $scope.pagesLoaded = 0;

      sharedStuff.baseScope = $scope;

        $scope.generateEditUrl = function (obj) {
            return formGeneratorInstance.generateEditUrl(obj, $scope);
        };

        $scope.generateNewUrl = function () {
            return formGeneratorInstance.generateNewUrl($scope);
        };

        $scope.scrollTheList =  function () {
            return recordHandlerInstance.scrollTheList($scope, recordHandlerInstance.handleError($scope));
        };

        $scope.getListData = function(record, fieldName) {
            return recordHandlerInstance.getListData(record, fieldName, $scope.select2List);
        };

        $scope.setPristine = function () {
            $scope.dismissError();
            if ($scope[$scope.topLevelFormName]) {
                $scope[$scope.topLevelFormName].$setPristine();
            }
        };

        $scope.skipCols = function (index) {
            return index > 0 ? 'col-md-offset-2' : '';
        };

        $scope.setFormDirty = function (event) {
            if (event) {
                var form = angular.element(event.target).inheritedData('$formController');
                form.$setDirty();
            } else {
                console.log('setFormDirty called without an event (fine in a unit test)');
            }
        };

        $scope.add = function (fieldName, $event) {
            return formGeneratorInstance.add(fieldName, $event, $scope);
        };

        $scope.unshift = function (fieldName, $event) {
          return formGeneratorInstance.unshift(fieldName, $event, $scope);
        };

        $scope.remove = function (fieldName, value, $event) {
            return formGeneratorInstance.remove(fieldName, value, $event, $scope);
        };

        // Open a select2 control from the appended search button.  OK to use $ here as select2 itself is dependent on jQuery.
        $scope.openSelect2 = function (ev) {
            $('#' + $(ev.currentTarget).data('select2-open')).select2('open');
        };

        // Useful utility when debugging
        $scope.toJSON = function (obj) {
            return JSON.stringify(obj, null, 2);
        };

        $scope.baseSchema = function () {
            return ($scope.tabs.length ? $scope.tabs : $scope.formSchema);
        };

    };

    return exports;
});
