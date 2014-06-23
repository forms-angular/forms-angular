/*! forms-angular 2014-06-21 */
'use strict';

var formsAngular = angular.module('formsAngular', [
  'ngRoute',
  'ngSanitize',
  'ui.bootstrap',
  'infinite-scroll',
  'monospaced.elastic'
]);

void(formsAngular);  // Make jshint happy
'use strict';

formsAngular.controller('BaseCtrl', ['$scope', '$routeParams', '$location', '$filter', '$data', '$locationParse', '$modal', '$window', 'SubmissionsService', 'SchemasService', 'urlService',
  function ($scope, $routeParams, $location, $filter, $data, $locationParse, $modal, $window, SubmissionsService, SchemasService, urlService) {
    var master = {};
    var fngInvalidRequired = 'fng-invalid-required';
    var sharedStuff = $data;
    var allowLocationChange = true;   // Set when the data arrives..

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
    $scope.pageSize = 20;
    $scope.pagesLoaded = 0;
    angular.extend($scope, $locationParse($location.$$path));

    $scope.formPlusSlash = $scope.formName ? $scope.formName + '/' : '';
    $scope.modelNameDisplay = sharedStuff.modelNameDisplay || $filter('titleCase')($scope.modelName);
    $scope.generateEditUrl = function (obj) {
      return urlService.buildUrl($scope.modelName + '/' + $scope.formPlusSlash + obj._id + '/edit');
    };

    $scope.walkTree = function (object, fieldname, element) {
      // Walk through subdocs to find the required key
      // for instance walkTree(master,'address.street.number',element)
      // called by getData and setData

      // element is used when accessing in the context of a input, as the id (like exams-2-grader)
      // gives us the element of an array (one level down only for now)
      // TODO: nesting breaks this
      var parts = fieldname.split('.'),
        higherLevels = parts.length - 1,
        workingRec = object;

      for (var i = 0; i < higherLevels; i++) {
        workingRec = workingRec[parts[i]];
        if (angular.isArray(workingRec)) {
          // If we come across an array we need to find the correct position
          workingRec = workingRec[element.scope().$index];
        }
        if (!workingRec) {
          break;
        }
      }
      return {lastObject: workingRec, key: workingRec ? parts[higherLevels] : undefined};
    };

    $scope.getData = function (object, fieldname, element) {
      var leafData = $scope.walkTree(object, fieldname, element);
      return (leafData.lastObject && leafData.key) ? leafData.lastObject[leafData.key] : undefined;
    };

    $scope.setData = function (object, fieldname, element, value) {
      var leafData = $scope.walkTree(object, fieldname, element);
      leafData.lastObject[leafData.key] = value;
    };


    function updateInvalidClasses(value, id, select2) {
      var target = '#' + ((select2) ? 'cg_' : '') + id;
      var element = angular.element(document.querySelector(target));
      if (value) {
        element.removeClass(fngInvalidRequired);
      } else {
        element.addClass(fngInvalidRequired);
      }
    }

    var suffixCleanId = function (inst, suffix) {
      return (inst.id || 'f_' + inst.name).replace(/\./g, '_') + suffix;
    };

    var handleFieldType = function (formInstructions, mongooseType, mongooseOptions) {

        var select2ajaxName;
        if (mongooseType.caster) {
          formInstructions.array = true;
          mongooseType = mongooseType.caster;
          angular.extend(mongooseOptions, mongooseType.options);
        }
        if (mongooseType.instance === 'String') {
          if (mongooseOptions.enum) {
            formInstructions.type = formInstructions.type || 'select';
            // Hacky way to get required styling working on select controls
            if (mongooseOptions.required) {

              $scope.$watch('record.' + formInstructions.name, function (newValue) {
                updateInvalidClasses(newValue, formInstructions.id, formInstructions.select2);
              }, true);
              setTimeout(function () {
                updateInvalidClasses($scope.record[formInstructions.name], formInstructions.id, formInstructions.select2);
              }, 0);
            }
            if (formInstructions.select2) {
              $scope['select2' + formInstructions.name] = {
                allowClear: !mongooseOptions.required,
                initSelection: function (element, callback) {
                  callback(element.select2('data'));
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
              _.extend($scope['select2' + formInstructions.name], formInstructions.select2);
              if (formInstructions.select2 === true) { formInstructions.select2 = {}; }  // In case they have used select2: true syntax
              formInstructions.select2.s2query = 'select2' + formInstructions.name;
              $scope.select2List.push(formInstructions.name);
            } else {
              formInstructions.options = suffixCleanId(formInstructions, 'Options');
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
            if (formInstructions.select2) {
              $scope.select2List.push(formInstructions.name);
              if (formInstructions.select2.fngAjax) {
                // create the instructions for select2
                select2ajaxName = 'ajax' + formInstructions.name.replace(/\./g, '');
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
                        $scope.setData(master, formInstructions.name, element, display);
                        // stop the form being set to dirty
                        var modelController = element.inheritedData('$ngModelController'),
                          isClean = modelController.$pristine;
                        if (isClean) {
                          // fake it to dirty here and reset after callback()
                          modelController.$pristine = false;
                        }
                        callback(display);
                        if (isClean) {
                          modelController.$pristine = true;
                        }
                      }).error(function () {
                        $location.path('/404');
                      });
//                                } else {
//                                    throw new Error('select2 initSelection called without a value');
                    }
                  },
                  ajax: {
                    url: '/api/search/' + mongooseOptions.ref,
                    data: function (term, page) { // page is the one-based page number tracked by Select2
                      return {
                        q: term, //search term
                        pageLimit: 10, // page size
                        page: page // page number
                      };
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
                $scope['select2' + formInstructions.name] = {
                  allowClear: !mongooseOptions.required,
                  initSelection: function (element, callback) {
                    var myId = element.val();
                    if (myId !== '' && $scope[formInstructions.ids].length > 0) {
                      var myVal = convertIdToListValue(myId, $scope[formInstructions.ids], $scope[formInstructions.options], formInstructions.name);
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
        } else if (mongooseType.instance === 'Date') {
          if (!formInstructions.type) {
            if (formInstructions.readonly) {
              formInstructions.type = 'text';
            } else {
              formInstructions.type = 'text';
              formInstructions.add = 'ui-date ui-date-format ';
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
          throw new Error('Field ' + formInstructions.name + ' is of unsupported type ' + mongooseType.instance);
        }
        if (mongooseOptions.required) {
          formInstructions.required = true;
        }
        if (mongooseOptions.readonly) {
          formInstructions.readonly = true;
        }
        return formInstructions;
      }
      ;

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

    var evaluateConditional = function (condition, data) {

      function evaluateSide(side) {
        var result = side;
        if (typeof side === 'string' && side.slice(0, 1) === '$') {
          var sideParts = side.split('.');
          switch (sideParts.length) {
            case 1:
              result = $scope.getListData(data, side.slice(1));
              break;
            case 2 :
              // this is a sub schema element, and the appropriate array element has been passed
              result = $scope.getListData(data, sideParts[1]);
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
    var handleConditionals = function (condInst, name) {

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
        record = '';
      }
      return record;
    };

    // Conventional view is that this should go in a directive.  I reckon it is quicker here.
    $scope.updateDataDependentDisplay = function (curValue, oldValue, force) {
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
                    if (evaluateConditional($scope.formSchema[j].showIf, curValue)) {
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
                              if (evaluateConditional($scope.formSchema[j].schema[l].showIf, curValue[parts[0]][k])) {
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

    var handleSchema = function (description, source, destForm, destList, prefix, doRecursion) {

      function handletabInfo(tabName, thisInst) {
        var tabTitle = angular.copy(tabName);
        var tab = _.find($scope.tabs, function (atab) {
          return atab.title === tabTitle;
        });
        if (!tab) {
          if ($scope.tabs.length === 0) {
            if ($scope.formSchema.length > 0) {
              $scope.tabs.push({title: 'Main', content: []});
              tab = $scope.tabs[0];
              for (var i = 0; i < $scope.formSchema.length; i++) {
                tab.content.push($scope.formSchema[i]);
              }
            }
          }
          tab = $scope.tabs[$scope.tabs.push({title: tabTitle, containerType: 'tab', content: []}) - 1];
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
                handleSchema('Nested ' + field, mongooseType.schema, schemaSchema, null, field + '.', true);
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
                if (handleConditionals(formInstructions.showIf, formInstructions.name) && field !== 'options') {
                  var formInst = handleFieldType(formInstructions, mongooseType, mongooseOptions);
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

    $scope.processServerData = function (recordFromServer) {
      master = convertToAngularModel($scope.formSchema, recordFromServer, 0);
      $scope.phase = 'ready';
      $scope.cancel();
    };

    $scope.readRecord = function () {
      SubmissionsService.readRecord($scope.modelName, $scope.id)
        .success(function (data) {
          if (data.success === false) {
            $location.path('/404');
          }
          allowLocationChange = false;
          $scope.phase = 'reading';
          if (typeof $scope.dataEventFunctions.onAfterRead === 'function') {
            $scope.dataEventFunctions.onAfterRead(data);
          }
          $scope.processServerData(data);
        }).error(function () {
          $location.path('/404');
        });
    };

    $scope.scrollTheList = function () {
      SubmissionsService.getPagedAndFilteredList($scope.modelName, {
        aggregate: $routeParams.a,
        find: $routeParams.f,
        limit: $scope.pageSize,
        skip: $scope.pagesLoaded * $scope.pageSize,
        order: $routeParams.o
      })
        .success(function (data) {
          if (angular.isArray(data)) {
            $scope.pagesLoaded++;
            $scope.recordList = $scope.recordList.concat(data);
          } else {
            $scope.showError(data, 'Invalid query');
          }
        })
        .error(function () {
          $location.path('/404');
        });
    };

    $scope.deleteRecord = function (model, id) {
      SubmissionsService.deleteRecord(model, id)
        .success(function () {
          if (typeof $scope.dataEventFunctions.onAfterDelete === 'function') {
            $scope.dataEventFunctions.onAfterDelete(master);
          }
          $location.path('/' + $scope.modelName);
        });
    };


    $scope.updateDocument = function (dataToSave, options) {
      $scope.phase = 'updating';

      SubmissionsService.updateRecord($scope.modelName, $scope.id, dataToSave)
        .success(function (data) {
          if (data.success !== false) {
            if (typeof $scope.dataEventFunctions.onAfterUpdate === 'function') {
              $scope.dataEventFunctions.onAfterUpdate(data, master);
            }
            if (options.redirect) {
              if (options.allowChange) {
                allowLocationChange = true;
              }
              $window.location = options.redirect;
            } else {
              $scope.processServerData(data);
              $scope.setPristine();
            }
          } else {
            $scope.showError(data);
          }
        })
        .error(handleError);

    };

    $scope.createNew = function (dataToSave, options) {
      SubmissionsService.createRecord($scope.modelName, dataToSave)
        .success(function (data) {
          if (data.success !== false) {
            if (typeof $scope.dataEventFunctions.onAfterCreate === 'function') {
              $scope.dataEventFunctions.onAfterCreate(data);
            }
            if (options.redirect) {
              $window.location = options.redirect;
            } else {
              $location.path('/' + $scope.modelName + '/' + $scope.formPlusSlash + data._id + '/edit');
              //                    reset?
            }
          } else {
            $scope.showError(data);
          }
        })
        .error(handleError);
    };

    SchemasService.getSchema($scope.modelName, $scope.formName)
      .success(function (data) {
        var listOnly = (!$scope.id && !$scope.newRecord);
        // passing null for formSchema parameter prevents all the work being done when we are just after the list data,
        // but should be removed when/if formschemas are cached
        handleSchema('Main ' + $scope.modelName, data, listOnly ? null : $scope.formSchema, $scope.listSchema, '', true);

        if (listOnly) {
          allowLocationChange = true;
        } else {
          var force = true;
          $scope.$watch('record', function (newValue, oldValue) {
            if (newValue !== oldValue) {
              force = $scope.updateDataDependentDisplay(newValue, oldValue, force);
            }
          }, true);

          if ($scope.id) {
            // Going to read a record
            if (typeof $scope.dataEventFunctions.onBeforeRead === 'function') {
              $scope.dataEventFunctions.onBeforeRead($scope.id, function (err) {
                if (err) {
                  $scope.showError(err);
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
      })
      .error(function () {
        $location.path('/404');
      });


    var setUpSelectOptions = function (lookupCollection, schemaElement) {
      var optionsList = $scope[schemaElement.options] = [];
      var idList = $scope[schemaElement.ids] = [];

      SchemasService.getSchema(lookupCollection)
        .success(function (data) {
          var listInstructions = [];
          handleSchema('Lookup ' + lookupCollection, data, null, listInstructions, '', false);

          SubmissionsService.getAll(lookupCollection)
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
                updateRecordWithLookupValues(schemaElement);
              }
            });
        });
    };


    $scope.setPristine = function () {
      $scope.dismissError();
      if ($scope[$scope.topLevelFormName]) {
        $scope[$scope.topLevelFormName].$setPristine();
      }
    };

    $scope.cancel = function () {
      angular.copy(master, $scope.record);
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
      var dataToSave = convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0);
      if ($scope.id) {
        if (typeof $scope.dataEventFunctions.onBeforeUpdate === 'function') {
          $scope.dataEventFunctions.onBeforeUpdate(dataToSave, master, function (err) {
            if (err) {
              $scope.showError(err);
            } else {
              $scope.updateDocument(dataToSave, options);
            }
          });
        } else {
          $scope.updateDocument(dataToSave, options);
        }
      } else {
        if (typeof $scope.dataEventFunctions.onBeforeCreate === 'function') {
          $scope.dataEventFunctions.onBeforeCreate(dataToSave, function (err) {
            if (err) {
              $scope.showError(err);
            } else {
              $scope.createNew(dataToSave, options);
            }
          });
        } else {
          $scope.createNew(dataToSave, options);
        }
      }
    };

    $scope.new = function () {
      $location.search('');
      $location.path('/' + $scope.modelName + '/' + $scope.formPlusSlash + 'new');
    };


    $scope.$on('$locationChangeStart', function (event, next) {
      if (!allowLocationChange && !$scope.isCancelDisabled()) {
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
              allowLocationChange = true;
              $window.location = next;
            }
          }
        );
      }
    });

    $scope.delete = function () {
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
                $scope.dataEventFunctions.onBeforeDelete(master, function (err) {
                  if (err) {
                    $scope.showError(err);
                  } else {
                    $scope.deleteRecord($scope.modelName, $scope.id);
                  }
                });
              } else {
                $scope.deleteRecord($scope.modelName, $scope.id);
              }
            }
          }
        );
      }
    };

    $scope.isCancelDisabled = function () {
      if (typeof $scope.disableFunctions.isCancelDisabled === 'function') {
        return $scope.disableFunctions.isCancelDisabled($scope.record, master, $scope[$scope.topLevelFormName]);
      } else {
        return $scope[$scope.topLevelFormName] && $scope[$scope.topLevelFormName].$pristine;
      }
    };

    $scope.isSaveDisabled = function () {
      if (typeof $scope.disableFunctions.isSaveDisabled === 'function') {
        return $scope.disableFunctions.isSaveDisabled($scope.record, master, $scope[$scope.topLevelFormName]);
      } else {
        return ($scope[$scope.topLevelFormName] && ($scope[$scope.topLevelFormName].$invalid || $scope[$scope.topLevelFormName].$pristine));
      }
    };

    $scope.isDeleteDisabled = function () {
      if (typeof $scope.disableFunctions.isDeleteDisabled === 'function') {
        return $scope.disableFunctions.isDeleteDisabled($scope.record, master, $scope[$scope.topLevelFormName]);
      } else {
        return (!$scope.id);
      }
    };

    $scope.isNewDisabled = function () {
      if (typeof $scope.disableFunctions.isNewDisabled === 'function') {
        return $scope.disableFunctions.isNewDisabled($scope.record, master, $scope[$scope.topLevelFormName]);
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
      $scope.setFormDirty($event);
    };

    $scope.remove = function (fieldName, value, $event) {
      // Remove an element from an array
      var fieldParts = fieldName.split('.');
      var arrayField = $scope.record;
      for (var i = 0, l = fieldParts.length; i < l; i++) {
        arrayField = arrayField[fieldParts[i]];
      }
      arrayField.splice(value, 1);
      $scope.setFormDirty($event);
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
              thisField[k] = {x: thisField[k] };
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
                }
              });
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
              thisField[k] = thisField[k].x;
            }
          }

          // Convert {lookup:'List description for 012abcde'} to {lookup:'012abcde'}
          var idList = $scope[suffixCleanId(schema[i], '_ids')];
          if (idList && idList.length > 0) {
            updateObject(fieldname, anObject, function (value) {
              return convertToForeignKeys(schema[i], value, $scope[suffixCleanId(schema[i], 'Options')], idList);
            });
          } else if (schema[i].select2) {
            var lookup = $scope.getData(anObject, fieldname, null);
            if (schema[i].select2.fngAjax) {
              if (lookup && lookup.id) {
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
      } else if (schemaElement.select2) {
        return {id: input, text: convertIdToListValue(input, ids, values, schemaElement.name)};
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

    var updateRecordWithLookupValues = function (schemaElement) {
      // Update the master and the record with the lookup values
      if (!$scope.topLevelFormName || $scope[$scope.topLevelFormName].$pristine) {
        updateObject(schemaElement.name, master, function (value) {
          return convertForeignKeys(schemaElement, value, $scope[suffixCleanId(schemaElement, 'Options')], $scope[suffixCleanId(schemaElement, '_ids')]);
        });
        // TODO This needs a rethink - it is a quick workaround.  See https://trello.com/c/q3B7Usll
        if (master[schemaElement.name]) {
          $scope.record[schemaElement.name] = master[schemaElement.name];
        }
      }
    };

    // Open a select2 control from the appended search button
    $scope.openSelect2 = function (ev) {
      $('#' + $(ev.currentTarget).data('select2-open')).select2('open');
    };

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
'use strict';

formsAngular.controller('ModelCtrl', [ '$scope', '$http', '$location', 'urlService', function ($scope, $http, $location, urlService) {

  $scope.models = [];
  $http.get('/api/models').success(function (data) {
    $scope.models = data;
  }).error(function () {
    $location.path('/404');
  });

  $scope.newUrl = function (model) {
    return urlService.buildUrl(model + '/new');
  };

  $scope.listUrl = function (model) {
    return urlService.buildUrl(model);
  };

}]);

'use strict';

formsAngular.controller('NavCtrl',
  ['$scope', '$data', '$location', '$filter', '$locationParse', '$controller', 'urlService', 'cssFrameworkService',
    function ($scope, $data, $location, $filter, $locationParse, $controller, urlService, cssFrameworkService) {

  $scope.items = [];

  $scope.globalShortcuts = function (event) {
    if (event.keyCode === 191 && event.ctrlKey) {
      // Ctrl+/ takes you to global search
      document.querySelector('#searchinput').focus();
      event.preventDefault();
    }
  };

  $scope.css = function (fn, arg) {
    var result;
    if (typeof cssFrameworkService[fn] === 'function') {
      result = cssFrameworkService[fn](arg);
    } else {
      result = 'error text-error';
    }
    return result;
  };

  function loadControllerAndMenu(controllerName, level) {
    var locals = {}, addThis;

    controllerName += 'Ctrl';
    locals.$scope = $scope.scopes[level] = $scope.$new();
    try {
      $controller(controllerName, locals);
      if ($scope.routing.newRecord) {
        addThis = 'creating';
      } else if ($scope.routing.id) {
        addThis = 'editing';
      } else {
        addThis = 'listing';
      }
      if (angular.isObject(locals.$scope.contextMenu)) {
        angular.forEach(locals.$scope.contextMenu, function (value) {
          if (value[addThis]) {
            $scope.items.push(value);
          }
        });
      }
    }
    catch (error) {
      // Check to see if error is no such controller - don't care
      if (!(/is not a function, got undefined/.test(error.message))) {
        console.log('Unable to instantiate ' + controllerName + ' - ' + error.message);
      }
    }
  }

  $scope.$on('$locationChangeSuccess', function () {

    $scope.routing = $locationParse($location.$$path);

    $scope.items = [];

    if ($scope.routing.analyse) {
      $scope.contextMenu = 'Report';
      $scope.items = [
        {
          broadcast: 'exportToPDF',
          text: 'PDF'
        },
        {
          broadcast: 'exportToCSV',
          text: 'CSV'
        }
      ];
    } else if ($scope.routing.modelName) {

      angular.forEach($scope.scopes, function (value) {
        value.$destroy();
      });
      $scope.scopes = [];
      $data.record = {};
      $data.disableFunctions = {};
      $data.dataEventFunctions = {};
      delete $data.dropDownDisplay;
      delete $data.modelNameDisplay;
      // Now load context menu.  For /person/client/:id/edit we need
      // to load PersonCtrl and PersonClientCtrl
      var modelName = $filter('titleCase')($scope.routing.modelName, true);
      loadControllerAndMenu(modelName, 0);
      if ($scope.routing.formName) {
        loadControllerAndMenu(modelName + $filter('titleCase')($scope.routing.formName, true), 1);
      }
      $scope.contextMenu = $data.dropDownDisplay || $data.modelNameDisplay || $filter('titleCase')($scope.routing.modelName, false);
    }
  });

  $scope.doClick = function (index) {
    if ($scope.items[index].broadcast) {
      $scope.$broadcast($scope.items[index].broadcast);
    } else {
      // Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
      var args = $scope.items[index].args || [],
        fn = $scope.items[index].fn;
      switch (args.length) {
        case  0:
          fn();
          break;
        case  1:
          fn(args[0]);
          break;
        case  2:
          fn(args[0], args[1]);
          break;
        case  3:
          fn(args[0], args[1], args[2]);
          break;
        case  4:
          fn(args[0], args[1], args[2], args[3]);
          break;
      }
    }
  };

  $scope.isHidden = function (index) {
    return $scope.items[index].isHidden ? $scope.items[index].isHidden() : false;
  };

  $scope.buildUrl = function (path) {
    return urlService.buildUrl(path);
  };

}]);

'use strict';
formsAngular
  .directive('formButtons', ['cssFrameworkService', function (cssFrameworkService) {
    return {
      restrict: 'A',
      templateUrl: 'template/form-button-' + cssFrameworkService.framework() + '.html'
    };
  }]);

'use strict';

formsAngular
  .directive('formInput', ['$compile', '$rootScope', 'utils', '$filter', 'urlService', 'cssFrameworkService', function ($compile, $rootScope, utils, $filter, urlService, cssFrameworkService) {
    return {
      restrict: 'EA',
      link: function (scope, element, attrs) {
//                generate markup for bootstrap forms
//
//                Bootstrap 3
//                Horizontal (default)
//                <div class="form-group">
//                    <label for="inputEmail3" class="col-sm-2 control-label">Email</label>
//                    <div class="col-sm-10">
//                        <input type="email" class="form-control" id="inputEmail3" placeholder="Email">
//                    </div>
//                 </div>
//
//                Vertical
//                <div class="form-group">
//                    <label for="exampleInputEmail1">Email address</label>
//                    <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Enter email">
//                </div>
//
//                Inline
//                <div class="form-group">
//                    <label class="sr-only" for="exampleInputEmail2">Email address</label>
//                    <input type="email" class="form-control" id="exampleInputEmail2" placeholder="Enter email">
//                </div>

//                Bootstrap 2
//                Horizontal (default)
//                <div class="control-group">
//                    <label class="control-label" for="inputEmail">Email</label>
//                    <div class="controls">
//                        <input type="text" id="inputEmail" placeholder="Email">
//                    </div>
//                </div>
//
//                Vertical
//                <label>Label name</label>
//                <input type="text" placeholder="Type something…">
//                <span class="help-block">Example block-level help text here.</span>
//
//                Inline
//                <input type="text" class="input-small" placeholder="Email">

        var sizeMapping = [1, 2, 4, 6, 8, 10, 12],
          sizeDescriptions = ['mini', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'block-level'],
          defaultSizeOffset = 2, // medium, which was the default for Twitter Bootstrap 2
          subkeys = [],
          tabsSetup = false;

        var isHorizontalStyle = function (formStyle) {
          return (!formStyle || formStyle === 'undefined' || ['vertical', 'inline'].indexOf(formStyle) === -1);
        };

        var generateNgShow = function (showWhen, model) {

          function evaluateSide(side) {
            var result = side;
            if (typeof side === 'string') {
              if (side.slice(0, 1) === '$') {
                result = (model || 'record') + '.';
                var parts = side.slice(1).split('.');
                if (parts.length > 1) {
                  var lastBit = parts.pop();
                  result += parts.join('.') + '[$index].' + lastBit;
                } else {
                  result += side.slice(1);
                }
              } else {
                result = '\'' + side + '\'';
              }
            }
            return result;
          }

          var conditionText = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
            conditionSymbols = ['===', '!==', '>', '>=', '<', '<='],
            conditionPos = conditionText.indexOf(showWhen.comp);

          if (conditionPos === -1) { throw new Error('Invalid comparison in showWhen'); }
          return evaluateSide(showWhen.lhs) + conditionSymbols[conditionPos] + evaluateSide(showWhen.rhs);
        };

        var generateDefault = function (common, options, fieldInfo) {
          var result = '<input ' + common + 'type="' + fieldInfo.type + '"';
          if (options.formstyle === 'inline' && cssFrameworkService.framework() === 'bs2' && !fieldInfo.size) {
            result += 'class="input-small"';
          }
          result += ' />';
          return result;
        };

        var generateInput = function (fieldInfo, modelString, isRequired, idString, options) {
          var nameString;
          if (!modelString) {
            modelString = (options.model || 'record') + '.';
            if (options.subschema && fieldInfo.name.indexOf('.') !== -1) {
              // Schema handling - need to massage the ngModel and the id
              var compoundName = fieldInfo.name,
                lastPartStart = compoundName.lastIndexOf('.'),
                lastPart = compoundName.slice(lastPartStart + 1);
              if (options.index) {
                var cut = modelString.length;
                modelString += compoundName.slice(0, lastPartStart) + '.' + options.index + '.' + lastPart;
                idString = 'f_' + modelString.slice(cut).replace(/\./g, '-');
              } else {
                modelString += compoundName.slice(0, lastPartStart);
                if (options.subkey) {
                  modelString += '[' + '$_arrayOffset_' + compoundName.slice(0, lastPartStart).replace(/\./g, '_') + '_' + options.subkeyno + '].' + lastPart;
                  idString = compoundName + '_subkey';
                } else {
                  modelString += '[$index].' + lastPart;
                  idString = null;
                  nameString = compoundName.replace(/\./g, '-');
                }
              }
            } else {
              modelString += fieldInfo.name;
            }
          }
          var value,
            requiredStr = (isRequired || fieldInfo.required) ? ' required' : '',
            readonlyStr = fieldInfo.readonly ? ' readonly' : '',
            placeHolder = fieldInfo.placeHolder,
            compactClass = '',
            sizeClassBS3 = '',
            sizeClassBS2 = '',
            formControl = '';

          if (cssFrameworkService.framework() === 'bs3') {
            compactClass = (['horizontal', 'vertical', 'inline'].indexOf(options.formstyle) === -1) ? ' input-sm' : '';
            sizeClassBS3 = 'col-xs-' + sizeMapping[fieldInfo.size ? sizeDescriptions.indexOf(fieldInfo.size) : defaultSizeOffset];
            formControl = ' form-control';
          } else {
            sizeClassBS2 = (fieldInfo.size ? ' input-' + fieldInfo.size : '');
          }

          if (options.formstyle === 'inline') { placeHolder = placeHolder || fieldInfo.label; }
          var common = 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '" ' : ' name="' + nameString + '" ');
          common += (placeHolder ? ('placeholder="' + placeHolder + '" ') : '');
          if (fieldInfo.popup) {
            common += 'title="' + fieldInfo.popup + '" ';
          }
          common += addAll('Field', null, options);
          switch (fieldInfo.type) {
            case 'select' :
              common += (fieldInfo.readonly ? 'disabled ' : '');
              if (fieldInfo.select2) {
                common += 'class="fng-select2' + formControl + compactClass + sizeClassBS2 + '"';
                if (fieldInfo.select2.fngAjax) {
                  if (cssFrameworkService.framework() === 'bs2') {
                    value = '<div class="input-append">';
                    value += '<input ui-select2="' + fieldInfo.select2.fngAjax + '" ' + common + '>';
                    value += '<button class="btn" type="button" data-select2-open="' + idString + '" ng-click="openSelect2($event)"><i class="icon-search"></i></button>';
                    value += '</div>';
                  } else {
                    value = '<div class="input-group">';
                    value += '<input ui-select2="' + fieldInfo.select2.fngAjax + '" ' + common + '>';
                    value += '<span class="input-group-addon' + compactClass + '" data-select2-open="' + idString + '" ';
                    value += '    ng-click="openSelect2($event)"><i class="glyphicon glyphicon-search"></i></span>';
                    value += '</div>';
                  }
                } else if (fieldInfo.select2) {
                  value = '<input ui-select2="' + fieldInfo.select2.s2query + '" ' + (fieldInfo.readonly ? 'disabled ' : '') + common + '>';
                }
              } else {
                value = '<select ' + common + 'class="' + formControl.trim() + compactClass + sizeClassBS2 + '">';
                if (!isRequired) {
                  value += '<option></option>';
                }
                if (angular.isArray(fieldInfo.options)) {
                  angular.forEach(fieldInfo.options, function (optValue) {
                    if (_.isObject(optValue)) {
                      value += '<option value="' + (optValue.val || optValue.id) + '">' + (optValue.label || optValue.text) + '</option>';
                    } else {
                      value += '<option>' + optValue + '</option>';
                    }
                  });
                } else {
                  value += '<option ng-repeat="option in ' + fieldInfo.options + '">{{option}}</option>';
                }
                value += '</select>';
              }
              break;
            case 'fileuploader':

              value = '<ng-upload-form url="/file/upload" auto-upload="true" size-limit="50000000"></ng-upload-form>';
              break;
            case 'link' :
              value = '<a ng-href="/' + urlService.buildUrl('') + fieldInfo.ref + (fieldInfo.form ? '/' + fieldInfo.form : '') + '/{{ ' + modelString + '}}/edit">' + fieldInfo.linkText + '</a>';
              break;
            case 'radio' :
              value = '';
              var separateLines = (options.formstyle !== 'inline' && !fieldInfo.inlineRadio);

              if (angular.isArray(fieldInfo.options)) {
                if (options.subschema) { common = common.replace('name="', 'name="{{$index}}-'); }
                angular.forEach(fieldInfo.options, function (optValue) {
                  value += '<input ' + common + 'type="radio"';
                  value += ' value="' + optValue + '">' + optValue;
                  if (separateLines) { value += '<br />'; }
                });
              } else {
                var tagType = separateLines ? 'div' : 'span';
                if (options.subschema) { common = common.replace('$index', '$parent.$index').replace('name="', 'name="{{$parent.$index}}-'); }
                value += '<' + tagType + ' ng-repeat="option in ' + fieldInfo.options + '"><input ' + common + ' type="radio" value="{{option}}"> {{option}} </' + tagType + '> ';
              }
              break;
            case 'checkbox' :
              if (cssFrameworkService.framework() === 'bs3') {
                value = '<div class="checkbox"><input ' + common + 'type="checkbox"></div>';
              } else {
                value = generateDefault(common, options, fieldInfo);
              }
              break;
            default:
              common += 'class="' + formControl.trim() + compactClass + sizeClassBS2 + '"' + (fieldInfo.add ? fieldInfo.add : '');
              common += 'ng-model="' + modelString + '"' + (idString ? ' id="' + idString + '" name="' + idString + '"' : '') + requiredStr + readonlyStr + ' ';
              if (fieldInfo.type === 'textarea') {
                if (fieldInfo.rows) {
                  if (fieldInfo.rows === 'auto') {
                    common += 'msd-elastic="\n" class="ng-animate" ';
                  } else {
                    common += 'rows = "' + fieldInfo.rows + '" ';
                  }
                }
                if (fieldInfo.editor === 'ckEditor') {
                  common += 'ckeditor = "" ';
                  if (cssFrameworkService.framework() === 'bs3') { sizeClassBS3 = 'col-xs-12'; }
                }
                value = '<textarea ' + common + ' />';
              } else {
                value = generateDefault(common, options, fieldInfo);
              }
          }
          if (cssFrameworkService.framework() === 'bs3' && isHorizontalStyle(options.formstyle) && fieldInfo.type !== 'checkbox') {
            value = '<div class="' + sizeClassBS3 + '">' + value + '</div>';
          }
          if (fieldInfo.helpInline && fieldInfo.type !== 'checkbox') {
            value += '<span class="help-inline">' + fieldInfo.helpInline + '</span>';
          }
          if (fieldInfo.help) {
            value += '<span class="help-block ' + sizeClassBS3 + '">' + fieldInfo.help + '</span>';
          }
          return value;
        };

        var convertFormStyleToClass = function (aFormStyle) {
          var result;
          switch (aFormStyle) {
            case 'horizontal' :
              result = 'form-horizontal';
              break;
            case 'vertical' :
              result = '';
              break;
            case 'inline' :
              result = 'form-inline';
              break;
            case 'horizontalCompact' :
              result = 'form-horizontal compact';
              break;
            default:
              result = 'form-horizontal compact';
              break;
          }
          return result;
        };

        var containerInstructions = function (info) {
          var result = {before: '', after: ''};
          if (typeof info.containerType === 'function') {
            result = info.containerType(info);
          } else {
            switch (info.containerType) {
              case 'tab' :
                result.before = '<tab heading="' + info.title + '">';
                result.after = '</tab>';
                break;
              case 'tabset' :
                result.before = '<tabset>';
                result.after = '</tabset>';
                break;
              case 'well' :
                result.before = '<div class="well">';
                if (info.title) {
                  result.before += '<h4>' + info.title + '</h4>';
                }
                result.after = '</div>';
                break;
              case 'well-large' :
                result.before = '<div class="well well-lg well-large">';
                result.after = '</div>';
                break;
              case 'well-small' :
                result.before = '<div class="well well-sm well-small">';
                result.after = '</div>';
                break;
              case 'fieldset' :
                result.before = '<fieldset>';
                if (info.title) {
                  result.before += '<legend>' + info.title + '</legend>';
                }
                result.after = '</fieldset>';
                break;
              case undefined:
                break;
              case null:
                break;
              case '':
                break;
              default:
                result.before = '<div class="' + info.containerType + '">';
                if (info.title) {
                  var titleLook = info.titleTagOrClass || 'h4';
                  if (titleLook.match(/h[1-6]/)) {
                    result.before += '<' + titleLook + '>' + info.title + '</' + info.titleLook + '>';
                  } else {
                    result.before += '<p class="' + titleLook + '">' + info.title + '</p>';
                  }
                }
                result.after = '</div>';
                break;
            }
          }
          return result;
        };

        var generateLabel = function (fieldInfo, addButtonMarkup, options) {
          var labelHTML = '';
          if ((cssFrameworkService.framework() === 'bs3' || (options.formstyle !== 'inline' && fieldInfo.label !== '')) || addButtonMarkup) {
            labelHTML = '<label';
            if (isHorizontalStyle(options.formstyle)) {
              labelHTML += ' for="' + fieldInfo.id + '"';
              if (cssFrameworkService.framework() === 'bs3') { labelHTML += addAll('Label', 'col-sm-2', options); }
            } else if (options.formstyle === 'inline') {
              labelHTML += ' for="' + fieldInfo.id + '" class="sr-only"';
            }
            labelHTML += addAll('Label', 'control-label', options);
            labelHTML += '>' + fieldInfo.label + (addButtonMarkup || '') + '</label>';
          }
          return labelHTML;
        };

        var handleField = function (info, options) {

          info.type = info.type || 'text';
          info.id = info.id || 'f_' + info.name.replace(/\./g, '_');
          info.label = (info.label !== undefined) ? (info.label === null ? '' : info.label) : $filter('titleCase')(info.name.split('.').slice(-1)[0]);

          var template = '', closeTag = '';
          var classes = '';
          if (cssFrameworkService.framework() === 'bs3') {
            classes = 'form-group';
            if (options.formstyle === 'vertical' && info.size !== 'block-level') {
              template += '<div class="row">';
              classes += ' col-xs-' + sizeMapping[info.size ? sizeDescriptions.indexOf(info.size) : defaultSizeOffset];
              closeTag += '</div>';
            }
            template += '<div' + addAll('Group', classes, options);
            closeTag += '</div>';
          } else {
            if (isHorizontalStyle(options.formstyle)) {
              template += '<div' + addAll('Group', 'control-group', options);
              closeTag = '</div>';
            } else {
              template += '<span ';
              closeTag = '</span>';
            }
          }

          var includeIndex = false;
          if (options.index) {
            try {
              parseInt(options.index);
              includeIndex = true;
            } catch (err) {
              // Nothing to do
            }
          }
          if (info.showWhen) {
            if (typeof info.showWhen === 'string') {
              template += 'ng-show="' + info.showWhen + '"';
            } else {
              template += 'ng-show="' + generateNgShow(info.showWhen, options.model) + '"';
            }
          }
          if (includeIndex) {
            template += ' id="cg_' + info.id.replace('_', '-' + attrs.index + '-') + '">';
          } else {
            template += ' id="cg_' + info.id.replace(/\./g, '-') + '">';
          }

          if (info.schema) {
            var niceName = info.name.replace(/\./g, '_');
            var schemaDefName = '$_schema_' + niceName;
            scope[schemaDefName] = info.schema;
            if (info.schema) { // display as a control group
              //schemas (which means they are arrays in Mongoose)
              // Check for subkey - selecting out one or more of the array
              if (info.subkey) {
                info.subkey.path = info.name;
                scope[schemaDefName + '_subkey'] = info.subkey;

                var subKeyArray = angular.isArray(info.subkey) ? info.subkey : [info.subkey];
                for (var arraySel = 0; arraySel < subKeyArray.length; arraySel++) {
                  var topAndTail = containerInstructions(subKeyArray[arraySel]);
                  template += topAndTail.before;
                  template += processInstructions(info.schema, null, {subschema: true, formStyle: options.formstyle, subkey: schemaDefName + '_subkey', subkeyno: arraySel});
                  template += topAndTail.after;
                }
                subkeys.push(info);
              } else {
                template += '<div class="schema-head">' + info.label +
                  '</div>' +
                  '<div ng-form class="' + (cssFrameworkService.framework() === 'bs2' ? 'row-fluid ' : '') +
                  convertFormStyleToClass(info.formStyle) + '" name="form_' + niceName + '{{$index}}" class="sub-doc well" id="' + info.id + 'List_{{$index}}" ' +
                  ' ng-repeat="subDoc in ' + (options.model || 'record') + '.' + info.name + ' track by $index">' +
                  '   <div class="' + (cssFrameworkService.framework() === 'bs2' ? 'row-fluid' : 'row') + ' sub-doc">' +
                  '      <div class="pull-left">' + processInstructions(info.schema, false, {subschema: true, formstyle: info.formStyle, model: options.model}) +
                  '      </div>';

                if (!info.noRemove || info.customSubDoc) {
                  template += '   <div class="pull-left sub-doc-btns">';
                  if (info.customSubDoc) {
                    template += info.customSubDoc;
                  }
                  if (!info.noRemove) {
                    if (cssFrameworkService.framework() === 'bs2') {
                      template += '      <button name="remove_' + info.id + '_btn" class="remove-btn btn btn-mini form-btn" ng-click="remove(\'' + info.name + '\',$index,$event)">' +
                        '          <i class="icon-minus">';

                    } else {
                      template += '      <button name="remove_' + info.id + '_btn" class="remove-btn btn btn-default btn-xs form-btn" ng-click="remove(\'' + info.name + '\',$index,$event)">' +
                        '          <i class="glyphicon glyphicon-minus">';
                    }
                    template += '          </i> Remove' +
                      '      </button>';
                  }
                  template += '  </div> ';
                }
                template += '   </div>' +
                  '</div>';
                if (!info.noAdd || info.customFooter) {
                  template += '<div class = "schema-foot">';
                  if (info.customFooter) {
                    template += info.customFooter;
                  }
                  if (!info.noAdd) {
                    if (cssFrameworkService.framework() === 'bs2') {
                      template += '    <button id="add_' + info.id + '_btn" class="add-btn btn btn-mini form-btn" ng-click="add(\'' + info.name + '\',$event)">' +
                        '        <i class="icon-plus"></i> Add';
                    } else {
                      template += '    <button id="add_' + info.id + '_btn" class="add-btn btn btn-default btn-xs form-btn" ng-click="add(\'' + info.name + '\',$event)">' +
                        '        <i class="glyphicon glyphicon-plus"></i> Add';
                    }
                    template += '    </button>';
                  }
                  template += '</div>';
                }
              }
            }
          }
          else {
            // Handle arrays here
            var controlClass = [];
            if (isHorizontalStyle(options.formstyle)) {
              controlClass.push(cssFrameworkService.framework() === 'bs2' ? 'controls' : 'col-sm-10');
            }
            if (info.array) {
              controlClass.push('fng-array');
              if (options.formstyle === 'inline') { throw 'Cannot use arrays in an inline form'; }
              if (cssFrameworkService.framework() === 'bs2') {
                template += generateLabel(info, ' <i id="add_' + info.id + '" ng-click="add(\'' + info.name + '\',$event)" class="icon-plus-sign"></i>', options) +
                  '<div class="' + controlClass.join(' ') + '" id="' + info.id + 'List" ng-repeat="arrayItem in ' + (options.model || 'record') + '.' + info.name + '">' +
                  generateInput(info, 'arrayItem.x', true, info.id + '_{{$index}}', options) +
                  '<i ng-click="remove(\'' + info.name + '\',$index,$event)" id="remove_' + info.id + '_{{$index}}" class="icon-minus-sign"></i>' +
                  '</div>';
              } else {
                template += generateLabel(info, ' <i id="add_' + info.id + '" ng-click="add(\'' + info.name + '\',$event)" class="glyphicon glyphicon-plus-sign"></i>', options) +
                  '<div ng-class="skipCols($index)" class="' + controlClass.join(' ') + '" id="' + info.id + 'List" ng-repeat="arrayItem in ' + (options.model || 'record') + '.' + info.name + '">' +
                  generateInput(info, 'arrayItem.x', true, info.id + '_{{$index}}', options) +
                  '<i ng-click="remove(\'' + info.name + '\',$index,$event)" id="remove_' + info.id + '_{{$index}}" class="glyphicon glyphicon-minus-sign"></i>' +
                  '</div>';
              }
            } else {
              // Single fields here
              template += generateLabel(info, null, options);
              if (controlClass.length > 0) { template += '<div class="' + controlClass.join(' ') + '">'; }
              template += generateInput(info, null, options.required, info.id, options);
              if (controlClass.length > 0) { template += '</div>'; }
            }
          }
          template += closeTag;
          return template;
        };

//              var processInstructions = function (instructionsArray, topLevel, groupId) {
//  removing groupId as it was only used when called by containerType container, which is removed for now
        var processInstructions = function (instructionsArray, topLevel, options) {
          var result = '';
          if (instructionsArray) {
            for (var anInstruction = 0; anInstruction < instructionsArray.length; anInstruction++) {
              var info = instructionsArray[anInstruction];
              if (anInstruction === 0 && topLevel && !options.schema.match(/$_schema_/)) {
                info.add = (info.add || '');
                if (info.add.indexOf('ui-date') === -1 && !options.noautofocus && !info.containerType) {
                  info.add = info.add + 'autofocus ';
                }
              }
              var callHandleField = true;
              if (info.directive) {
                var directiveName = info.directive;
                var newElement = '<' + directiveName + ' model="' + (options.model || 'record') + '"';
                var thisElement = element[0];
                for (var i = 0; i < thisElement.attributes.length; i++) {
                  var thisAttr = thisElement.attributes[i];
                  switch (thisAttr.nodeName) {
                    case 'class' :
                      var classes = thisAttr.nodeValue.replace('ng-scope', '');
                      if (classes.length > 0) {
                        newElement += ' class="' + classes + '"';
                      }
                      break;
                    case 'schema' :
                      var bespokeSchemaDefName = ('bespoke_' + info.name).replace(/\./g, '_');
                      scope[bespokeSchemaDefName] = angular.copy(info);
                      delete scope[bespokeSchemaDefName].directive;
                      newElement += ' schema="' + bespokeSchemaDefName + '"';
                      break;
                    default :
                      newElement += ' ' + thisAttr.nodeName + '="' + thisAttr.nodeValue + '"';
                  }
                }
                newElement += '></' + directiveName + '>';
                result += newElement;
                callHandleField = false;
              } else if (info.containerType) {
                var parts = containerInstructions(info);
                switch (info.containerType) {
                  case 'tab' :
                    // maintain support for simplified tabset syntax for now
                    if (!tabsSetup) {
                      tabsSetup = 'forced';
                      result += '<tabset>';
                    }

                    result += parts.before;
                    result += processInstructions(info.content, null, options);
                    result += parts.after;
                    break;
                  case 'tabset' :
                    tabsSetup = true;
                    result += parts.before;
                    result += processInstructions(info.content, null, options);
                    result += parts.after;
                    break;
                  default:
                    // includes wells, fieldset
                    result += parts.before;
                    result += processInstructions(info.content, null, options);
                    result += parts.after;
                    break;
                }
                callHandleField = false;
              } else if (options.subkey) {
                // Don't display fields that form part of the subkey, as they should not be edited (because in these circumstances they form some kind of key)
                var objectToSearch = angular.isArray(scope[options.subkey]) ? scope[options.subkey][0].keyList : scope[options.subkey].keyList;
                if (_.find(objectToSearch, function (value, key) {
                  return scope[options.subkey].path + '.' + key === info.name;
                })) {
                  callHandleField = false;
                }
              }
              if (callHandleField) {
                //                            if (groupId) {
                //                                scope['showHide' + groupId] = true;
                //                            }
                result += handleField(info, options);
              }
            }
          } else {
            console.log('Empty array passed to processInstructions');
            result = '';
          }
          return result;

        };

        var unwatch = scope.$watch(attrs.schema, function (newValue) {
          if (newValue) {
            newValue = angular.isArray(newValue) ? newValue : [newValue];   // otherwise some old tests stop working for no real reason
            if (newValue.length > 0) {
              unwatch();
              var elementHtml = '';
              var theRecord = scope[attrs.model || 'record'];      // By default data comes from scope.record
              if ((attrs.subschema || attrs.model) && !attrs.forceform) {
                elementHtml = '';
              } else {
                scope.topLevelFormName = attrs.name || 'myForm';     // Form name defaults to myForm
                // Copy attrs we don't process into form
                var customAttrs = '';
                for (var thisAttr in attrs) {
                  if (attrs.hasOwnProperty(thisAttr)) {
                    if (thisAttr[0] !== '$' && ['name', 'formstyle', 'schema', 'subschema', 'model'].indexOf(thisAttr) === -1) {
                      customAttrs += ' ' + attrs.$attr[thisAttr] + '="' + attrs[thisAttr] + '"';
                    }
                  }
                }
                elementHtml = '<form name="' + scope.topLevelFormName + '" class="' + convertFormStyleToClass(attrs.formstyle) + ' novalidate"' + customAttrs + '>';
              }
              if (theRecord === scope.topLevelFormName) { throw new Error('Model and Name must be distinct - they are both ' + theRecord); }
              elementHtml += processInstructions(newValue, true, attrs);
              if (tabsSetup === 'forced') {
                elementHtml += '</tabset>';
              }
              elementHtml += attrs.subschema ? '' : '</form>';
              element.replaceWith($compile(elementHtml)(scope));
              // If there are subkeys we need to fix up ng-model references when record is read
              if (subkeys.length > 0) {
                var unwatch2 = scope.$watch('phase', function (newValue) {
                  if (newValue === 'ready') {
                    unwatch2();
                    for (var subkeyCtr = 0; subkeyCtr < subkeys.length; subkeyCtr++) {
                      var info = subkeys[subkeyCtr],
                        arrayOffset,
                        matching,
                        arrayToProcess = angular.isArray(info.subkey) ? info.subkey : [info.subkey];

                      for (var thisOffset = 0; thisOffset < arrayToProcess.length; thisOffset++) {
                        var thisSubkeyList = arrayToProcess[thisOffset].keyList;
                        var dataVal = theRecord[info.name] = theRecord[info.name] || [];
                        for (arrayOffset = 0; arrayOffset < dataVal.length; arrayOffset++) {
                          matching = true;
                          for (var keyField in thisSubkeyList) {
                            if (thisSubkeyList.hasOwnProperty(keyField)) {
                              // Not (currently) concerned with objects here - just simple types
                              if (dataVal[arrayOffset][keyField] !== thisSubkeyList[keyField]) {
                                matching = false;
                                break;
                              }
                            }
                          }
                          if (matching) {
                            break;
                          }
                        }
                        if (!matching) {
                          // There is no matching array element - we need to create one
                          arrayOffset = theRecord[info.name].push(thisSubkeyList) - 1;
                        }
                        scope['$_arrayOffset_' + info.name.replace(/\./g, '_') + '_' + thisOffset] = arrayOffset;
                      }
                    }
                  }
                });
              }

              $rootScope.$broadcast('formInputDone');

              if (scope.updateDataDependentDisplay && theRecord && Object.keys(theRecord).length > 0) {
                // If this is not a test force the data dependent updates to the DOM
                scope.updateDataDependentDisplay(theRecord, null, true);
              }
            }
          }

        }, true);

        function addAll(type, additionalClasses, options) {
          var action = 'getAddAll' + type + 'Options';
          return utils[action](scope, options, additionalClasses) || [];
        }
      }
    };
  }])
;

'use strict';

formsAngular.controller('SearchCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {

  var currentRequest = '';

  $scope.handleKey = function (event) {
    if (event.keyCode === 27 && $scope.searchTarget.length > 0) {
      $scope.searchTarget = '';
    } else if ($scope.results.length > 0) {
      switch (event.keyCode) {
        case 38:
          // up arrow pressed
          if ($scope.focus > 0) {
            $scope.setFocus($scope.focus - 1);
          }
          if (typeof event.preventDefault === 'function') { event.preventDefault(); }
          break;
        case 40:
          // down arrow pressed
          if ($scope.results.length > $scope.focus + 1) {
            $scope.setFocus($scope.focus + 1);
          }
          if (typeof event.preventDefault === 'function') { event.preventDefault(); }
          break;
        case 13:
          if ($scope.focus != null) {
            $scope.selectResult($scope.focus);
          }
          break;
      }
    }
  };

  $scope.setFocus = function (index) {
    if ($scope.focus !== null) { delete $scope.results[$scope.focus].focussed; }
    $scope.results[index].focussed = true;
    $scope.focus = index;
  };

  $scope.selectResult = function (resultNo) {
    var result = $scope.results[resultNo];
    $location.path('/' + result.resource + '/' + result.id + '/edit');
  };

  $scope.resultClass = function (index) {
    var resultClass = 'search-result';
    if ($scope.results && $scope.results[index].focussed) { resultClass += ' focus'; }
    return resultClass;
  };

  var clearSearchResults = function () {
    $scope.moreCount = 0;
    $scope.errorClass = '';
    $scope.results = [];
    $scope.focus = null;
  };

  $scope.$watch('searchTarget', function (newValue) {
    if (newValue && newValue.length > 0) {
      currentRequest = newValue;
      $http.get('/api/search?q=' + newValue).success(function (data) {
        // Check that we haven't fired off a subsequent request, in which
        // case we are no longer interested in these results
        if (currentRequest === newValue) {
          if ($scope.searchTarget.length > 0) {
            $scope.results = data.results;
            $scope.moreCount = data.moreCount;
            if (data.results.length > 0) {
              $scope.errorClass = '';
              $scope.setFocus(0);
            }
            $scope.errorClass = $scope.results.length === 0 ? 'error' : '';
          } else {
            clearSearchResults();
          }
        }
      }).error(function (data, status) {
        console.log('Error in searchbox.js : ' + data + ' (status=' + status + ')');
      });
    } else {
      clearSearchResults();
    }
  }, true);

  $scope.$on('$routeChangeStart', function () {
    $scope.searchTarget = '';
  });

}])
  .directive('globalSearch', ['cssFrameworkService', function (cssFrameworkService) {
    return {
      restrict: 'AE',
      templateUrl: 'template/search-' + cssFrameworkService.framework() + '.html',
      controller: 'SearchCtrl'
    };
  }
  ]);

'use strict';

formsAngular.filter('titleCase', [function () {
  return function (str, stripSpaces) {
    var value = str
      .replace(/(_|\.)/g, ' ')                       // replace underscores and dots with spaces
      .replace(/[A-Z]/g, ' $&').trim()               // precede replace caps with a space
      .replace(/\w\S*/g, function (txt) {            // capitalise first letter of word
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    if (stripSpaces) {
      value = value.replace(/\s/g, '');
    } else {
      // lose double spaces
      value = value.replace(/\s{2,}/g, ' ');
    }
    return value;
  };
}]);
'use strict';

formsAngular.provider('cssFrameworkService', [function () {
  // Supported options for framework are:
  //      bs2 = Twitter Bootstrap 2.3.2 (default)
  //      bs3 = Bootstrap 3.1.1
  var config = {
    framework: 'bs2'  // Unit tests depend on this being bs2
  };

  return {
    setOptions: function (options) {
      angular.extend(config, options);
    },
    $get: function () {
      return {
        framework: function () {
          return config.framework;
        },
        span: function (cols) {
          var result;
          switch (config.framework) {
            case 'bs2' :
              result = 'span' + cols;
              break;
            case 'bs3' :
              result = 'col-xs-' + cols;
              break;
          }
          return result;
        },
        offset: function (cols) {
          var result;
          switch (config.framework) {
            case 'bs2' :
              result = 'offset' + cols;
              break;
            case 'bs3' :
              result = 'col-lg-offset-' + cols;
              break;
          }
          return result;
        },
        rowFluid: function () {
          var result;
          switch (config.framework) {
            case 'bs2' :
              result = 'row-fluid';
              break;
            case 'bs3' :
              result = 'row';
              break;
          }
          return result;
        }
      };
    }
  };
}]);

'use strict';

formsAngular.factory('$data', [function () {

  var sharedData = {
    record: {},
    disableFunctions: {},
    dataEventFunctions: {}
  };
  return sharedData;

}]);

'use strict';

formsAngular.provider('formRoutes', ['$routeProvider', function ($routeProvider) {

  var _fngRoutes = [
    {route: '/analyse/:model/:reportSchemaName',  options: {templateUrl: 'partials/base-analysis.html'}},
    {route: '/analyse/:model',                    options: {templateUrl: 'partials/base-analysis.html'}},
    {route: '/:model/:id/edit',                   options: {templateUrl: 'partials/base-edit.html'}},
    {route: '/:model/new',                        options: {templateUrl: 'partials/base-edit.html'}},
    {route: '/:model',                            options: {templateUrl: 'partials/base-list.html'}},
    {route: '/:model/:form/:id/edit',             options: {templateUrl: 'partials/base-edit.html'}},       // non default form (different fields etc)
    {route: '/:model/:form/new',                  options: {templateUrl: 'partials/base-edit.html'}},       // non default form (different fields etc)
    {route: '/:model/:form',                      options: {templateUrl: 'partials/base-list.html'}}        // list page with links to non default form
  ];

  var _setRoutes = function (appRoutes) {
    if (appRoutes === null || appRoutes === undefined) {
      throw new Error('invalid app routes being added to forms-angular');
    }
    for (var i = 0, end = appRoutes.length; i < end; i++) {
      $routeProvider.when(appRoutes[i].route, appRoutes[i].options);
    }
  };

  var _setDefaultRoute = function (defaultRoute) {
    if (defaultRoute !== null) {
      $routeProvider.otherwise({redirectTo: defaultRoute});
    }
  };

  return {
    setRoutes: function (appRoutes, defaultRoute) {
      _setRoutes(appRoutes);
      _setRoutes(_fngRoutes);
      _setDefaultRoute(defaultRoute);
    },
    $get: function () {
      return null;
    }
  };
}]);

'use strict';

formsAngular.factory('$locationParse', [function () {

  var lastRoute = null,
    lastObject = {};

  return function (location) {

    if (location !== lastRoute) {
      lastRoute = location;
      var locationSplit = location.split('/');
      var locationParts = locationSplit.length;
      if (locationParts === 2 && locationSplit[1] === 'index') {
        lastObject = {index: true};
      } else {
        lastObject = {newRecord: false};
        if (locationSplit[1] === 'analyse') {
          lastObject.analyse = true;
          lastObject.modelName = locationSplit[2];
        } else {
          lastObject.modelName = locationSplit[1];
          var lastPart = locationSplit[locationParts - 1];
          if (lastPart === 'new') {
            lastObject.newRecord = true;
            locationParts--;
          } else if (lastPart === 'edit') {
            locationParts = locationParts - 2;
            lastObject.id = locationSplit[locationParts];
          }
          if (locationParts > 2) {
            lastObject.formName = locationSplit[2];
          }
        }
      }
    }
    return lastObject;
  };
}]);


'use strict';

formsAngular.factory('SchemasService', ['$http', function ($http) {
  return {
    getSchema: function (modelName, formName) {
      return $http.get('/api/schema/' + modelName + (formName ? '/' + formName : ''), {cache: true});
    }
  };
}]);
'use strict';

formsAngular.factory('SubmissionsService', ['$http', function ($http) {
  /*
   generate a query string for a filtered and paginated query for submissions.
   options consists of the following:
   {
   aggregate - whether or not to aggregate results (http://docs.mongodb.org/manual/aggregation/)
   find - find parameter
   limit - limit results to this number of records
   skip - skip this number of records before returning results
   order - sort order
   }
   */
  var generateListQuery = function (options) {
    var queryString = '?l=' + options.limit;

    var addParameter = function (param, value) {
      if (value && value !== '') {
        queryString += '&' + param + '=' + value;
      }
    };

    addParameter('f', options.find);
    addParameter('a', options.aggregate);
    addParameter('o', options.order);
    addParameter('s', options.skip);

    return queryString;
  };

  return {
    getListAttributes: function (ref, id) {
      return $http.get('/api/' + ref + '/' + id + '/list');
    },
    readRecord: function (modelName, id) {
      return $http.get('/api/' + modelName + '/' + id);
    },
    getAll: function (modelName) {
      return $http.get('/api/' + modelName, {cache: true});
    },
    getPagedAndFilteredList: function (modelName, options) {
      return $http.get('/api/' + modelName + generateListQuery(options));
    },
    deleteRecord: function (model, id) {
      return $http.delete('/api/' + model + '/' + id);
    },
    updateRecord: function (modelName, id, dataToSave) {
      return $http.post('/api/' + modelName + '/' + id, dataToSave);
    },
    createRecord: function (modelName, dataToSave) {
      return $http.post('/api/' + modelName, dataToSave);
    }

  };
}]);

'use strict';

formsAngular.provider('urlService', ['$locationProvider', function ($locationProvider) {
  var config = {
    hashPrefix: '',
    html5Mode: false
  };

  return {
    setOptions: function (options) {
      angular.extend(config, options);
      $locationProvider.html5Mode(config.html5Mode);
      if (config.hashPrefix !== '') {
        $locationProvider.hashPrefix(config.hashPrefix);
      }
    },
    $get: function () {
      return {
        buildUrl: function (path) {
          var base = config.html5Mode ? '' : '#';
          base += config.hashPrefix;
          if (base[0]) { base += '/'; }
          return base + path;
        }
      };
    }
  };
}]);
formsAngular.service('utils', function () {

  this.getAddAllGroupOptions = function (scope, attrs, classes) {
    return getAddAllOptions(scope, attrs, "Group", classes);
  };

  this.getAddAllFieldOptions = function (scope, attrs, classes) {
    return getAddAllOptions(scope, attrs, "Field", classes);
  };

  this.getAddAllLabelOptions = function (scope, attrs, classes) {
    return getAddAllOptions(scope, attrs, "Label", classes);
  };

  function getAddAllOptions(scope, attrs, type, classes) {

    var addAllOptions = [],
      classList = [],
      tmp, i, options;

    type = "addAll" + type;

    if (typeof(classes) === 'string') {
      tmp = classes.split(' ');
      for (i = 0; i < tmp.length; i++) {
        classList.push(tmp[i]);
      }
    }

    function getAllOptions(obj) {

      for (var key in obj) {
        if (key === type) {
          addAllOptions.push(obj[key]);
        }

        if (key === "$parent") {
          getAllOptions(obj[key]);
        }
      }
    }

    getAllOptions(scope);

    if (attrs[type] !== undefined) {

      if (typeof(attrs[type]) === "object") {

        //support objects...

      } else if (typeof(attrs[type]) === "string") {

        tmp = attrs[type].split(' ');

        for (i = 0; i < tmp.length; i++) {
          if (tmp[i].indexOf('class=') === 0) {
            classList.push(tmp[i].substring(6, tmp[i].length));
          } else {
            addAllOptions.push(tmp[i]);
          }
        }
      } else {
        // return false; //error?
      }
    }

    if (classList.length > 0) {
      classes = ' class="' + classList.join(" ") + '" ';
    } else {
      classes = " ";
    }

    if (addAllOptions.length > 0) {
      options = addAllOptions.join(" ") + " ";
    } else {
      options = "";
    }

    return classes + options;

  }

});
angular.module('formsAngular').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('template/form-button-bs2.html',
    "<div class=\"btn-group pull-right\"><button id=saveButton class=\"btn btn-mini btn-primary form-btn\" ng-click=save() ng-disabled=isSaveDisabled()><i class=icon-ok></i> Save</button> <button id=cancelButton class=\"btn btn-mini btn-warning form-btn\" ng-click=cancel() ng-disabled=isCancelDisabled()><i class=icon-remove></i> Cancel</button></div><div class=\"btn-group pull-right\"><button id=newButton class=\"btn btn-mini btn-success form-btn\" ng-click=new() ng-disabled=isNewDisabled()><i class=icon-plus></i> New</button> <button id=deleteButton class=\"btn btn-mini btn-danger form-btn\" ng-click=delete() ng-disabled=isDeleteDisabled()><i class=icon-minus></i> Delete</button></div>"
  );


  $templateCache.put('template/form-button-bs3.html',
    "<div class=\"btn-group pull-right\"><button id=saveButton class=\"btn btn-primary form-btn btn-xs\" ng-click=save() ng-disabled=isSaveDisabled()><i class=\"glyphicon glyphicon-ok\"></i> Save</button> <button id=cancelButton class=\"btn btn-warning form-btn btn-xs\" ng-click=cancel() ng-disabled=isCancelDisabled()><i class=\"glyphicon glyphicon-remove\"></i> Cancel</button></div><div class=\"btn-group pull-right\"><button id=newButton class=\"btn btn-success form-btn btn-xs\" ng-click=new() ng-disabled=isNewDisabled()><i class=\"glyphicon glyphicon-plus\"></i> New</button> <button id=deleteButton class=\"btn btn-danger form-btn btn-xs\" ng-click=delete() ng-disabled=isDeleteDisabled()><i class=\"glyphicon glyphicon-minus\"></i> Delete</button></div>"
  );


  $templateCache.put('template/search-bs2.html',
    "<form class=\"navbar-search pull-right\"><div id=search-cg class=control-group ng-class=errorClass><input id=searchinput ng-model=searchTarget class=search-query placeholder=\"Ctrl+Slash to Search\" ng-keyup=handleKey($event)></div></form><div class=results-container ng-show=\"results.length >= 1\"><div class=search-results><div ng-repeat=\"result in results\"><span ng-class=resultClass($index) ng-click=selectResult($index)>{{result.resourceText}} {{result.text}}</span></div><div ng-show=\"moreCount > 0\">(plus more - continue typing to narrow down search...)</div></div></div>"
  );


  $templateCache.put('template/search-bs3.html',
    "<form class=\"pull-right navbar-form\"><div id=search-cg class=form-group ng-class=errorClass><input id=searchinput ng-model=searchTarget class=\"search-query form-control\" placeholder=\"Ctrl+Slash to Search\" ng-keyup=handleKey($event)></div></form><div class=results-container ng-show=\"results.length >= 1\"><div class=search-results><div ng-repeat=\"result in results\"><span ng-class=resultClass($index) ng-click=selectResult($index)>{{result.resourceText}} {{result.text}}</span></div><div ng-show=\"moreCount > 0\">(plus more - continue typing to narrow down search...)</div></div></div>"
  );

}]);
