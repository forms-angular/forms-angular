'use strict';

formsAngular.controller('BaseCtrl', ['$injector', '$scope', '$location', '$timeout', '$filter', '$data',
  '$modal', '$window', 'SubmissionsService', 'SchemasService', 'routingService',
  function ($injector, $scope, $location, $timeout, $filter, $data,
            $modal, $window, SubmissionsService, SchemasService, routingService) {
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
    $scope.pageSize = 60;
    $scope.pagesLoaded = 0;

    angular.extend($scope, routingService.parsePathFunc()($location.$$path));

    $scope.modelNameDisplay = sharedStuff.modelNameDisplay || $filter('titleCase')($scope.modelName);

//    Error handling code
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

    $scope.generateEditUrl = function (obj) {
      return routingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + obj._id + '/edit');
    };

    $scope.generateNewUrl = function () {
      return routingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + 'new');
    };

    $scope.walkTree = function (object, fieldname, element) {
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
      return {lastObject: workingRec, key: workingRec ? parts[higherLevels] : undefined};
    };

    $scope.getData = function (object, fieldname, element) {
      var leafData = $scope.walkTree(object, fieldname, element);
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

    $scope.setData = function (object, fieldname, element, value) {
      var leafData = $scope.walkTree(object, fieldname, element);

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
                            var workString = element.context.id;
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
                        setTimeout(updateInvalidClasses(leafVal, formInstructions.id, formInstructions.select2));
                        if (leafVal) {
                          if (formInstructions.array) {
                            var offset = parseInt(element.context.id.match('_[0-9].*$')[0].slice(1));
                            if (leafVal[offset].x) {
                              callback(leafVal[offset].x);
                            }
                          } else {
                            callback(leafVal);
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

// Support both of the syntaxes below
//            team : [ { type: Schema.Types.ObjectId , ref: 'f_nested_schema', form: {select2: {fngAjax: true}}} ],
//            team2:   { type:[Schema.Types.ObjectId], ref: 'f_nested_schema', form: {select2: {fngAjax: true}}},
            if (formInstructions.select2 || (mongooseOptions.form && mongooseOptions.form.select2)) {
              if (!formInstructions.select2) {formInstructions.select2 = mongooseOptions.form.select2;}
              if (formInstructions.select2 === true) {formInstructions.select2 = {}; }
              $scope.select2List.push(formInstructions.name);
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
                      }).error(handleError);
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
                formInstructions.select2.s2query = 'select2' + formInstructions.name.replace(/\./g, '_');
                $scope['select2' + formInstructions.select2.s2query] = {
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
                _.extend($scope[formInstructions.select2.s2query], formInstructions.select2);
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
        record = record.text || record;
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
        }).error(handleError);
    };

    $scope.scrollTheList = function () {
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
    $scope.deleteRecord = function (model, id) {
      SubmissionsService.deleteRecord(model, id)
        .success(function () {
          if (typeof $scope.dataEventFunctions.onAfterDelete === 'function') {
            $scope.dataEventFunctions.onAfterDelete(master);
          }
          routingService.redirectTo()('list', $scope, $location);
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
              routingService.redirectTo()('edit', $scope, $location, data._id);
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
      .error(handleError);


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

    $scope.newClick = function () {
      routingService.redirectTo()('new', $scope, $location);
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
    var convertToAngularModel = function (schema, anObject, prefixLength) {
      for (var i = 0; i < schema.length; i++) {
        var fieldname = schema[i].name.slice(prefixLength);
        if (schema[i].schema) {
          var extractField = $scope.getData(anObject, fieldname);
          if (extractField) {
            for (var j = 0; j < extractField.length; j++) {
              extractField[j] = convertToAngularModel(schema[i].schema, extractField[j], prefixLength + 1 + fieldname.length);
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
              if (schema[i].array) {
                for (var n=0; n < anObject[fieldname].length ; n++) {
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
    var convertToMongoModel = function (schema, anObject, prefixLength) {

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
            $scope.setData(anObject, fieldname, null, newVal);
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
      // Update the master and the record with the lookup values, master first
      if (!$scope.topLevelFormName || $scope[$scope.topLevelFormName].$pristine) {
        updateObject(schemaElement.name, master, function (value) {
          return convertForeignKeys(schemaElement, value, $scope[suffixCleanId(schemaElement, 'Options')], $scope[suffixCleanId(schemaElement, '_ids')]);
        });
        // Then copy the converted keys from master into record
        var newVal = $scope.getData(master, schemaElement.name);
        if (newVal) {
          $scope.setData($scope.record, schemaElement.name, undefined, newVal);
        }
      }
    };

    // Open a select2 control from the appended search button.  OK to use $ here as select2 itself is dependent on jQuery.
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