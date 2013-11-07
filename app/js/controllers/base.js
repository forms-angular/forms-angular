formsAngular.controller('BaseCtrl', ['$scope', '$routeParams', '$location', '$http', '$filter', '$data', '$locationParse', '$dialog', function ($scope, $routeParams, $location, $http, $filter, $data, $locationParse, $dialog) {
    var master = {};
    var fngInvalidRequired = 'fng-invalid-required';
    var sharedStuff = $data;
    var allowLocationChange = true;   // Set when the data arrives..

    $scope.record = sharedStuff.record;
    $scope.phase = 'init';
    $scope.disableFunctions = sharedStuff.disableFunctions;
    $scope.dataEventFunctions = sharedStuff.dataEventFunctions;
    $scope.formSchema = [];
    $scope.panes = [];
    $scope.listSchema = [];
    $scope.recordList = [];
    $scope.dataDependencies = {};
    $scope.select2List = [];
    $scope.page_size = 20;
    $scope.pages_loaded = 0;

    angular.extend($scope, $locationParse($location.$$path));

    $scope.formPlusSlash = $scope.formName ? $scope.formName + '/' : '';
    $scope.modelNameDisplay = sharedStuff.modelNameDisplay || $filter('titleCase')($scope.modelName);

    $scope.walkTree = function (object, fieldname, element) {
        // Walk through subdocs to find the required key
        // for instance walkTree(master,'address.street.number',element)
        // called by getData and setData
        var parts = fieldname.split('.')
            , higherLevels = parts.length - 1
            , workingRec = object
            , re
            , id;

        if (element) {
            id = element.context.id;
        }
        for (var i = 0; i < higherLevels; i++) {
            workingRec = workingRec[parts[i]];
            if (angular.isArray(workingRec)) {
                // If we come across an array we need to find the correct position
                // or raise an exception
                re = new RegExp(parts[i] + "-([0-9])-" + parts[i + 1]);
                workingRec = workingRec[parseInt(id.match(re)[1])]
            }
        }
        return {lastObject: workingRec, key: parts[higherLevels]};
    };

    $scope.getData = function (object, fieldname, element) {
        var leafData = $scope.walkTree(object, fieldname, element);
        return leafData.lastObject[leafData.key]
    };

    $scope.setData = function (object, fieldname, element, value) {
        var leafData = $scope.walkTree(object, fieldname, element);
        leafData.lastObject[leafData.key] = value;
    };

    function updateInvalidClasses(value, id, select2) {
        var target = '#' + ((select2) ? 'cg_' : '') + id;
        if (value) {
            $(target).removeClass(fngInvalidRequired);
        } else {
            $(target).addClass(fngInvalidRequired);
        }
    }

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
                // Hacky way to get required styling working on select controls
                if (mongooseOptions.required) {

                    $scope.$watch('record.' + formInstructions.name, function (newValue) {
                        updateInvalidClasses(newValue, formInstructions.id, formInstructions.select2);
                    }, true);
                    setTimeout(function () {
                        updateInvalidClasses($scope.record[formInstructions.name], formInstructions.id, formInstructions.select2);
                    }, 0)
                }
                if (formInstructions.select2) {
                    $scope['select2' + formInstructions.name] = {
                        allowClear: !mongooseOptions.required,
                        initSelection: function (element, callback) {
                            var myVal = element.val();
                            var display = {id: myVal, text: myVal};
                            callback(display);
                        },
                        query: function (query) {
                            var data = {results: []},
                                searchString = query.term.toUpperCase();
                            for (var i = 0; i < mongooseOptions.enum.length; i++) {
                                if (mongooseOptions.enum[i].toUpperCase().indexOf(searchString) !== -1) {
                                    data.results.push({id: i, text: mongooseOptions.enum[i]})
                                }
                            }
                            query.callback(data);
                        }
                    };
                    _.extend($scope['select2' + formInstructions.name], formInstructions.select2);
                    formInstructions.select2.s2query = 'select2' + formInstructions.name;
                    $scope.select2List.push(formInstructions.name)
                } else {
                    formInstructions.options = suffixCleanId(formInstructions, 'Options');
                    $scope[formInstructions.options] = mongooseOptions.enum;
                }
            } else if (!formInstructions.type) {
                var passwordOverride, isPassword;
                if (mongooseOptions.form) {
                    passwordOverride = mongooseOptions.form.password
                }
                if (passwordOverride !== undefined) {
                    isPassword = passwordOverride;
                } else {
                    isPassword = (formInstructions.name.toLowerCase().indexOf('password') !== -1)
                }
                formInstructions.type = isPassword ? 'password' : 'text';
            }
        } else if (mongooseType.instance == 'ObjectID') {
            formInstructions.ref = mongooseOptions.ref;
            if (formInstructions.link && formInstructions.link.linkOnly) {
                formInstructions.type = 'link';
                formInstructions.linkText = formInstructions.link.text;
                formInstructions.form = formInstructions.link.form;
                delete formInstructions.link;
            } else {
                formInstructions.type = 'select';
                if (formInstructions.select2) {
                    $scope.select2List.push(formInstructions.name);
                    if (formInstructions.select2.fngAjax) {
                        // create the instructions for select2
                        select2ajaxName = 'ajax' + formInstructions.name.replace(/\./g, '');
                        $scope[select2ajaxName] = {
                            allowClear: !mongooseOptions.required,
                            minimumInputLength: 2,
                            initSelection: function (element, callback) {
                                $http.get('api/' + mongooseOptions.ref + '/' + element.val() + '/list').success(function (data) {
                                    if (data.success === false) {
                                        $location.path("/404");
                                    }
                                    var display = {id: element.val(), text: data.list};
                                    $scope.setData(master, formInstructions.name, element, display);
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
                        if (formInstructions.select2 == true) {
                            formInstructions.select2 = {};
                        }
                        $scope['select2' + formInstructions.name] = {
                            allowClear: !mongooseOptions.required,
                            initSelection: function (element, callback) {
                                var myId,
                                    myVal = element.val();
                                if ($scope[formInstructions.options].length > 0) {
                                    myId = convertListValueToId(myVal, $scope[formInstructions.options], $scope[formInstructions.ids], formInstructions.name)
                                } else {
                                    myId = myVal;
                                }
                                var display = {id: myId, text: myVal};
                                callback(display);
                            },
                            query: function (query) {
                                var data = {results: []},
                                    searchString = query.term.toUpperCase();
                                for (var i = 0; i < $scope[formInstructions.options].length; i++) {
                                    if ($scope[formInstructions.options][i].toUpperCase().indexOf(searchString) !== -1) {
                                        data.results.push({id: $scope[formInstructions.ids][i], text: $scope[formInstructions.options][i]})
                                    }
                                }
                                query.callback(data);
                            }
                        };
                        _.extend($scope['select2' + formInstructions.name], formInstructions.select2);
                        formInstructions.select2.s2query = 'select2' + formInstructions.name;
                        $scope.select2List.push(formInstructions.name);
                        formInstructions.options = suffixCleanId(formInstructions, 'Options');
                        formInstructions.ids = suffixCleanId(formInstructions, '_ids');
                        setUpSelectOptions(mongooseOptions.ref, formInstructions);
                    }
                } else {
                    formInstructions.options = suffixCleanId(formInstructions, 'Options');
                    formInstructions.ids = suffixCleanId(formInstructions, '_ids');
                    setUpSelectOptions(mongooseOptions.ref, formInstructions);
                }
            }
        } else if (mongooseType.instance == 'Date') {
            formInstructions.type = 'text';
            formInstructions.add = 'ui-date ui-date-format ';
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
        if (mongooseOptions.readonly) {
            formInstructions.readonly = true;
        }
        return formInstructions;
    };

    var basicInstructions = function (field, formData, prefix) {
        formData.name = prefix + field;
        formData.id = formData.id || 'f_' + prefix + field.replace(/\./g, '_');
        formData.label = (formData.hasOwnProperty('label') && formData.label) == null ? '' : (formData.label || $filter('titleCase')(field));
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
        if (record && $scope.select2List.indexOf(nests[i - 1]) !== -1) {
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
                pane = $scope.panes[$scope.panes.push({title: paneTitle, containerType: 'pane', content: [], active: active}) - 1]
            }
            pane.content.push(thisInst);
        }

        for (var field in source) {
            if (field !== '_id' && source.hasOwnProperty(field)) {
                var mongooseType = source[field],
                    mongooseOptions = mongooseType.options || {};
                var formData = mongooseOptions.form || {};
                if (!formData.hidden) {
                    if (mongooseType.schema) {
                        if (doRecursion && destForm) {
                            var schemaSchema = [], schemaList;

                            if (formData.hierarchy) {
                                // This list implmemtation restricts us to using one hierarchy schema per model - not sure that is a problem
                                mongooseType.schema.options = {hierarchy: true};
                                schemaList = $scope['_hierarchy_list_'] = [];
                            } else {
                                schemaList = null;
                            }

                            handleSchema('Nested ' + field, mongooseType.schema, schemaSchema, schemaList, field + '.', true);
                            var sectionInstructions = basicInstructions(field, formData, prefix);
                            sectionInstructions.schema = schemaSchema;
                            if (formData.pane) handlePaneInfo(formData.pane, sectionInstructions);
                            destForm.push(sectionInstructions);
                            
                        }
                    } else {
                        if (destForm) {
                            var formInstructions = basicInstructions(field, formData, prefix);

                            // if (source.options && source.options.hierarchy) {

                            // } else {

                                if (handleConditionals(formInstructions.showIf, formInstructions.id) && field !== 'options') {
                                    var formInst = handleFieldType(formInstructions, mongooseType, mongooseOptions);
                                    if (formInst.pane) handlePaneInfo(formInst.pane, formInst);
                                    destForm.push(formInst);
                                }

                            // }

                            
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

    $scope.readRecord = function () {
        $http.get('api/' + $scope.modelName + '/' + $scope.id).success(function (data) {
            if (data.success === false) {
                $location.path("/404");
            }
            allowLocationChange = false;
            if (typeof $scope.dataEventFunctions.onAfterRead === "function") {
                $scope.dataEventFunctions.onAfterRead(data);
            }
            master = convertToAngularModel($scope.formSchema, data, 0);
            $scope.phase = 'ready';
            $scope.cancel();
            }).error(function () {
                $location.path("/404");
            });
    };

    function generateListQuery() {
        var queryString = '?l=' + $scope.page_size
            , addParameter = function (param, value) {
                if (value && value !== '') {
                    queryString += '&' + param + '=' + value;
                }
            };

        addParameter('f', $routeParams.f);
        addParameter('a', $routeParams.a);
        addParameter('o', $routeParams.o);
        addParameter('s', $scope.pages_loaded * $scope.page_size);
        $scope.pages_loaded++;
        return queryString;
    }

    $scope.scrollTheList = function () {
        $http.get('api/' + $scope.modelName + generateListQuery()).success(function (data) {
            $scope.recordList = $scope.recordList.concat(data);
        }).error(function () {
                $location.path("/404");
            });
    };

    $http.get('api/schema/' + $scope.modelName + ($scope.formName ? '/' + $scope.formName : ''), {cache: true}).success(function (data) {

        handleSchema('Main ' + $scope.modelName, data, $scope.formSchema, $scope.listSchema, '', true);

        if (!$scope.id && !$scope.newRecord) { //this is a list. listing out contents of a collection
            allowLocationChange = true;
// ngInfiniteList does all this
//            $scope.pages_loaded = 0;
//            $http.get('api/' + $scope.modelName + generateListQuery()).success(function (data) {
//                $scope.recordList = data;
//            }).error(function () {
//                    $location.path("/404");
//                });
        } else {
            $scope.$watch('record', function (newValue, oldValue) {
                $scope.updateDataDependentDisplay(newValue, oldValue, false)
            }, true);

            if ($scope.id) {
                // Going to read a record
                if (typeof $scope.dataEventFunctions.onBeforeRead === "function") {
                    $scope.dataEventFunctions.onBeforeRead($scope.id, function (err) {
                        if (err) {
                            showError(err);
                        } else {
                            $scope.readRecord();
                        }
                    });
                } else {
                    $scope.readRecord();
                }
            } else {
                // New record
                master = {};
                $scope.phase = 'ready';
                $scope.cancel();
            }
        }
    }).error(function () {
            $location.path("/404");
        });

    $scope.cancel = function () {

        for (var prop in $scope.record) {
            if ($scope.record.hasOwnProperty(prop)) {
                delete $scope.record[prop];
            }
        }

        $.extend(true, $scope.record, master);
        $scope.dismissError();

//  TODO: Sort all this pristine stuff now we are on 1.2
//        if ($scope.myForm) {
//            console.log('Calling set pristine')
//            $scope.myForm.$setPristine();
//        } else {
//            console.log("No form");
//        }
    };

    //listener for any child scopes to display messages
    // pass like this scope.$emit('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
    $scope.$on('showErrorMessage', function (event, args) {
        showError(args.body, args.title);
    });

    var handleError = function (data, status) {
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

    $scope.createNew = function (dataToSave, options) {
        $http.post('api/' + $scope.modelName, dataToSave).success(function (data) {
            if (data.success !== false) {
                if (typeof $scope.dataEventFunctions.onAfterCreate === "function") {
                    $scope.dataEventFunctions.onAfterCreate(data);
                }
                if (options.redirect) {
                    window.location = options.redirect
                } else {
                    $location.path('/' + $scope.modelName + '/' + $scope.formPlusSlash + data._id + '/edit');
                    //                    reset?
                }
            } else {
                showError(data);
            }
        }).error(handleError);
    };

    $scope.updateDocument = function (dataToSave, options) {
        $http.post('api/' + $scope.modelName + '/' + $scope.id, dataToSave).success(function (data) {
            if (data.success !== false) {
                if (typeof $scope.dataEventFunctions.onAfterUpdate === "function") {
                    $scope.dataEventFunctions.onAfterUpdate(data, master)
                }
                if (options.redirect) {
                    if (options.allowChange) {
                        allowLocationChange = true;
                    }
                    window.location = options.redirect;
                } else {
                    master = angular.copy($scope.record);
                    $scope.dismissError();
//                  Alternatively we could copy data into master and update all look ups and then call cancel (which calls dismissError).
//                  This is harder and I can't currently see the need.
                }
            } else {
                showError(data);
            }
        }).error(handleError);

    };

    $scope.save = function (options) {
        options = options || {};

        //Convert the lookup values into ids
        var dataToSave = convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0);
        if ($scope.id) {
            if (typeof $scope.dataEventFunctions.onBeforeUpdate === "function") {
                $scope.dataEventFunctions.onBeforeUpdate(dataToSave, master, function (err) {
                    if (err) {
                        showError(err);
                    } else {
                        $scope.updateDocument(dataToSave, options);
                    }
                })
            } else {
                $scope.updateDocument(dataToSave, options);
            }
        } else {
            if (typeof $scope.dataEventFunctions.onBeforeCreate === "function") {
                $scope.dataEventFunctions.onBeforeCreate(dataToSave, function (err) {
                    if (err) {
                        showError(err);
                    } else {
                        $scope.createNew(dataToSave, options);
                    }
                })
            } else {
                $scope.createNew(dataToSave, options);
            }
        }
    };

    $scope.new = function () {
        $location.search("");
        $location.path('/' + $scope.modelName + '/' + $scope.formPlusSlash + 'new');
    };

    $scope.deleteRecord = function (model, id) {
        $http.delete('api/' + model + '/' + id).success(function () {
            if (typeof $scope.dataEventFunctions.onAfterDelete === "function") {
                $scope.dataEventFunctions.onAfterDelete(master);
            }
            $location.path('/' + $scope.modelName);
        });
    };

    $scope.$on('$locationChangeStart', function (event, next) {
        if (!allowLocationChange && !$scope.isCancelDisabled()) {
            $dialog.messageBox('Record modified', 'Would you like to save your changes?', [
                    { label: 'Yes', result: 'yes', cssClass: 'dlg-yes'},
                    {label: 'No', result: 'no', cssClass: 'dlg-no'},
                    { label: 'Cancel', result: 'cancel', cssClass: 'dlg-cancel'}
                ])
                .open()
                .then(function (result) {
                    switch (result) {
                        case 'no' :
                            allowLocationChange = true;
                            window.location = next;
//                            $location.url = next;
                            break;
                        case 'yes' :
                            $scope.save({redirect: next, allowChange: true});    // save changes
                        // break;   fall through to get the preventDefault
                        case 'cancel' :
                            break;
                    }
                });
            event.preventDefault();
        }
    });

    $scope.delete = function () {

        var boxResult;

        if ($scope.record._id) {

            var msgBox = $dialog.messageBox('Delete Item', 'Are you sure you want to delete this record?', [
                {
                    label: 'Yes',
                    result: 'yes'
                },
                {
                    label: 'No',
                    result: 'no'
                }
            ]);

            msgBox.open().then(function (result) {

                if (result === 'yes') {

                    if (typeof $scope.dataEventFunctions.onBeforeDelete === "function") {
                        $scope.dataEventFunctions.onBeforeDelete(master, function (err) {

                            if (err) {
                                showError(err);
                            } else {

                                $scope.deleteRecord($scope.modelName, $scope.id);

                            }

                        });
                    } else {

                        $scope.deleteRecord($scope.modelName, $scope.id);

                    }
                }

                if (result === 'no') {
                    boxResult = result;
                }
            });
            //can't close the msxBox from within itself as it breaks it.
            if (boxResult === 'no') {
                msgBox.close();
            }
        }
    };


    $scope.isCancelDisabled = function () {
        if (typeof $scope.disableFunctions.isCancelDisabled === "function") {
            return $scope.disableFunctions.isCancelDisabled($scope.record, master, $scope.myForm);
        } else {
            return angular.equals(master, $scope.record);
        }
    };

    $scope.isSaveDisabled = function () {
        if (typeof $scope.disableFunctions.isSaveDisabled === "function") {
            return $scope.disableFunctions.isSaveDisabled($scope.record, master, $scope.myForm);
        } else {
            return ($scope.myForm && $scope.myForm.$invalid) || angular.equals(master, $scope.record);
        }
    };

    $scope.isDeleteDisabled = function () {
        if (typeof $scope.disableFunctions.isDeleteDisabled === "function") {
            return $scope.disableFunctions.isDeleteDisabled($scope.record, master, $scope.myForm);
        } else {
            return false;
        }
    };

    $scope.isNewDisabled = function () {
        if (typeof $scope.disableFunctions.isNewDisabled === "function") {
            return $scope.disableFunctions.isNewDisabled($scope.record, master, $scope.myForm);
        } else {
            return false;
        }
    };

    $scope.disabledText = function (localStyling) {
        var text = "";
        if ($scope.isSaveDisabled) {
            text = "This button is only enabled when the form is complete and valid.  Make sure all required inputs are filled in. " + localStyling
        }
        return text;
    };

    $scope.add = function (fieldName) {
        var arrayField;
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

    $scope.remove = function (fieldName, value) {
        // Remove an element from an array
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
            portion[fieldDetails[0]] = fn((typeof theValue === 'Object') ? (theValue.x || theValue.id ) : theValue)
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
                var thisField = $scope.getListData(anObject, fieldname);
                if (schema[i].array && simpleArrayNeedsX(schema[i]) && thisField) {
                    for (var k = 0; k < thisField.length; k++) {
                        thisField[k] = {x: thisField[k]}
                    }
                }

                // Convert {lookup:'012abcde'} to {lookup:'List description for 012abcde'}
                var idList = $scope[suffixCleanId(schema[i], '_ids')];
                if (idList && idList.length > 0 && anObject[fieldname]) {
                    anObject[fieldname] = convertForeignKeys(schema[i], anObject[fieldname], $scope[suffixCleanId(schema[i], 'Options')], idList);
                } else if (schema[i].select2 && !schema[i].select2.fngAjax) {
                    if (anObject[fieldname]) {
                        // Might as well use the function we set up to do the search
                        $scope[schema[i].select2.s2query].query({
                            term: anObject[fieldname],
                            callback: function (array) {
                                if (array.results.length > 0) {
                                    anObject[fieldname] = array.results[0];
                                }
                            }});
                    }
                }
            }
        }
        return anObject;
    };

// Reverse the process of convertToAngularModel
    var convertToMongoModel = function (schema, anObject, prefixLength) {

        for (var i = 0; i < schema.length; i++) {
            var fieldname = schema[i].name.slice(prefixLength);
            var thisField = $scope.getListData(anObject, fieldname);

            if (schema[i].schema) {
                if (thisField) {
                    for (var j = 0; j < thisField.length; j++) {
                        thisField[j] = convertToMongoModel(schema[i].schema, thisField[j], prefixLength + 1 + fieldname.length);
                    }
                }
            } else {

                // Convert {array:[{x:'item 1'}]} to {array:['item 1']}
                if (schema[i].array && simpleArrayNeedsX(schema[i]) && thisField) {
                    for (var k = 0; k < thisField.length; k++) {
                        thisField[k] = thisField[k].x
                    }
                }

                // Convert {lookup:'List description for 012abcde'} to {lookup:'012abcde'}
                var idList = $scope[suffixCleanId(schema[i], '_ids')];
                if (idList && idList.length > 0) {
                    updateObject(fieldname, anObject, function (value) {
                        return( convertToForeignKeys(schema[i], value, $scope[suffixCleanId(schema[i], 'Options')], idList) );
                    });
                } else if (schema[i].select2) {
                    var lookup = $scope.getData(anObject, fieldname, null);
                    if (schema[i].select2.fngAjax) {
                        if (lookup) {
                            $scope.setData(anObject, fieldname, null, lookup.id);
                        }
                    } else {
                        if (lookup) {
                            $scope.setData(anObject, fieldname, null, lookup.text);
                        } else {
                            $scope.setData(anObject, fieldname, null, undefined);
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
                returnArray.push(convertListValueToId(input[j], values, ids, schemaElement.name));
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
        var textToConvert = _.isObject(value) ? (value.x || value.text) : value;
        if (textToConvert && textToConvert.match(/^[0-9a-f]{24}$/)) {
            return(textToConvert);  // a plugin probably added this
        } else {
            var index = valuesArray.indexOf(textToConvert);
            if (index === -1) {
                throw new Error("convertListValueToId: Invalid data - value " + textToConvert + " not found in " + valuesArray + " processing " + fname)
            }
            return idsArray[index];
        }
    };

    var setUpSelectOptions = function (lookupCollection, schemaElement) {
        var optionsList = $scope[schemaElement.options] = [];
        var idList = $scope[schemaElement.ids] = [];
        $http.get('api/schema/' + lookupCollection, {cache: true}).success(function (data) {
            var listInstructions = [];
            handleSchema('Lookup ' + lookupCollection, data, null, listInstructions, '', false);
            $http.get('api/' + lookupCollection, {cache: true}).success(function (data) {
                if (data) {
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
                }
            })
        })
    };

    var updateRecordWithLookupValues = function (schemaElement) {
        // Update the master and the record with the lookup values
        if (angular.equals(master[schemaElement.name], $scope.record[schemaElement.name]) ||
            (schemaElement.select2 && $scope.record[schemaElement.name] && angular.equals(master[schemaElement.name], $scope.record[schemaElement.name].text))) {
            updateObject(schemaElement.name, master, function (value) {
                return( convertForeignKeys(schemaElement, value, $scope[suffixCleanId(schemaElement, 'Options')], $scope[suffixCleanId(schemaElement, '_ids')]));
            });
            // TODO This needs a rethink - it is a quick workaround.  See https://trello.com/c/q3B7Usll
            if (master[schemaElement.name]) {
                $scope.record[schemaElement.name] = master[schemaElement.name];
            }
            // TODO Reintroduce after conversion to Angular 1.1+ and introduction of ng-if
//        } else {
//            throw new Error("Record has been changed from "+master[schemaElement.name]+" to "+ $scope.record[schemaElement.name] +" in lookup "+schemaElement.name+".  Cannot convert.")
        }
    };

// Open a select2 control from the appended search button
    $scope.openSelect2 = function (ev) {
        $('#' + $(ev.currentTarget).data('select2-open')).select2('open')
    };

}])
;

