'use strict';

formsAngular.controller('BaseAltCtrl', [
    '$scope', '$location', '$filter', '$modal', '$window',
    '$data', 'SchemasService', 'routingService', 'formGenerator', 'recordHandler',
    function ($scope, $location, $filter, $modal, $window,
              $data, SchemasService, routingService, formGenerator, recordHandler) {

        var sharedStuff = $data;

        var ctrlState = {
            master: {},
            fngInvalidRequired: 'fng-invalid-required',
            allowLocationChange: true   // Set when the data arrives..
        };

        sharedStuff.baseScope = $scope;
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
        $scope.pageSize = 60;
        $scope.pagesLoaded = 0;

        angular.extend($scope, routingService.parsePathFunc()($location.$$path));

        $scope.modelNameDisplay = sharedStuff.modelNameDisplay || $filter('titleCase')($scope.modelName);


        $scope.generateEditUrl = function (obj) {
            return formGenerator.generateEditUrl(obj, $scope);
        };

        $scope.scrollTheList =  function () {
            return recordHandler.scrollTheList($scope);
        };

        $scope.getListData = function(record, fieldName) {
            return recordHandler.getListData(record, fieldName, $scope.select2List);
        };

        SchemasService.getSchema($scope.modelName, $scope.formName)
            .success(function (data) {
                var listOnly = (!$scope.id && !$scope.newRecord);
                // passing null for formSchema parameter prevents all the work being done when we are just after the list data,
                // but should be removed when/if formschemas are cached
                formGenerator.handleSchema('Main ' + $scope.modelName, data, listOnly ? null : $scope.formSchema, $scope.listSchema, '', true, $scope, ctrlState);

                if (listOnly) {
                    ctrlState.allowLocationChange = true;
                } else {
                    var force = true;
                    $scope.$watch('record', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            force = formGenerator.updateDataDependentDisplay(newValue, oldValue, force, $scope);
                        }
                    }, true);

                    if ($scope.id) {
                        // Going to read a record
                        if (typeof $scope.dataEventFunctions.onBeforeRead === 'function') {
                            $scope.dataEventFunctions.onBeforeRead($scope.id, function (err) {
                                if (err) {
                                    $scope.showError(err);
                                } else {
                                    recordHandler.readRecord($scope, ctrlState);
                                }
                            });
                        } else {
                            recordHandler.readRecord($scope, ctrlState);
                        }
                    } else {
                        // New record
                        ctrlState.master = {};
                        $scope.phase = 'ready';
                        $scope.cancel();
                    }
                }
            })
            .error(function () {
                $location.path('/404');
            });


        $scope.setPristine = function () {
            $scope.dismissError();
            if ($scope[$scope.topLevelFormName]) {
                $scope[$scope.topLevelFormName].$setPristine();
            }
        };

        $scope.cancel = function () {
            angular.copy(ctrlState.master, $scope.record);
            $scope.setPristine();
        };

        //listener for any child scopes to display messages
        // pass like this:
        //    scope.$emit('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
        // or
        //    scope.$broadcast('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
        $scope.$on('showErrorMessage', function (event, args) {
            $scope.showError(args.body, args.title);
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
            var dataToSave = recordHandler.convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0, $scope);
            if ($scope.id) {
                if (typeof $scope.dataEventFunctions.onBeforeUpdate === 'function') {
                    $scope.dataEventFunctions.onBeforeUpdate(dataToSave, ctrlState.master, function (err) {
                        if (err) {
                            $scope.showError(err);
                        } else {
                            recordHandler.updateDocument(dataToSave, options, $scope, handleError, ctrlState);
                        }
                    });
                } else {
                    recordHandler.updateDocument(dataToSave, options, $scope, handleError, ctrlState);
                }
            } else {
                if (typeof $scope.dataEventFunctions.onBeforeCreate === 'function') {
                    $scope.dataEventFunctions.onBeforeCreate(dataToSave, function (err) {
                        if (err) {
                            $scope.showError(err);
                        } else {
                            $scope.createNew(dataToSave, options, handleError);
                        }
                    });
                } else {
                    $scope.createNew(dataToSave, options, handleError);
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
                                        recordHandler.deleteRecord($scope.modelName, $scope.id, $scope, ctrlState);
                                    }
                                });
                            } else {
                                recordHandler.deleteRecord($scope.modelName, $scope.id, $scope, ctrlState);
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
            return formGenerator.add(fieldName, $event, $scope);
        };

        $scope.remove = function (fieldName, value, $event) {
            return formGenerator.remove(fieldName, value, $event, $scope);
        };

        // Open a select2 control from the appended search button
        $scope.openSelect2 = function (ev) {
            $('#' + $(ev.currentTarget).data('select2-open')).select2('open');
        };

        // FIXME: still used?
        $scope.toJSON = function (obj) {
            return JSON.stringify(obj, null, 2);
        };

        $scope.baseSchema = function () {
            return ($scope.tabs.length ? $scope.tabs : $scope.formSchema);
        };

    }
])
    .controller('SaveChangesModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.yes = function () {
            $modalInstance.close(true);
        };
        $scope.no = function () {
            $modalInstance.close(false);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);