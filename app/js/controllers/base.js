var BaseCtrl = function ($scope, $routeParams, $location, $http) {
    var master = {};
    $scope.record = {};
    $scope.formSchema = [];
    $scope.panes = [];
    $scope.listSchema = [];
    $scope.recordList = [];
    $scope.dataDependencies = {};
    $scope.select2List = [];
    // Process RouteParams / Location
    $scope.location = $location.$$path.split('/');
    var locationParts = $scope.location.length;
    var lastPart = $scope.location[locationParts - 1];
    $scope.newRecord = $scope.newRecord || (lastPart === 'new');
    if ($routeParams.model) {
        $scope.modelName = $routeParams.model;
        $scope.formName = $routeParams.form;
        $scope.id = $routeParams.id
    } else {
        // Support using the base controller with override views
        $scope.modelName = $scope.location[1];

        if ($scope.newRecord) {
            if (locationParts === 4) {
                $scope.formName = $scope.location[2];
            }
        } else {
            if (locationParts === 5) {
                $scope.formName = $scope.location[2];
                $scope.id = $scope.location[3];
            } else {
                $scope.id = $scope.location[2];
            }
        }
    }

    $scope.formPlusSlash = $scope.formName ? $scope.formName + '/' : '';

    var titleCase = function (str) {
        return str.replace(/_/g, ' ').replace(/[A-Z]/g, ' $&').replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    $scope.modelNameDisplay = titleCase($scope.modelName);

    var suffixCleanId = function (inst, suffix) {
        return inst.id.replace(/\./g, '_') + suffix;
    };

    var handleFieldType = function (formInstructions, mongooseType, mongooseOptions) {

        var select2ajaxName;
        if (mongooseType.caster) {
            formInstructions.array = true;
            mongooseType = mongooseType.caster;
            $.extend(mongooseOptions, mongooseType.options)
        }
        if (mongooseType.instance == 'String') {
            if (mongooseOptions.enum) {
                formInstructions.type = 'select';
                if (formInstructions.select2) {
                    // Hacky way to get required styling working on select2 controls
                    if (mongooseOptions.required) {
                        $scope.$watch('record.'+formInstructions.name, function (newValue, oldValue) {
                            if (newValue) {
                                $('#cg_'+formInstructions.id).removeClass('fng-invalid-required');
                            } else {
                                $('#cg_'+formInstructions.id).addClass('fng-invalid-required');
                            }
                        }, true);
                    }
                    $scope['select2'+formInstructions.name] = {
                        allowClear: !mongooseOptions.required,
                        query: function (query) {
                            var data = {results: []},
                                searchString = query.term.toUpperCase();
                            for (var i = 0; i < mongooseOptions.enum.length ; i++) {
                                if (mongooseOptions.enum[i].toUpperCase().indexOf(searchString) !== -1) {
                                    data.results.push({id: i, text: mongooseOptions.enum[i]})
                                }
                            }
                            query.callback(data);
                        }
                    };
                    _.extend($scope['select2'+formInstructions.name], formInstructions.select2);
                    formInstructions.select2.s2query = 'select2'+formInstructions.name;
                    $scope.select2List.push(formInstructions.name)
                } else {
                    formInstructions.options = suffixCleanId(formInstructions, 'Options');
                    $scope[formInstructions.options] = mongooseOptions.enum;
                }
            } else if (!formInstructions.type) {
                // leave specified types as they are - textarea is supported
                formInstructions.type = 'text';
            }
        } else if (mongooseType.instance == 'ObjectID') {
            formInstructions.type = 'select';
            if (formInstructions.select2) {$scope.select2List.push(formInstructions.name)}
            if (formInstructions.select2 && formInstructions.select2.fngAjax) {
                // create the instructions for select2
                select2ajaxName = 'ajax' + formInstructions.name.replace(/\./g,'');
                $scope[select2ajaxName] = {
                    allowClear: !mongooseOptions.required,
                    minimumInputLength: 2,
                    initSelection : function (element, callback) {
                        $http.get('api/' + mongooseOptions.ref + '/' +element.val() + '/list').success(function (data) {
                            if (data.success === false) {
                                $location.path("/404");
                            }
                            var display = {id: element.val(), text: data.list};
                            master[formInstructions.name] = display;
                            callback(display);

                        }).error(function () {
                                $location.path("/404");
                            });
                    },
                    ajax: {
                        url: "/api/search/" + mongooseOptions.ref,
                        data: function (term, page) { // page is the one-based page number tracked by Select2
                            return {
                                q: term, //search term
                                page_limit: 10, // page size
                                page: page // page number
                            }
                        },
                        results: function (data) {
                            return {results: data.results, more: data.moreCount > 0};
                        }
                    }
                };
                _.extend($scope[select2ajaxName], formInstructions.select2);
                formInstructions.select2.fngAjax = select2ajaxName;
            } else {
                formInstructions.options = suffixCleanId(formInstructions, 'Options');
                formInstructions.ids = suffixCleanId(formInstructions, '_ids');
                setUpSelectOptions(mongooseOptions.ref, formInstructions);
            }
        } else if (mongooseType.instance == 'Date') {
            formInstructions.type = 'text';
            formInstructions.add = 'ui-date ui-date-format';
        } else if (mongooseType.instance == 'boolean') {
            formInstructions.type = 'checkbox';
        } else if (mongooseType.instance == 'Number') {
            formInstructions.type = 'number';
        } else {
            throw new Error("Field " + formInstructions.name + " is of unsupported type " + mongooseType.instance);
        }
        if (mongooseOptions.required) {
            formInstructions.required = true;
        }
        return formInstructions;
    };

    var basicInstructions = function (field, formData, prefix) {
        formData.name = prefix + field;
        formData.id = formData.id || 'f_' + prefix + field;
        formData.label = (formData.hasOwnProperty('label') && formData.label) == null ? '' : (formData.label || titleCase(field));
        return formData;
    };

    var handleListInfo = function (destList, listOptions, field) {
        var listData = listOptions || {hidden: true};
        if (!listData.hidden) {
            if (typeof listData == "object") {
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
                if (destForm[i].type == 'text') {
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
                throw new Error("Unable to generate a title for " + description)
            }
        }
    };

    var evaluateConditional = function (condition, data) {

        function evaluateSide(side) {
            var result = side;
            if (typeof side === "string" && side.slice(0, 1) === '$') {
                result = $scope.getListData(data, side.slice(1))
            }
            return result;
        }

        var lhs = evaluateSide(condition.lhs)
            , rhs = evaluateSide(condition.rhs)
            , result;

        switch (condition.comp) {
            case 'eq' :
                result = (lhs === rhs);
                break;
            case 'ne' :
                result = (lhs !== rhs);
                break;
            default :
                throw new Error("Unsupported comparator " + condition.comp);
        }
        return result;
    };

//    Conditionals
//    $scope.dataDependencies is of the form {fieldName1: [fieldId1, fieldId2], fieldName2:[fieldId2]}

    var handleConditionals = function (condInst, id) {

        var dependency = 0;

        function handleVar(theVar) {
            if (typeof theVar === "string" && theVar.slice(0, 1) === '$') {
                var fieldName = theVar.slice(1);
                var fieldDependencies = $scope.dataDependencies[fieldName] || [];
                fieldDependencies.push(id);
                $scope.dataDependencies[fieldName] = fieldDependencies;
                dependency += 1;
            }
        }

        var display = true;
        if (condInst) {
            handleVar(condInst.lhs);
            handleVar(condInst.rhs);
            if (dependency === 0 && !evaluateConditional(condInst)) {
                display = false;
            }
        }
        return display;
    };

    // TODO: Think about nested arrays
    // This doesn't handle things like :
    // {a:"hhh",b:[{c:[1,2]},{c:[3,4]}]}
    $scope.getListData = function (record, fieldName) {
        var nests = fieldName.split('.');
        for (var i = 0; i < nests.length; i++) {
            if (record !== undefined) {
                record = record[nests[i]];
            }
        }
        if (record && $scope.select2List.indexOf(nests[i-1]) !== -1) {
            record = record.text;
        }
        if (record === undefined) {
            record = "";
        }
        return record;
    };

    $scope.updateDataDependentDisplay = function (curValue, oldValue, force) {
        for (var field in $scope.dataDependencies) {
            if ($scope.dataDependencies.hasOwnProperty(field) && (force || (curValue[field] != oldValue[field]))) {
                var depends = $scope.dataDependencies[field];
                for (var i = 0; i < depends.length; i += 1) {
                    var id = depends[i];
                    for (var j = 0; j < $scope.formSchema.length; j += 1) {
                        if ($scope.formSchema[j].id === id) {
                            var control = $('#cg_' + id);
                            if (evaluateConditional($scope.formSchema[j].showIf, curValue)) {
                                control.show();
                            } else {
                                control.hide();
                            }
                        }
                    }
                }
            }
        }
    };

    var handleSchema = function (description, source, destForm, destList, prefix, doRecursion) {

        function handlePaneInfo(paneName, thisInst) {
            var paneTitle = angular.copy(paneName);
            var pane = _.find($scope.panes, function (aPane) {
                return aPane.title === paneTitle
            });
            if (!pane) {
                var active = false;
                if ($scope.panes.length === 0) {
                    if ($scope.formSchema.length > 0) {
                        $scope.panes.push({title: 'Main', content: [], active: true});
                        pane = $scope.panes[0];
                        for (var i = 0; i < $scope.formSchema.length; i++) {
                            pane.content.push($scope.formSchema[i])
                        }
                    } else {
                        active = true;
                    }
                }
                pane = $scope.panes[$scope.panes.push({title: paneTitle, content: [], active: active}) - 1]
            }
            pane.content.push(thisInst);
        }

        for (var field in source) {
            if (field !== '_id' && source.hasOwnProperty(field)) {
                var mongooseType = source[field],
                    mongooseOptions = mongooseType.options || {};
                var formData = mongooseOptions.form || {};
                // TODO: Fix this bit where hidden fields get shown in a specified form - it is undesirable in subschemas
                if (!formData.hidden || (destForm && $scope.formName)) {
                    if (mongooseType.schema) {
                        if (doRecursion && destForm) {
                            var schemaSchema = [];
                            handleSchema('Nested ' + field, mongooseType.schema, schemaSchema, null, field + '.', true);
                            var sectionInstructions = basicInstructions(field, formData, prefix);
                            sectionInstructions.schema = schemaSchema;
                            if (formData.pane) handlePaneInfo(formData.pane, sectionInstructions);
                            destForm.push(sectionInstructions);
                        }
                    } else {
                        if (destForm) {
                            var formInstructions = basicInstructions(field, formData, prefix);
                            if (handleConditionals(formInstructions.showIf, formInstructions.id)) {
                                var formInst = handleFieldType(formInstructions, mongooseType, mongooseOptions);
                                if (formInst.pane) handlePaneInfo(formInst.pane, formInst);
                                destForm.push(formInst);
                            }
                        }
                        if (destList) {
                            handleListInfo(destList, mongooseOptions.list, field);
                        }
                    }
                }
            }
        }
        if (destList && destList.length === 0) {
            handleEmptyList(description, destList, destForm, source);
        }
    };

    $http.get('api/schema/' + $scope.modelName + ($scope.formName ? '/' + $scope.formName : '')).success(function (data) {
        handleSchema('Main ' + $scope.modelName, data, $scope.formSchema, $scope.listSchema, '', true);


        if (!$scope.id && !$scope.newRecord) {
            var queryString = $routeParams.f ? '?f=' + $routeParams.f : '';
            $http.get('api/' + $scope.modelName + queryString).success(function (data) {
                $scope.recordList = data;
            }).error(function () {
                    $location.path("/404");
                });
        } else {
            $scope.$watch('record', function (newValue, oldValue) {
                $scope.updateDataDependentDisplay(newValue, oldValue, false)
            }, true);

            if ($scope.id) {
                $http.get('api/' + $scope.modelName + '/' + $scope.id).success(function (data) {
                    if (data.success === false) {
                        $location.path("/404");
                    }
                    master = convertToAngularModel($scope.formSchema, data, 0);
                    $scope.cancel();
                }).error(function () {
                        $location.path("/404");
                    });
            }
        }
    }).error(function () {
            $location.path("/404");
        });

    $scope.cancel = function () {
        $scope.record = angular.copy(master);
// TODO: Sort all this pristine stuff
//        if ($scope.myForm) {
//            console.log('Calling set pristine')
//            $scope.myForm.$setPristine();
//        } else {
//            console.log("No form");
//        }
    };

//    window.onbeforeunload = function() {
//        if ($('.ng-dirty').length > 0) {
//            return 'You have unsaved changes!';
//        } else {
//            return null;
//        }
//    }

//    $scope.$on('$locationChangeStart', function (event, next, current) {
//        console.log('changed = ' + $scope.isCancelDisabled())
////        event.preventDefault();
////        if ( !$scope.isCancelDisabled() && ! confirm("Are you sure you want to leave this page?") ) {
////            event.preventDefault();
////        }
//    });

    var handleError = function (data, status) {
        if ([200, 400].indexOf(status) !== -1) {
            var errorMessage = '';
            for (var errorField in data.errors) {
                if (data.errors.hasOwnProperty(errorField)) {
                    errorMessage += '<li><b>'+ titleCase(errorField) +': </b> ';
                    switch (data.errors[errorField].type) {
                        case 'enum' :
                            errorMessage += 'You need to select from the list of values';
                            break;
                        default:
                            errorMessage += data.errors[errorField].message;
                            break;
                    }
                   errorMessage += '</li>'
                }
            }
            if (errorMessage.length > 0) {
                errorMessage = data.message + '<br /><ul>' + errorMessage + '</ul>';
            } else {
                errorMessage = data.message || "Error!  Sorry - No further details available.";
            }
            showError(errorMessage);
        } else {
            showError(status + ' ' + JSON.stringify(data));
        }
    };

    var showError = function (errString, alertTitle) {
        $scope.alertTitle = alertTitle ? alertTitle : "Error!";
        $scope.errorMessage = errString;
    };

    $scope.dismissError = function () {
        delete $scope.errorMessage;
    };

    $scope.save = function (options) {
        options = options || {};

        //Convert the lookup values into ids
        var dataToSave = convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0);
        if ($scope.record._id) {
            $http.post('api/' + $scope.modelName + '/' + $scope.id, dataToSave).success(function (data) {
                if (data.success !== false) {
                    if (options.redirect) {
                        window.location = options.redirect;
                    } else {
                        master = $scope.record;
                        $scope.cancel();
                    }
                } else {
                    showError(data);
                }
            }).error(handleError);
        } else {
            $http.post('api/' + $scope.modelName, dataToSave).success(function (data) {
                if (data.success !== false) {
                    if (options.redirect) {
                        window.location = options.redirect
                    } else {
                        $location.path('/' + $scope.modelName + '/' + data._id + '/edit');
                        //                    reset?
                    }
                } else {
                    showError(data);
                }
            }).error(handleError)
        }
    };

    $scope.new = function () {
        $location.path('/' + $scope.modelName + '/new');
    };

    $scope.delete = function () {
        if ($scope.record._id) {
            //TODO: When we upgrade to Twitter Bootstrap 2.2.2 get a confirm using http://bootboxjs.com/
            $http.delete('api/' + $scope.modelName + '/' + $scope.id);
        }
        $location.path('/' + $scope.modelName);
    };

    $scope.isCancelDisabled = function () {
        return angular.equals(master, $scope.record);
    };

    $scope.isSaveDisabled = function () {
        return $scope.myForm.$invalid || angular.equals(master, $scope.record);
    };

    $scope.disabledText = function (localStyling) {
        if ($scope.isSaveDisabled) {
            return "This button is only enabled when the form is complete and valid.  Make sure all required inputs are filled in. " + localStyling
        }
    };

    $scope.add = function (elementInfo) {
        var fieldName = elementInfo.field.name, arrayField;
        var fieldParts = fieldName.split('.');
        arrayField = $scope.record;
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
        arrayField.push({});
    };

    $scope.remove = function (fieldInfo, value) {
        // Remove an element from an array
        var fieldName = fieldInfo.$parent.field.name;
        var fieldParts = fieldName.split('.');
        var arrayField = $scope.record;
        for (var i = 0, l = fieldParts.length; i < l; i++) {
            arrayField = arrayField[fieldParts[i]];
        }
        arrayField.splice(value, 1);
    };

// Split a field name into the next level and all following levels
    function splitFieldName(aFieldName) {
        var nesting = aFieldName.split('.'),
            result = [nesting[0]];

        if (nesting.length > 1) {
            result.push(nesting.slice(1).join('.'));
        }

        return result;
    }

    function updateObject(aFieldName, portion, fn) {
        var fieldDetails = splitFieldName(aFieldName);

        if (fieldDetails.length > 1) {
            updateArrayOrObject(fieldDetails[1], portion[fieldDetails[0]], fn);
        } else if (portion[fieldDetails[0]]) {
            var theValue = portion[fieldDetails[0]];
            portion[fieldDetails[0]] = fn((typeof theValue === 'Object') ? theValue.x : theValue)
        }
    }

    function updateArrayOrObject(aFieldName, portion, fn) {
        if (portion !== undefined) {
            if ($.isArray(portion)) {
                for (var i = 0; i < portion.length; i++) {
                    updateObject(aFieldName, portion[i], fn);
                }
            } else {
                updateObject(aFieldName, portion, fn);
            }
        }
    }


// Convert {_id:'xxx', array:['item 1'], lookup:'012abcde'} to {_id:'xxx', array:[{x:'item 1'}], lookup:'List description for 012abcde'}
// Which is what we need for use in the browser
    var convertToAngularModel = function (schema, anObject, prefixLength) {
        for (var i = 0; i < schema.length; i++) {
            var fieldname = schema[i].name.slice(prefixLength);
            if (schema[i].schema) {
                if (anObject[fieldname]) {
                    for (var j = 0; j < anObject[fieldname].length; j++) {
                        anObject[fieldname][j] = convertToAngularModel(schema[i].schema, anObject[fieldname][j], prefixLength + 1 + fieldname.length);
                    }
                }
            } else {

                // Convert {array:['item 1']} to {array:[{x:'item 1'}]}
                if (schema[i].array && schema[i].type == 'text' && anObject[fieldname]) {
                    for (var k = 0; k < anObject[fieldname].length; k++) {
                        anObject[fieldname][k] = {x: anObject[fieldname][k]}
                    }
                }

                // Convert {lookup:'012abcde'} to {lookup:'List description for 012abcde'}
                var idList = $scope[suffixCleanId(schema[i], '_ids')];
                if (idList && idList.length > 0 && anObject[fieldname]) {
                    anObject[fieldname] = convertForeignKeys(schema[i], anObject[fieldname], $scope[suffixCleanId(schema[i], 'Options')], idList);
                } else if (schema[i].select2 && !schema[i].select2.fngAjax) {
                    anObject[fieldname] = {id: -1, text: anObject[fieldname]};
                }
            }
        }
        return anObject;
    };

// Reverse the process of convertToAngularModel
    var convertToMongoModel = function (schema, anObject, prefixLength) {

        for (var i = 0; i < schema.length; i++) {
            var fieldname = schema[i].name.slice(prefixLength);
            if (schema[i].schema) {
                var thisField = $scope.getListData(anObject, fieldname);
                if (thisField) {
                    for (var j = 0; j < thisField.length; j++) {
                        thisField[j] = convertToMongoModel(schema[i].schema, thisField[j], prefixLength + 1 + fieldname.length);
                    }
                }
            } else {

                // Convert {array:[{x:'item 1'}]} to {array:['item 1']}
                if (schema[i].array && schema[i].type == 'text' && anObject[fieldname]) {
                    for (var k = 0; k < anObject[fieldname].length; k++) {
                        anObject[fieldname][k] = anObject[fieldname][k].x
                    }
                }

                // Convert {lookup:'List description for 012abcde'} to {lookup:'012abcde'}
                var idList = $scope[suffixCleanId(schema[i], '_ids')];
                if (idList && idList.length > 0) {
                    updateObject(fieldname, anObject, function (value) {
                        return( convertToForeignKeys(schema[i], value, $scope[suffixCleanId(schema[i], 'Options')], idList) );
                    });
                } else if (schema[i].select2) {
                    if (schema[i].select2.fngAjax) {
                        if (anObject[fieldname]) {
                            anObject[fieldname] = anObject[fieldname].id;
                        }
                    } else {
                        // It may be OK / good to do this on all fields, not just those handled by a select2....
                        if (anObject[fieldname] === null) {
                            delete anObject[fieldname]
                        } else {
                            anObject[fieldname] = anObject[fieldname].text;
                        }
                    }
                }

            }
        }
        return anObject;
    };


// Convert foreign keys into their display for selects
// Called when the model is read and when the lookups are read

// No support for nested schemas here as it is called from convertToAngularModel which does that
    function convertForeignKeys(schemaElement, input, values, ids) {
        if (schemaElement.array) {
            var returnArray = [];
            for (var j = 0; j < input.length; j++) {
                returnArray.push({x: convertIdToListValue(input[j], ids, values, schemaElement.name)});
            }
            return returnArray;
        } else {
            return convertIdToListValue(input, ids, values, schemaElement.name);
        }
    }

// Convert ids into their foreign keys
// Called when saving the model

// No support for nested schemas here as it is called from convertToMongoModel which does that
    function convertToForeignKeys(schemaElement, input, values, ids) {
        if (schemaElement.array) {
            var returnArray = [];
            for (var j = 0; j < input.length; j++) {
                returnArray.push(convertListValueToId(input[j].x, values, ids, schemaElement.name));
            }
            return returnArray;
        } else {
            return convertListValueToId(input, values, ids, schemaElement.name);
        }
    }

    var convertIdToListValue = function (id, idsArray, valuesArray, fname) {
        var index = idsArray.indexOf(id);
        if (index === -1) {
            throw new Error("convertIdToListValue: Invalid data - id " + id + " not found in " + idsArray + " processing " + fname)
        }
        return valuesArray[index];
    };

    var convertListValueToId = function (value, valuesArray, idsArray, fname) {
        var index = valuesArray.indexOf(value);
        if (index === -1) {
            throw new Error("convertListValueToId: Invalid data - value " + value + " not found in " + valuesArray + " processing " + fname)
        }
        return idsArray[index];
    };

    var setUpSelectOptions = function (lookupCollection, schemaElement) {
        var optionsList = $scope[schemaElement.options] = [];
        var idList = $scope[schemaElement.ids] = [];
        $http.get('api/schema/' + lookupCollection).success(function (data) {
            var listInstructions = [];
            handleSchema('Lookup ' + lookupCollection, data, null, listInstructions, '', false);
            $http.get('api/' + lookupCollection, {cache: false}).success(function (data) {
                for (var i = 0; i < data.length; i++) {
                    var option = '';
                    for (var j = 0; j < listInstructions.length; j++) {
                        option += data[i][listInstructions[j].name] + ' ';
                    }
                    option = option.trim();
                    var pos = _.sortedIndex(optionsList, option);
                    optionsList.splice(pos, 0, option);
                    idList.splice(pos, 0, data[i]._id);
                }
                updateRecordWithLookupValues(schemaElement);
            })
        })
    };

    var updateRecordWithLookupValues = function (schemaElement) {
        // Update the master and the record with the lookup values
        if (angular.equals(master[schemaElement.name], $scope.record[schemaElement.name])) {
            updateObject(schemaElement.name, master, function (value) {
                return( convertForeignKeys(schemaElement, value, $scope[suffixCleanId(schemaElement, 'Options')], $scope[suffixCleanId(schemaElement, '_ids')]));
            });
            $scope.record = angular.copy(master);
        } else {
            throw new Error("Cannot convert lookup values in changed record")
        }
    };

    // Open a select2 control from the appended search button
    $scope.openSelect2 = function(ev) {
        $('#' + $(ev.currentTarget).data('select2-open')).select2('open')
    };

};