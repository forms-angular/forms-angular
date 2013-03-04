var BaseCtrl = function ($scope, $routeParams, $location, $http) {
    var master = {};
    $scope.record = {};
    $scope.formSchema = [];
    $scope.panes = [];
    $scope.listSchema = [];
    $scope.recordList = [];
    $scope.dataDependencies = {};
    // Process RouteParams / Location
    if ($routeParams.model) {
        $scope.modelName = $routeParams.model;
        $scope.formName = $routeParams.form;
        $scope.id = $routeParams.id
    } else {
        // Support using the base controller with override views
        $scope.location = $location.$$path.split('/');
        $scope.modelName = $scope.location[1];

        var locationParts = $scope.location.length;
        var lastPart = $scope.location[locationParts - 1];
        if (lastPart === 'new') {
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

    var titleCase = function(str) {
        return str.replace(/_/g,' ').replace(/[A-Z]/g,' $&').replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    $scope.modelNameDisplay = titleCase($scope.modelName);

    var suffixCleanId = function (inst, suffix) {
        return inst.id.replace(/\./g,'_')+suffix;
    };

    var handleFieldType = function(formInstructions, mongooseType, mongooseOptions) {

        if (mongooseType.caster) {
            formInstructions.array = true;
            mongooseType = mongooseType.caster;
        }
        if (mongooseType.instance == 'String') {
            if (mongooseOptions.enum) {
                formInstructions.type = 'select';
                formInstructions.options = suffixCleanId(formInstructions,'Options');
                $scope[formInstructions.options] = mongooseOptions.enum;
            } else if (!formInstructions.type) {
                // leave specified types as they are - textarea is supported
                formInstructions.type = 'text';
            }
        } else if (mongooseType.instance == 'ObjectID') {
            formInstructions.type = 'select';
            formInstructions.options = suffixCleanId(formInstructions,'Options');
            formInstructions.ids = suffixCleanId(formInstructions,'_ids');
            setUpSelectOptions(mongooseOptions.ref, formInstructions);
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

    var basicInstructions = function(field, formData, prefix) {
        formData.name = prefix+field;
        formData.id = formData.id || 'f_' + prefix+field;
        formData.label = (formData.hasOwnProperty('label') && formData.label) == null ? '' : (formData.label || titleCase(field));
        return formData;
    };

    var handleListInfo = function(destList, listOptions, field) {
        var listData = listOptions || {hidden:true};
        if (!listData.hidden) {
            if (typeof listData == "object") {
                listData.name = field;
                destList.push(listData);
            } else {
                destList.push({name:field});
            }
        }
    };

    var handleEmptyList = function(description,destList, destForm) {
        // If no list fields specified use the first non hidden string field
        for (var i= 0, l=destForm.length; i<l; i++) {
            if (destForm[i].type == 'text') {
                destList.push({name:destForm[i].name});
                break;
            }
        }
        if (destList.length === 0) {
            // If it is still blank then just use the first field
            if (destForm.length === 0) {
                throw new Error("No fields found looking for list field in "+description)
            } else {
                destList.push({name:destForm[0].name});
            }
        }
    };

    var evaluateConditional = function(condition, data) {

        function evaluateSide(side) {
            var result = side;
            if (typeof side === "string" && side.slice(0,1) === '$') {
                result = data[side.slice(1)]
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

    var handleConditionals = function(condInst, id) {

        var dependency = 0;

        function handleVar(theVar) {
            if (typeof theVar === "string" && theVar.slice(0,1) === '$') {
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

    $scope.updateDataDependentDisplay = function(curValue, oldValue, force) {
        for (var field in $scope.dataDependencies) {
            if ($scope.dataDependencies.hasOwnProperty(field) && (force || (curValue[field] != oldValue[field]))) {
                var depends = $scope.dataDependencies[field];
                for (var i = 0; i < depends.length ; i+=1) {
                    var id = depends[i];
                    for (var j = 0; j < $scope.formSchema.length;  j+= 1) {
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

    var handleSchema = function(description, source, destForm, destList, prefix, doRecursion) {
        for (var field in source) {
            if (field !== '_id' && source.hasOwnProperty(field)) {
                var mongooseType = source[field],
                    mongooseOptions = mongooseType.options || {};
                var formData = mongooseOptions.form || {};
                if (!formData.hidden) {
                    if (mongooseType.schema) {
                        if (doRecursion) {
                            var schemaSchema = [];
                            handleSchema('Nested '+field,mongooseType.schema, schemaSchema, null, field+'.',true);
                            var sectionInstructions = basicInstructions(field, formData, prefix);
                            sectionInstructions.schema = schemaSchema;
                            destForm.push(sectionInstructions);
                        }
                    } else {
                        var formInstructions = basicInstructions(field, formData, prefix);
                        if (handleConditionals(formInstructions.showIf, formInstructions.id)) {
                            var formInst = handleFieldType(formInstructions, mongooseType, mongooseOptions);
                            if (formInst.pane) {
                                var paneTitle = angular.copy(formInst.pane)
                                var pane = _.find($scope.panes, function(aPane){return aPane.title === paneTitle });
                                if (!pane) {
                                    var active = false;
                                    if ($scope.panes.length === 0) {
                                        if ($scope.formSchema.length > 0) {
                                            $scope.panes.push({title:'Main', content:[], active: true});
                                            pane = $scope.panes[0];
                                            for (var i= 0; i< $scope.formSchema.length; i++) {
                                                pane.content.push($scope.formSchema[i])
                                            }
                                        } else {
                                            active = true;
                                        }
                                    }
                                    pane = $scope.panes[$scope.panes.push({title: formInst.pane, content:[], active:active})-1]
                                }
                                pane.content.push(formInst);
                            }
                            destForm.push(formInst);
                        }
                        if (destList) {
                            handleListInfo(destList, mongooseOptions.list, field);
                        }
                    }
                }
            }
        }
        if (destList && destList.length === 0) {
            handleEmptyList(description,destList,destForm);
        }
    };

    $http.get('api/schema/' + $scope.modelName + ($scope.formName ? '/'+$scope.formName : '')).success(function (data) {
        handleSchema('Main '+$scope.modelName,data, $scope.formSchema, $scope.listSchema, '',true);

        if ($location.$$path.slice(1) == $scope.modelName) {
            var queryString = $routeParams.q ? '?q=' + $routeParams.q : ''
            $http.get('api/' + $scope.modelName + queryString).success(function (data) {
                $scope.recordList = data;
                }).error(function () {
                    $location.path("/404");
                });
        } else {
            $scope.$watch('record', function(newValue, oldValue) {
                $scope.updateDataDependentDisplay(newValue, oldValue, false)
            },true);

            if ($scope.id) {
                $http.get('api/' + $scope.modelName + '/' + $scope.id).success(function (data) {
                    if (data.success === false) {
                        $location.path("/404");
                    }
                    master = convertToAngularModel($scope.formSchema, data,0);
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

    $scope.save = function (options) {
        options = options || {};

        //Convert the lookup values into ids
        var dataToSave = convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0);

        if ($scope.record._id) {
            $http.post('api/' + $scope.modelName + '/' + $scope.id, dataToSave).success(function () {
                if (options.redirect) {
                    window.location = options.redirect;
                } else {
                    master = $scope.record;
                    $scope.cancel();
                }
            });
        } else {
            $http.post('api/' + $scope.modelName, dataToSave).success(function (doc) {
                if (options.redirect) {
                    window.location = options.redirect
                } else {
                    $location.path('/' + $scope.modelName + '/' + doc._id + '/edit');
//                    reset?
                }
            });
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


    $scope.add = function (elementInfo) {
        var fieldName = elementInfo.field.name, arrayField;
        var fieldParts = fieldName.split('.');
        arrayField = $scope.record;
        for (var i = 0, l = fieldParts.length; i < l; i++) {
            if (!arrayField[fieldParts[i]]) {
                if (i === l-1) {
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
        arrayField.splice(value,1);
        $scope.$apply();
    };

    // Convert {_id:'xxx', array:['item 1'], lookup:'012abcde'} to {_id:'xxx', array:[{x:'item 1'}], lookup:'List description for 012abcde'}
    // Which is what we need for use in the browser
    var convertToAngularModel = function (schema, anObject, prefixLength) {
        for (var i = 0; i < schema.length; i++) {
            var fieldname = schema[i].name.slice(prefixLength);
            if (schema[i].schema) {
                if (anObject[fieldname]) {
                    for (var j = 0; j < anObject[fieldname].length ; j++) {
                        anObject[fieldname][j] = convertToAngularModel(schema[i].schema, anObject[fieldname][j], prefixLength + 1 + fieldname.length);
                    }
                }
            } else {

                // Convert {array:['item 1']} to {array:[{x:'item 1'}]}
                if (schema[i].array && schema[i].type == 'text' && anObject[fieldname]) {
                    for (var k = 0; k < anObject[fieldname].length; k++) {
                        anObject[fieldname][k] = {x:anObject[fieldname][k]}
                    }
                }

                // Convert {lookup:'012abcde'} to {lookup:'List description for 012abcde'}
                var idList = $scope[suffixCleanId(schema[i],'_ids')];
                if (idList && idList.length > 0) {
                    anObject[fieldname] = convertForeignKeys(schema[i], anObject[fieldname], $scope[suffixCleanId(schema[i],'Options')], idList);
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
                returnArray.push({x:convertIdToListValue(input[j], ids, values)});
            }
            return returnArray;
        } else {
            return convertIdToListValue(input, ids, values);
        }
    }

    // Reverse the process of convertToAngularModel
    var convertToMongoModel = function (schema, anObject, prefixLength) {
        for (var i = 0; i < schema.length; i++) {
            var fieldname = schema[i].name.slice(prefixLength);
            if (schema[i].schema) {
                if (anObject[fieldname]) {
                    for (var j = 0; j < anObject[fieldname].length ; j++) {
                        anObject[fieldname][j] = convertToMongoModel(schema[i].schema, anObject[fieldname][j], prefixLength + 1 + fieldname.length);
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
                var idList = $scope[suffixCleanId(schema[i],'_ids')];
                if (idList && idList.length > 0) {
                    if (schema[i].array) {
                        if (anObject[fieldname]) {
                            for (var m = 0; m < anObject[fieldname].length; m++) {
                                anObject[fieldname][m] = convertListValueToId(anObject[fieldname][m].x, $scope[suffixCleanId(schema[i],'Options')], idList)
                            }
                        }
                    } else {
                        anObject[fieldname] = convertListValueToId(anObject[fieldname], $scope[suffixCleanId(schema[i],'Options')], idList, fieldname);
                    }
                }
            }
        }
        return anObject;
    };

    var convertIdToListValue = function (id, idsArray, valuesArray) {
        var index = idsArray.indexOf(id);
        if (index === -1) {
            throw new Error("Invalid data - id " + id + " not found in " + idsArray)
        }
        return valuesArray[index];
    };

    var convertListValueToId = function (value, valuesArray, idsArray, fname) {
        var index = valuesArray.indexOf(value);
        if (index === -1) {
            throw new Error("Invalid data - value " + value + " not found in " + valuesArray + " processing " + fname)
        }
        return idsArray[index];
    };

    var setUpSelectOptions = function (lookupCollection, schemaElement) {
        var optionsList = $scope[schemaElement.options] = [];
        var idList = $scope[schemaElement.ids] = [];
        var fieldName = schemaElement.name;

        $http.get('api/schema/' + lookupCollection).success(function (data) {
            var listInstructions = [], unusedFormSchema = [];
            handleSchema('Lookup ' + lookupCollection, data,unusedFormSchema,listInstructions, '',false);
            $http.get('api/' + lookupCollection).success(function (data) {
                for (var i = 0; i < data.length; i++) {
                    var option = '';
                    for (var j = 0; j < listInstructions.length; j++) {
                        option += data[i][listInstructions[j].name] + ' ';
                    }
                    optionsList.push(option.trim());
                    idList.push(data[i]._id);
                }
//                updateRecordWithLookupValues(schemaElement.name);
                if (master[fieldName] && master[fieldName].length) {
                    master[fieldName] = convertForeignKeys(schemaElement, master[fieldName], $scope[suffixCleanId(schemaElement, 'Options')], $scope[suffixCleanId(schemaElement,'_ids')]);
                    $scope.record[fieldName] = master[fieldName];
                }
            })
        })
    };

//    var updateRecordWithLookupValues = function() {}
//    if (master[fieldName] && master[fieldName].length) {
//        master[fieldName] = convertForeignKeys(schemaElement, master[fieldName], $scope[suffixCleanId(schemaElement, 'Options')], $scope[suffixCleanId(schemaElement,'_ids')]);
//        $scope.record[fieldName] = master[fieldName];
//    }

};