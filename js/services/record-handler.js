

'use strict';

/**
 * Operations on a whole record
 *
 * All methods should be state-less
 *
 */

formsAngular.factory('recordHandler', function (
    $location, $window, $filter,
    routingService, SubmissionsService, SchemasService) {
    var exports = {};

    exports.processServerData = function (recordFromServer, $scope, ctrlState) {
        ctrlState.master = convertToAngularModel($scope.formSchema, recordFromServer, 0, $scope);
        $scope.phase = 'ready';
        $scope.cancel();
    };

    exports.readRecord = function ($scope, ctrlState, handleError) {
        SubmissionsService.readRecord($scope.modelName, $scope.id)
            .success(function (data) {
                if (data.success === false) {
                    $location.path('/404');
                }
                ctrlState.allowLocationChange = false;
                $scope.phase = 'reading';
                if (typeof $scope.dataEventFunctions.onAfterRead === 'function') {
                    $scope.dataEventFunctions.onAfterRead(data);
                }
                exports.processServerData(data, $scope, ctrlState);
            }).error(handleError);
    };

    // FIXME: this method seems to be not used anymore
    exports.scrollTheList = function ($scope, handleError) {
        SubmissionsService.getPagedAndFilteredList($scope.modelName, {
            aggregate: $location.$$search.a,
            find: $location.$$search.f,
            limit: $scope.pageSize,
            skip: $scope.pagesLoaded * $scope.pageSize,
            order: $location.$$search.o
        })
            .success(function (data) {
                if (angular.isArray(data)) {
                    $scope.pagesLoaded++;
                    $scope.recordList = $scope.recordList.concat(data);
                } else {
                    $scope.showError(data, 'Invalid query');
                }
            })
            .error(handleError);
    };

// TODO: Do we need model here?  Can we not infer it from scope?
    exports.deleteRecord = function (model, id, $scope, ctrlState) {
        SubmissionsService.deleteRecord(model, id)
            .success(function () {
                if (typeof $scope.dataEventFunctions.onAfterDelete === 'function') {
                    $scope.dataEventFunctions.onAfterDelete(ctrlState.master);
                }
                routingService.redirectTo()('list', $scope, $location);
            });
    };

    exports.updateDocument = function (dataToSave, options, $scope, handleError, ctrlState) {
        $scope.phase = 'updating';

        SubmissionsService.updateRecord($scope.modelName, $scope.id, dataToSave)
            .success(function (data) {
                if (data.success !== false) {
                    if (typeof $scope.dataEventFunctions.onAfterUpdate === 'function') {
                        $scope.dataEventFunctions.onAfterUpdate(data, ctrlState.master);
                    }
                    if (options.redirect) {
                        if (options.allowChange) {
                            ctrlState.allowLocationChange = true;
                        }
                        $window.location = options.redirect;
                    } else {
                        exports.processServerData(data, $scope, ctrlState);
                        $scope.setPristine();
                    }
                } else {
                    $scope.showError(data);
                }
            })
            .error(handleError);
    };

    exports.createNew = function (dataToSave, options, $scope, handleError) {
        SubmissionsService.createRecord($scope.modelName, dataToSave)
            .success(function (data) {
                if (data.success !== false) {
                    if (typeof $scope.dataEventFunctions.onAfterCreate === 'function') {
                        $scope.dataEventFunctions.onAfterCreate(data);
                    }
                    if (options.redirect) {
                        $window.location = options.redirect;
                    } else {
                        routingService.redirectTo()('edit', $scope, $location, data._id);
                    }
                } else {
                    $scope.showError(data);
                }
            })
            .error(handleError);
    };

    // TODO: Think about nested arrays
    // This doesn't handle things like :
    // {a:"hhh",b:[{c:[1,2]},{c:[3,4]}]}
    exports.getListData = function (record, fieldName, select2List) {
        var nests = fieldName.split('.');
        for (var i = 0; i < nests.length; i++) {
            if (record !== undefined) {
                record = record[nests[i]];
            }
        }
        if (record && select2List.indexOf(nests[i - 1]) !== -1) {
            record = record.text || record;
        }
        if (record === undefined) {
            record = '';
        }
        return record;
    };


    var walkTree = function (object, fieldname, element) {
        // Walk through subdocs to find the required key
        // for instance walkTree(master,'address.street.number',element)
        // called by getData and setData

        // element is used when accessing in the context of a input, as the id (like exams-2-grader)
        // gives us the element of an array (one level down only for now).  Leaving element blank returns the whole array
        var parts = fieldname.split('.'),
            higherLevels = parts.length - 1,
            workingRec = object;

        for (var i = 0; i < higherLevels; i++) {
            if (angular.isArray(workingRec)) {
                workingRec = _.map(workingRec, function (obj) {return obj[parts[i]]; });
            } else {
                workingRec = workingRec[parts[i]];
            }
            if (angular.isArray(workingRec) && element && element.scope && typeof element.scope === 'function') {
                // If we come across an array we need to find the correct position, if we have an element
                workingRec = workingRec[element.scope().$index];
            }
            if (!workingRec) {
                break;
            }
        }
        return {
            lastObject: workingRec,
            key: workingRec ? parts[higherLevels] : undefined
        };
    };


    exports.suffixCleanId = function (inst, suffix) {
        return (inst.id || 'f_' + inst.name).replace(/\./g, '_') + suffix;
    };

    var getData = function (object, fieldname, element) {
        var leafData = walkTree(object, fieldname, element);
        var retVal;
        if (leafData.lastObject && leafData.key) {
            if (angular.isArray(leafData.lastObject)) {
                retVal = _.map(leafData.lastObject, function (obj) {return obj[leafData.key]; });
            } else {
                retVal = leafData.lastObject[leafData.key];
            }
        }
        return retVal;
    };

    exports.setData = function (object, fieldname, element, value) {
        var leafData = walkTree(object, fieldname, element);

        if (leafData.lastObject && leafData.key) {
            if (angular.isArray(leafData.lastObject)) {
                for (var i = 0; i < leafData.lastObject.length; i++) {
                    leafData.lastObject[i][leafData.key] = value[i];
                }
            } else {
                leafData.lastObject[leafData.key] = value;
            }
        }
    };

    var updateRecordWithLookupValues = function (schemaElement, $scope, ctrlState) {
        // Update the master and the record with the lookup values, master first
        if (!$scope.topLevelFormName || $scope[$scope.topLevelFormName].$pristine) {
            updateObject(schemaElement.name, ctrlState.master, function (value) {
                return convertForeignKeys(schemaElement, value, $scope[exports.suffixCleanId(schemaElement, 'Options')], $scope[exports.suffixCleanId(schemaElement, '_ids')]);
            });
            // Then copy the converted keys from master into record
            var newVal = getData(ctrlState.master, schemaElement.name);
            if (newVal) {
                exports.setData($scope.record, schemaElement.name, undefined, newVal);
            }
        }
    };

    exports.setUpSelectOptions = function (lookupCollection, schemaElement, $scope, ctrlState, handleSchema, handleError) {
        var optionsList = $scope[schemaElement.options] = [];
        var idList = $scope[schemaElement.ids] = [];

        SchemasService.getSchema(lookupCollection)
            .success(function (data) {
                var listInstructions = [];
                handleSchema('Lookup ' + lookupCollection, data, null, listInstructions, '', false, $scope, ctrlState, handleError);

                var dataRequest;
                if (typeof schemaElement.filter !== 'undefined' && schemaElement.filter) {
                    console.log('filtering');
                    dataRequest = SubmissionsService.getPagedAndFilteredList(lookupCollection, schemaElement.filter);
                } else {
                    dataRequest = SubmissionsService.getAll(lookupCollection);
                }
                dataRequest
                    .success(function (data) {
                        if (data) {
                            for (var i = 0; i < data.length; i++) {
                                var option = '';
                                for (var j = 0; j < listInstructions.length; j++) {
                                    option += data[i][listInstructions[j].name] + ' ';
                                }
                                option = option.trim();
                                var pos = _.sortedIndex(optionsList, option);
                                // handle dupes (ideally people will use unique indexes to stop them but...)
                                if (optionsList[pos] === option) {
                                    option = option + '    (' + data[i]._id + ')';
                                    pos = _.sortedIndex(optionsList, option);
                                }
                                optionsList.splice(pos, 0, option);
                                idList.splice(pos, 0, data[i]._id);
                            }
                            updateRecordWithLookupValues(schemaElement, $scope, ctrlState);
                        }
                    });
            });
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

            // Strip out empty objects here (in case anyone added to an array and didn't populate it)
            if (angular.isArray(theValue)) {
                for (var i = theValue.length - 1; i >= 0; i--) {
                    var type = typeof theValue[i];
                    if (type === 'undefined' || (type === 'object' && Object.keys(theValue[i]).length === 0)) {
                        theValue.splice(i, 1);
                    }
                }
            }
            portion[fieldDetails[0]] = fn(theValue);
        }
    }

    function updateArrayOrObject(aFieldName, portion, fn) {
        if (portion !== undefined) {
            if (angular.isArray(portion)) {
                for (var i = 0; i < portion.length; i++) {
                    updateObject(aFieldName, portion[i], fn);
                }
            } else {
                updateObject(aFieldName, portion, fn);
            }
        }
    }


    var simpleArrayNeedsX = function (aSchema) {
        var result = false;
        if (aSchema.type === 'text') {
            result = true;
        } else if ((aSchema.type === 'select') && !aSchema.ids) {
            result = true;
        }
        return result;
    };

    // Convert {_id:'xxx', array:['item 1'], lookup:'012abcde'} to {_id:'xxx', array:[{x:'item 1'}], lookup:'List description for 012abcde'}
    // Which is what we need for use in the browser
    var convertToAngularModel = function (schema, anObject, prefixLength, $scope) {
        for (var i = 0; i < schema.length; i++) {
            var fieldname = schema[i].name.slice(prefixLength);
            if (schema[i].schema) {
                var extractField = getData(anObject, fieldname);
                if (extractField) {
                    for (var j = 0; j < extractField.length; j++) {
                        extractField[j] = convertToAngularModel(schema[i].schema, extractField[j], prefixLength + 1 + fieldname.length, $scope);
                    }
                }
            } else {

                // Convert {array:['item 1']} to {array:[{x:'item 1'}]}
                var thisField = exports.getListData(anObject, fieldname, $scope.select2List);
                if (schema[i].array && simpleArrayNeedsX(schema[i]) && thisField) {
                    for (var k = 0; k < thisField.length; k++) {
                        thisField[k] = {x: thisField[k] };
                    }
                }

                // Convert {lookup:'012abcde'} to {lookup:'List description for 012abcde'}
                var idList = $scope[exports.suffixCleanId(schema[i], '_ids')];
                if (idList && idList.length > 0 && anObject[fieldname]) {
                    anObject[fieldname] = convertForeignKeys(schema[i], anObject[fieldname], $scope[exports.suffixCleanId(schema[i], 'Options')], idList);
                } else if (schema[i].select2 && !schema[i].select2.fngAjax) {
                    if (anObject[fieldname]) {
                        if (schema[i].array) {
                            for (var n = 0; n < anObject[fieldname].length; n++) {
                                $scope[schema[i].select2.s2query].query({
                                    term: anObject[fieldname][n].x.text || anObject[fieldname][n].text || anObject[fieldname][n].x || anObject[fieldname][n],
                                    callback: function (array) {
                                        if (array.results.length > 0) {
                                            if (anObject[fieldname][n].x) {
                                                anObject[fieldname][n].x = array.results[0];
                                            } else {
                                                anObject[fieldname][n] = array.results[0];
                                            }
                                        }
                                    }
                                });
                            }
                        } else {
                            $scope[schema[i].select2.s2query].query({
                                term: anObject[fieldname],
                                callback: function (array) {
                                    if (array.results.length > 0) {
                                        anObject[fieldname] = array.results[0];
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
        return anObject;
    };

    // Reverse the process of convertToAngularModel
    exports.convertToMongoModel = function (schema, anObject, prefixLength, $scope) {

        function convertLookup(lookup, schemaElement) {
            var retVal;
            if (schemaElement.select2.fngAjax) {
                if (lookup && lookup.id) {
                    retVal = lookup.id;
                }
            } else if (lookup) {
                retVal = lookup.text || lookup.x.text;
            }
            return retVal;
        }

        for (var i = 0; i < schema.length; i++) {
            var fieldname = schema[i].name.slice(prefixLength);
            var thisField = exports.getListData(anObject, fieldname, $scope.select2List);

            if (schema[i].schema) {
                if (thisField) {
                    for (var j = 0; j < thisField.length; j++) {
                        thisField[j] = exports.convertToMongoModel(schema[i].schema, thisField[j], prefixLength + 1 + fieldname.length, $scope);
                    }
                }
            } else {

                // Convert {array:[{x:'item 1'}]} to {array:['item 1']}
                if (schema[i].array && simpleArrayNeedsX(schema[i]) && thisField) {
                    for (var k = 0; k < thisField.length; k++) {
                        thisField[k] = thisField[k].x;
                    }
                }

                // Convert {lookup:'List description for 012abcde'} to {lookup:'012abcde'}
                var idList = $scope[exports.suffixCleanId(schema[i], '_ids')];
                if (idList && idList.length > 0) {
                    updateObject(fieldname, anObject, function (value) {
                        return convertToForeignKeys(schema[i], value, $scope[exports.suffixCleanId(schema[i], 'Options')], idList);
                    });
                } else if (schema[i].select2) {
                    var lookup = getData(anObject, fieldname, null);
                    var newVal;
                    if (schema[i].array) {
                        newVal = [];
                        if (lookup) {
                            for (var n = 0; n < lookup.length; n++) {
                                newVal[n] = convertLookup(lookup[n], schema[i]);
                            }
                        }
                    } else {
                        newVal = convertLookup(lookup, schema[i]);
                    }
                    exports.setData(anObject, fieldname, null, newVal);
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
                returnArray.push({x: exports.convertIdToListValue(input[j], ids, values, schemaElement.name)});
            }
            return returnArray;
        } else if (schemaElement.select2) {
            return {id: input, text: exports.convertIdToListValue(input, ids, values, schemaElement.name)};
        } else {
            return exports.convertIdToListValue(input, ids, values, schemaElement.name);
        }
    }

// Convert ids into their foreign keys
// Called when saving the model

// No support for nested schemas here as it is called from convertToMongoModel which does that
    function convertToForeignKeys(schemaElement, input, values, ids) {
        if (schemaElement.array) {
            var returnArray = [];
            for (var j = 0; j < input.length; j++) {
                returnArray.push(convertListValueToId(input[j], values, ids, schemaElement.name));
            }
            return returnArray;
        } else {
            return convertListValueToId(input, values, ids, schemaElement.name);
        }
    }

    exports.convertIdToListValue = function (id, idsArray, valuesArray, fname) {
        var index = idsArray.indexOf(id);
        if (index === -1) {
            throw new Error('convertIdToListValue: Invalid data - id ' + id + ' not found in ' + idsArray + ' processing ' + fname);
        }
        return valuesArray[index];
    };

    var convertListValueToId = function (value, valuesArray, idsArray, fname) {
        var textToConvert = _.isObject(value) ? (value.x || value.text) : value;
        if (textToConvert && textToConvert.match(/^[0-9a-f]{24}$/)) {
            return textToConvert;  // a plugin probably added this
        } else {
            var index = valuesArray.indexOf(textToConvert);
            if (index === -1) {
                throw new Error('convertListValueToId: Invalid data - value ' + textToConvert + ' not found in ' + valuesArray + ' processing ' + fname);
            }
            return idsArray[index];
        }
    };

    exports.handleError = function ($scope) {
        return function(data, status) {
            if ([200, 400].indexOf(status) !== -1) {
                var errorMessage = '';
                for (var errorField in data.errors) {
                    if (data.errors.hasOwnProperty(errorField)) {
                        errorMessage += '<li><b>' + $filter('titleCase')(errorField) + ': </b> ';
                        switch (data.errors[errorField].type) {
                            case 'enum' :
                                errorMessage += 'You need to select from the list of values';
                                break;
                            default:
                                errorMessage += data.errors[errorField].message;
                                break;
                        }
                        errorMessage += '</li>';
                    }
                }
                if (errorMessage.length > 0) {
                    errorMessage = data.message + '<br /><ul>' + errorMessage + '</ul>';
                } else {
                    errorMessage = data.message || 'Error!  Sorry - No further details available.';
                }
                $scope.showError(errorMessage);
            } else {
                $scope.showError(status + ' ' + JSON.stringify(data));
            }
        };
    };

    exports.decorateScope = function($scope, $modal, recordHandlerInstance, ctrlState) {

        $scope.cancel = function () {
            angular.copy(ctrlState.master, $scope.record);
            $scope.setPristine();
        };

        var handleError = exports.handleError($scope);

        //listener for any child scopes to display messages
        // pass like this:
        //    scope.$emit('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
        // or
        //    scope.$broadcast('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
        $scope.$on('showErrorMessage', function (event, args) {
            $scope.showError(args.body, args.title);
        });

        $scope.showError = function (errString, alertTitle) {
            $scope.alertTitle = alertTitle ? alertTitle : 'Error!';
            $scope.errorMessage = errString;
        };

        $scope.dismissError = function () {
            delete $scope.errorMessage;
        };


        $scope.save = function (options) {
            options = options || {};

            //Convert the lookup values into ids
            var dataToSave = recordHandlerInstance.convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0, $scope);
            if ($scope.id) {
                if (typeof $scope.dataEventFunctions.onBeforeUpdate === 'function') {
                    $scope.dataEventFunctions.onBeforeUpdate(dataToSave, ctrlState.master, function (err) {
                        if (err) {
                            $scope.showError(err);
                        } else {
                            recordHandlerInstance.updateDocument(dataToSave, options, $scope, handleError, ctrlState);
                        }
                    });
                } else {
                    recordHandlerInstance.updateDocument(dataToSave, options, $scope, handleError, ctrlState);
                }
            } else {
                if (typeof $scope.dataEventFunctions.onBeforeCreate === 'function') {
                    $scope.dataEventFunctions.onBeforeCreate(dataToSave, function (err) {
                        if (err) {
                            $scope.showError(err);
                        } else {
                            recordHandlerInstance.createNew(dataToSave, options, $scope, handleError);
                        }
                    });
                } else {
                    recordHandlerInstance.createNew(dataToSave, options, $scope, handleError);
                }
            }
        };

        $scope.newClick = function () {
            routingService.redirectTo()('new', $scope, $location);
        };

        $scope.$on('$locationChangeStart', function (event, next) {
            if (!ctrlState.allowLocationChange && !$scope.isCancelDisabled()) {
                event.preventDefault();
                var modalInstance = $modal.open({
                    template: '<div class="modal-header">' +
                        '   <h3>Record modified</h3>' +
                        '</div>' +
                        '<div class="modal-body">' +
                        '   <p>Would you like to save your changes?</p>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '    <button class="btn btn-primary dlg-yes" ng-click="yes()">Yes</button>' +
                        '    <button class="btn btn-warning dlg-no" ng-click="no()">No</button>' +
                        '    <button class="btn dlg-cancel" ng-click="cancel()">Cancel</button>' +
                        '</div>',
                    controller: 'SaveChangesModalCtrl',
                    backdrop: 'static'
                });

                modalInstance.result.then(
                    function (result) {
                        if (result) {
                            $scope.save({redirect: next, allowChange: true});    // save changes
                        } else {
                            ctrlState.allowLocationChange = true;
                            $window.location = next;
                        }
                    }
                );
            }
        });

        $scope.deleteClick = function () {
            if ($scope.record._id) {
                var modalInstance = $modal.open({
                    template: '<div class="modal-header">' +
                        '   <h3>Delete Item</h3>' +
                        '</div>' +
                        '<div class="modal-body">' +
                        '   <p>Are you sure you want to delete this record?</p>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '    <button class="btn btn-primary dlg-no" ng-click="cancel()">No</button>' +
                        '    <button class="btn btn-warning dlg-yes" ng-click="yes()">Yes</button>' +
                        '</div>',
                    controller: 'SaveChangesModalCtrl',
                    backdrop: 'static'
                });

                modalInstance.result.then(
                    function (result) {
                        if (result) {
                            if (typeof $scope.dataEventFunctions.onBeforeDelete === 'function') {
                                $scope.dataEventFunctions.onBeforeDelete(ctrlState.master, function (err) {
                                    if (err) {
                                        $scope.showError(err);
                                    } else {
                                        recordHandlerInstance.deleteRecord($scope.modelName, $scope.id, $scope, ctrlState);
                                    }
                                });
                            } else {
                                recordHandlerInstance.deleteRecord($scope.modelName, $scope.id, $scope, ctrlState);
                            }
                        }
                    }
                );
            }
        };

        $scope.isCancelDisabled = function () {
            if (typeof $scope.disableFunctions.isCancelDisabled === 'function') {
                return $scope.disableFunctions.isCancelDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
            } else {
                return $scope[$scope.topLevelFormName] && $scope[$scope.topLevelFormName].$pristine;
            }
        };

        $scope.isSaveDisabled = function () {
            if (typeof $scope.disableFunctions.isSaveDisabled === 'function') {
                return $scope.disableFunctions.isSaveDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
            } else {
                return ($scope[$scope.topLevelFormName] && ($scope[$scope.topLevelFormName].$invalid || $scope[$scope.topLevelFormName].$pristine));
            }
        };

        $scope.isDeleteDisabled = function () {
            if (typeof $scope.disableFunctions.isDeleteDisabled === 'function') {
                return $scope.disableFunctions.isDeleteDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
            } else {
                return (!$scope.id);
            }
        };

        $scope.isNewDisabled = function () {
            if (typeof $scope.disableFunctions.isNewDisabled === 'function') {
                return $scope.disableFunctions.isNewDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
            } else {
                return false;
            }
        };

        $scope.disabledText = function (localStyling) {
            var text = '';
            if ($scope.isSaveDisabled) {
                text = 'This button is only enabled when the form is complete and valid.  Make sure all required inputs are filled in. ' + localStyling;
            }
            return text;
        };


    };

    exports.fillFormFromBackendCustomSchema = function(schema, $scope, formGeneratorInstance, recordHandlerInstance, ctrlState, handleError) {
        var listOnly = (!$scope.id && !$scope.newRecord);
        // passing null for formSchema parameter prevents all the work being done when we are just after the list data,
        // but should be removed when/if formschemas are cached
        formGeneratorInstance.handleSchema('Main ' + $scope.modelName, schema, listOnly ? null : $scope.formSchema, $scope.listSchema, '', true, $scope, ctrlState, handleError);

        if (listOnly) {
            ctrlState.allowLocationChange = true;
        } else {
            var force = true;
            $scope.$watch('record', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    force = formGeneratorInstance.updateDataDependentDisplay(newValue, oldValue, force, $scope);
                }
            }, true);

            if ($scope.id) {
                // Going to read a record
                if (typeof $scope.dataEventFunctions.onBeforeRead === 'function') {
                    $scope.dataEventFunctions.onBeforeRead($scope.id, function (err) {
                        if (err) {
                            $scope.showError(err);
                        } else {
                            recordHandlerInstance.readRecord($scope, ctrlState, handleError);
                        }
                    });
                } else {
                    recordHandlerInstance.readRecord($scope, ctrlState, handleError);
                }
            } else {
                // New record
                ctrlState.master = {};
                $scope.phase = 'ready';
                $scope.cancel();
            }
        }
    };

    exports.fillFormWithBackendSchema = function($scope, formGeneratorInstance, recordHandlerInstance, ctrlState, handleError){

        SchemasService.getSchema($scope.modelName, $scope.formName)
            .success(function (schema) {
                exports.fillFormFromBackendCustomSchema(schema, $scope, formGeneratorInstance, recordHandlerInstance, ctrlState, handleError);
            })
            .error(handleError);
    };

    return exports;
});