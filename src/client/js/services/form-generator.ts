/// <reference path="../fng-types" />

module fng.services {
  /**
   *
   * Manipulate record items for generating a form
   *
   * All methods should be state-less
   *
   */

  /*@ngInject*/
  import IFormController = angular.IFormController;
  import IFormInstruction = fng.IFormInstruction;


  export function formGenerator($location, $timeout, $filter, SubmissionsService, routingService, recordHandler) : IFormGenerator {

    function handleSchema(description, source, destForm, destList, prefix, doRecursion, $scope, ctrlState) {

      function handletabInfo(tabName, thisInst) {
        var tabTitle = angular.copy(tabName);
        var tab = _.find($scope.tabs, function (atab:any) {
          return atab.title === tabTitle;
        });
        if (!tab) {
          if ($scope.tabs.length === 0) {
            if ($scope.formSchema.length > 0) {
              $scope.tabs.push({title: 'Main', content: [], active: ($scope.tab === 'Main' || !$scope.tab)});
              tab = $scope.tabs[0];
              for (var i = 0; i < $scope.formSchema.length; i++) {
                tab.content.push($scope.formSchema[i]);
              }
            }
          }
          tab = $scope.tabs[$scope.tabs.push({
            title: tabTitle,
            containerType: 'tab',
            content: [],
            active: (tabTitle === $scope.tab)
          }) - 1];
        }
        tab.content.push(thisInst);
      }

      for (var field in source) {
        if (field === '_id') {
          if (destList && source['_id'].options && source['_id'].options.list) {
            handleListInfo(destList, source['_id'].options.list, field);
          }
        } else if (source.hasOwnProperty(field)) {
          var mongooseType = source[field],
            mongooseOptions: any = mongooseType.options || {};
          var formData: any = mongooseOptions.form || {};
          if (mongooseType.schema && !formData.hidden) {
            if (doRecursion && destForm) {
              var schemaSchema = [];
              handleSchema('Nested ' + field, mongooseType.schema, schemaSchema, null, field + '.', true, $scope, ctrlState);
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
            if (destForm && !formData.hidden) {
              var formInstructions = basicInstructions(field, formData, prefix);
              if (handleConditionals(formInstructions.showIf, formInstructions.name, $scope) && field !== 'options') {
                var formInst = handleFieldType(formInstructions, mongooseType, mongooseOptions, $scope, ctrlState);
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
            if (destList && mongooseOptions.list) {
              handleListInfo(destList, mongooseOptions.list, field);
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
    }

    function handleFieldType(formInstructions: IFormInstruction, mongooseType, mongooseOptions, $scope, ctrlState) {

      function performLookupSelect(){
        formInstructions.options = recordHandler.suffixCleanId(formInstructions, 'Options');
        formInstructions.ids = recordHandler.suffixCleanId(formInstructions, '_ids');
        if (!formInstructions.hidden) {
          recordHandler.setUpSelectOptions(mongooseOptions.ref, formInstructions, $scope, ctrlState, handleSchema);
        }
      }

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
            console.log('support for fng-select2 has been removed in 0.8.3 - please convert to fng-ui-select');
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
            if (formInstructions.select2 || (mongooseOptions.form && mongooseOptions.form.select2)) {
              console.log('support for fng-select2 has been removed in 0.8.3 - please convert to fng-ui-select');
            } else if (!formInstructions.directive || (!formInstructions.noLookup && (!formInstructions[$filter('camelCase')(formInstructions.directive)] || !formInstructions[$filter('camelCase')(formInstructions.directive)].fngAjax))) {
              performLookupSelect();
            }
        }
      } else if (mongooseType.instance === 'Date') {
        if (!formInstructions.type) {
          if (formInstructions.readonly) {
            formInstructions.type = 'text';
          } else if (formInstructions.directive) {
            formInstructions.type = 'text';     // Think they all use date
          } else {
            try {
              formInstructions.add = formInstructions.add || '';
              let testDatePickerInstalled = angular.module('ui.date').requires;
              formInstructions.type = 'text';
              formInstructions.add += ' ui-date ui-date-format ';
              // formInstructions.add += ' ui-date ui-date-format datepicker-popup-fix ';
            } catch(e) {
              formInstructions.type = 'date';
              formInstructions.add += ' fng-naked-date="x" ';
            }
          }
        }
      } else if (mongooseType.instance.toLowerCase() === 'boolean') {
        formInstructions.type = 'checkbox';
      } else if (mongooseType.instance === 'Number') {
        formInstructions.type = 'number';
        if (mongooseOptions.min !== undefined) {
          formInstructions.add = 'min="' + mongooseOptions.min + '" ' + (formInstructions.add || '');
        }
        if (mongooseOptions.max !== undefined) {
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
        formInstructions['readonly'] = true;
      }
      return formInstructions;
    }

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

    // TODO: Do this in form
    var basicInstructions = function (field, formData, prefix) {
      formData.name = prefix + field;
//        formData.id = formData.id || 'f_' + prefix + field.replace(/\./g, '_');
//        formData.label = (formData.hasOwnProperty('label') && formData.label) == null ? '' : (formData.label || $filter('titleCase')(field));
      return formData;
    };

    var handleListInfo = function (destList, listOptions, field) {
      if (typeof listOptions === 'object') {
        listOptions.name = field;
        destList.push(listOptions);
      } else {
        destList.push({name: field});
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
              result = recordHandler.getListData(data, side.slice(1));
              break;
            case 2 :
              // this is a sub schema element, and the appropriate array element has been passed
              result = recordHandler.getListData(data, sideParts[1]);
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
        if (dependency === 0 && !evaluateConditional(condInst, undefined)) {
          display = false;
        }
      }
      return display;
    };


    return {
      // utility for apps that use forms-angular
      generateEditUrl: function generateEditUrl(obj, $scope:fng.IFormScope):string {
        return routingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + obj._id + '/edit');
      },
      generateNewUrl: function generateNewUrl($scope):string {
        return routingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + 'new');
      },
      handleFieldType: handleFieldType,
      handleSchema: handleSchema,
      // Conventional view is that this should go in a directive.  I reckon it is quicker here.
      updateDataDependentDisplay: function updateDataDependentDisplay(curValue, oldValue, force, $scope) {
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
      },

      add: function add(fieldName, $event, $scope) {
        var arrayField = getArrayFieldToExtend(fieldName, $scope);
        arrayField.push({});
        $scope.setFormDirty($event);
      },

      unshift: function unshift(fieldName, $event, $scope) {
        var arrayField = getArrayFieldToExtend(fieldName, $scope);
        arrayField.unshift({});
        $scope.setFormDirty($event);
      },

      remove: function remove(fieldName, value, $event, $scope) {
        // Remove an element from an array
        var fieldParts = fieldName.split('.');
        var arrayField = $scope.record;
        for (var i = 0, l = fieldParts.length; i < l; i++) {
          arrayField = arrayField[fieldParts[i]];
        }
        arrayField.splice(value, 1);
        $scope.setFormDirty($event);
      },

      hasError: function hasError(formName, name, index, $scope) {
        let result = false;
        if ($scope) {
          let form = $scope[$scope.topLevelFormName];
          if (formName !== 'null') {
            form = form[formName.replace('$index', index)];
          }
          // Cannot assume that directives will use the same methods
          if (form) {
            let field = form[name];
            if (field && field.$invalid) {
              if (field.$dirty) {
                result = true;
              } else {
                // with pristine fields, they have to have some sort of invalidity other than ng-invalid-required
                angular.forEach(field.$validators, function (obj, key) {
                  if (<any>key !== 'required' && field.$error[key]) {
                    result = true;
                  }
                });
              }
            }
          }
        } else {
          console.log('hasError called with no scope! ', formName, name, index);
        }
        return result;
      },

      decorateScope: function decorateScope($scope: fng.IFormScope, formGeneratorInstance, recordHandlerInstance: fng.IRecordHandler, sharedData) {
        $scope.record = sharedData.record;
        $scope.phase = 'init';
        $scope.disableFunctions = sharedData.disableFunctions;
        $scope.dataEventFunctions = sharedData.dataEventFunctions;
        $scope.topLevelFormName = undefined;
        $scope.formSchema = [];
        $scope.tabs = [];
        $scope.listSchema = [];
        $scope.recordList = [];
        $scope.dataDependencies = {};
        $scope.conversions = {};
        $scope.pageSize = 60;
        $scope.pagesLoaded = 0;

        sharedData.baseScope = $scope;

        $scope.generateEditUrl = function (obj) {
          return formGeneratorInstance.generateEditUrl(obj, $scope);
        };

        $scope.generateNewUrl = function () {
          return formGeneratorInstance.generateNewUrl($scope);
        };

        $scope.scrollTheList = function () {
          return recordHandlerInstance.scrollTheList($scope);
        };

        $scope.getListData = function (record, fieldName) {
          return recordHandlerInstance.getListData( $scope, record, fieldName, $scope.listSchema);
        };

        $scope.setPristine = function (clearErrors) {
          if (clearErrors) {
            $scope.dismissError();
          }
          if ($scope[$scope.topLevelFormName]) {
            $scope[$scope.topLevelFormName].$setPristine();
          }
        };

        $scope.skipCols = function (index) {
          return index > 0 ? 'col-md-offset-3' : '';
        };

        $scope.setFormDirty = function (event) {
          if (event) {
            var form:any = angular.element(event.target).inheritedData('$formController');
            form.$setDirty();
          } else {
            console.log('setFormDirty called without an event (fine in a unit test)');
          }
        };

        $scope.add = function (fieldName, $event) {
          return formGeneratorInstance.add(fieldName, $event, $scope);
        };

        $scope.hasError = function (form, name, index) {
          return formGeneratorInstance.hasError(form, name, index, $scope);
        };

        $scope.unshift = function (fieldName, $event) {
          return formGeneratorInstance.unshift(fieldName, $event, $scope);
        };

        $scope.remove = function (fieldName, value, $event) {
          return formGeneratorInstance.remove(fieldName, value, $event, $scope);
        };

        $scope.baseSchema = function () {
          return ($scope.tabs.length ? $scope.tabs : $scope.formSchema);
        };

        $scope.tabDeselect = function($event, $selectedIndex) {
          if (!$scope.newRecord) {
            $location.path($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + $scope.record._id + '/edit/' + $event.target.text);
          }
        }
      }
    };
  }

  formGenerator.$inject = ["$location", "$timeout", "$filter", "SubmissionsService", "routingService", "recordHandler"];

  }
