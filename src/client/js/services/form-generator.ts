/// <reference path="../../index.d.ts" />

module fng.services {
  /**
   *
   * Manipulate record items for generating a form
   *
   * All methods should be state-less
   *
   */

  /*@ngInject*/
  import IFormInstruction = fng.IFormInstruction;

  export function FormGeneratorService($filter, RoutingService: fng.IRoutingService, RecordHandlerService: fng.IRecordHandlerService, SecurityService: fng.ISecurityService) : IFormGeneratorService {

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

      if (typeof $scope.onSchemaFetch === "function") {
        $scope.onSchemaFetch(description, source);
      }
      for (var field in source) {
        if (source.hasOwnProperty(field)) {
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
      if (typeof $scope.onSchemaProcessed === "function") {
        $scope.onSchemaProcessed(description, description.slice(0,5) === 'Main ' ? $scope.baseSchema() : destForm);
      }

      if (destList && destList.length === 0) {
        handleEmptyList(description, destList, destForm, source);
      }
    }

    function handleFieldType(formInstructions: IFormInstruction, mongooseType, mongooseOptions, $scope, ctrlState) {

      function performLookupSelect(){
        formInstructions.options = RecordHandlerService.suffixCleanId(formInstructions, 'Options');
        formInstructions.ids = RecordHandlerService.suffixCleanId(formInstructions, '_ids');
        if (!formInstructions.hidden) {
          if (mongooseOptions.ref) {
            RecordHandlerService.setUpLookupOptions(mongooseOptions.ref, formInstructions, $scope, ctrlState, handleSchema);
          } else if (mongooseOptions.lookupListRef) {
            RecordHandlerService.setUpLookupListOptions(mongooseOptions.lookupListRef, formInstructions, $scope, ctrlState);
            formInstructions.lookupListRef = mongooseOptions.lookupListRef;
          } else if (mongooseOptions.internalRef) {
            RecordHandlerService.handleInternalLookup($scope, formInstructions, mongooseOptions.internalRef);
            formInstructions.internalRef = mongooseOptions.internalRef;
          } else if (mongooseOptions.customLookupOptions) {
              // nothing to do - call setUpCustomLookupOptions() when ready to provide id and option arrays
          } else {
            throw new Error(`No supported select lookup type found in ${formInstructions.name}`);
          }
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
      if (mongooseType.instance === 'String' || (mongooseType.instance === 'ObjectId' && formInstructions.asText)) {
        if (mongooseOptions.enum) {
          formInstructions.type = formInstructions.type || 'select';
          if (formInstructions.select2) {
            console.log('support for fng-select2 has been removed in 0.8.3 - please convert to fng-ui-select');
          } else {
            formInstructions.options = RecordHandlerService.suffixCleanId(formInstructions, 'Options');
            if (mongooseOptions.form?.enumLabels) {
              formInstructions.ids = RecordHandlerService.suffixCleanId(formInstructions, '_ids');
              $scope[formInstructions.ids] = mongooseOptions.enum;
              $scope[formInstructions.options] = mongooseOptions.form.enumLabels;
            } else {
              $scope[formInstructions.options] = mongooseOptions.enum;
            }
          }
        } else {
          if (!formInstructions.type) {
            formInstructions.type = (formInstructions.name.toLowerCase().indexOf('password') !== -1) ? 'password' : 'text';
          }
          if (mongooseOptions.match) {
            formInstructions.add = 'pattern="' + mongooseOptions.match + '" ' + (formInstructions.add || '');
          }
        }
      } else if (mongooseType.instance === 'ObjectId') {
        formInstructions.ref = mongooseOptions.ref;
        if (formInstructions.link) {
          if (formInstructions.link.linkOnly) {
            formInstructions.type = 'link';
            formInstructions.linktext = formInstructions.link.text;
          } else if (formInstructions.link.label) {
            formInstructions.linklabel = true;
          } else {
            console.log('Unsupported link setup')
          }
          formInstructions.form = formInstructions.link.form;
          formInstructions.linktab = formInstructions.link.linktab;
          delete formInstructions.link;
        }
        if (formInstructions.type !== 'link') {
          formInstructions.type = 'select';
          if (formInstructions.select2 || (mongooseOptions.form && mongooseOptions.form.select2)) {
            console.log('support for fng-select2 has been removed in 0.8.3 - please convert to fng-ui-select');
          } else if ((!formInstructions.directive || (!formInstructions.noLookup && (!formInstructions[$filter('camelCase')(formInstructions.directive)] || !formInstructions[$filter('camelCase')(formInstructions.directive)].fngAjax)))) {
            performLookupSelect();
          }
        }
      } else if (mongooseType.instance === 'Date') {
        if (!formInstructions.type) {
          formInstructions.intType = 'date';
          if (formInstructions.readonly) {
            formInstructions.type = 'text';
          } else if (formInstructions.directive) {
            formInstructions.type = 'text';
          } else {
            try {
              formInstructions.add = formInstructions.add || '';
              // Check whether DatePicker is installed
              angular.module('ui.date').requires;
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
        formInstructions.type = formInstructions.type || 'checkbox';
      } else if (mongooseType.instance === 'Number') {
        formInstructions.type = formInstructions.type || 'number';
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
        // slightly more verbose here than would seem necessary, to help track down a problem
        let msg = 'Field ' + formInstructions.name + ' has unsupported type "' + mongooseType.instance + '"';
        console.log(msg);
        let addit = ' (typeof = ' + typeof mongooseType.instance + ')';
        console.log(addit);
        throw new Error(msg + addit);
      }
      if (mongooseOptions.required) {
        formInstructions.required = true;
      }
      if (mongooseOptions.readonly) {
        formInstructions['readonly'] = true;
      }
      if (mongooseType.defaultValue !== undefined) {
        formInstructions.defaultValue = mongooseType.defaultValue;
      } else if (mongooseType.options && mongooseType.options.default !== undefined) {
        console.log('No support for default with no value, yet')
      }
      return formInstructions;
    }

    function getArrayFieldToExtend(fieldName: string, $scope: IFormScope, modelOverride?: any) {
      var fieldParts = fieldName.split('.');
      var arrayField = modelOverride || $scope.record;
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
              result = RecordHandlerService.getListData(data, side.slice(1));
              break;
            case 2 :
              // this is a sub schema element, and the appropriate array element has been passed
              result = RecordHandlerService.getListData(data, sideParts[1]);
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
        return RoutingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + obj._id + '/edit');
      },
      generateViewUrl: function generateViewUrl(obj, $scope:fng.IFormScope):string {
        return RoutingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + obj._id + '/view');
      },
      generateNewUrl: function generateNewUrl($scope):string {
        return RoutingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + 'new');
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

      add: function add(fieldName: string, $event, $scope: IFormScope, modelOverride?: any) {
        // for buttons, the click event won't fire if the disabled attribute exists, but the same is not true of
        // icons, so we need to check this for simple array item addition
        if ($event?.target?.hasAttribute && $event.target.hasAttribute("disabled")) {
          return $event.preventDefault();
        }
        // check that target element is visible.  May not be reliable - see https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
        if ($event.target.offsetParent) {
          var arrayField = getArrayFieldToExtend(fieldName, $scope, modelOverride);

          const schemaElement = $scope.formSchema.find(f => f.name === fieldName);  // In case someone is using the formSchema directly
          const subSchema = schemaElement ? schemaElement.schema : null;
          let obj = subSchema ? $scope.setDefaults(subSchema, fieldName + '.') : {};
          if (typeof $scope.dataEventFunctions?.onInitialiseNewSubDoc === "function") {
            $scope.dataEventFunctions.onInitialiseNewSubDoc(fieldName, subSchema, obj);
          }          
          arrayField.push(obj);
          $scope.setFormDirty($event);
        }
      },

      unshift: function unshift(fieldName: string, $event, $scope: IFormScope, modelOverride?: any) {
        var arrayField = getArrayFieldToExtend(fieldName, $scope, modelOverride);
        arrayField.unshift({});
        $scope.setFormDirty($event);
      },

      remove: function remove(fieldName: string, value: number, $event, $scope: IFormScope, modelOverride?: any) {
        // for buttons, the click event won't fire if the disabled attribute exists, but the same is not true of
        // icons, so we need to check this for simple array item removal
        if ($event?.target?.hasAttribute && $event.target.hasAttribute("disabled")) {
          return $event.preventDefault();
        }
        // Remove an element from an array
        var arrayField = getArrayFieldToExtend(fieldName, $scope, modelOverride);
        var err;
        if (typeof $scope.dataEventFunctions.onDeleteSubDoc === "function") {
          var schemaElement = $scope.formSchema.find(function (f) {
            return f.name === fieldName;
          });
          var subSchema = schemaElement ? schemaElement.schema : null;
          err = $scope.dataEventFunctions.onDeleteSubDoc(
            fieldName,
            subSchema,
            arrayField,
            value
          );
        }
        if (err) {
          $scope.showError(err);
        } else {
          arrayField.splice(value, 1);
          $scope.setFormDirty($event);
        }
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
            if (field && field.$invalid && !field.$$attr.readonly) {
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

      decorateScope: function decorateScope($scope: fng.IFormScope, formGeneratorInstance: fng.IFormGeneratorService, recordHandlerInstance: fng.IRecordHandlerService, sharedData, pseudoUrl?: string) {
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
        $scope.internalLookups = [];
        $scope.listLookups = [];
        $scope.conversions = {};
        $scope.pageSize = 60;
        $scope.pagesLoaded = 0;

        sharedData.baseScope = $scope;

        SecurityService.decorateSecurableScope($scope, { pseudoUrl });

        $scope.generateEditUrl = function (obj) {
          return formGeneratorInstance.generateEditUrl(obj, $scope);
        };

        $scope.generateViewUrl = function (obj) {
          return formGeneratorInstance.generateViewUrl(obj, $scope);
        };

        $scope.generateNewUrl = function () {
          return formGeneratorInstance.generateNewUrl($scope);
        };

        $scope.scrollTheList = function () {
          // wait until we have the list schema.  until we get a non-empty listSchema (which might never
          // happen if we don't have permission to GET it), then there's no point requesting the data
          if ($scope.listSchema?.length > 0) {
            return recordHandlerInstance.scrollTheList($scope);
          } else {
            const unwatch = $scope.$watchCollection("listSchema", (newValue: fng.IFormInstruction[]) => {
              if (newValue?.length > 0) {
                unwatch();
                return recordHandlerInstance.scrollTheList($scope);
              }
            })
          }
        };

        $scope.getListData = function (record, fieldName) {
          return recordHandlerInstance.getListData(record, fieldName, $scope.listSchema, $scope);
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

        $scope.add = function (fieldName: string, $event, modelOverride?: any) {
          return formGeneratorInstance.add(fieldName, $event, $scope, modelOverride);
        };

        // to enable programatic selection of tabs, we need to use the tabset controller's select() method, but the tabset
        // has its own scope that will be a child of $scope.  using $$childHead and $$nextSibling to locate it is not
        // recommended, but I could find no other way to achieve programatic tab selection.  I think it might have
        // been much easier if we were using uib-tabset, but we're not...
        function getTabSet(): any {
          let childScope = ($scope as any).$$childHead;
          while (childScope) {
            if (childScope.tabset) {
              return childScope.tabset;
            }
            childScope = childScope.$$nextSibling;
          }
        }

        $scope.hideTab = function (event, tabTitle: string, hiddenTabArrayProp: string) {
          const array = recordHandlerInstance.getData($scope, hiddenTabArrayProp) as string[];
          if (array && Array.isArray(array) && !array.includes(tabTitle)) {
            const thisTabIsSelected = $scope.tabs[$scope.activeTabNo].title === tabTitle;
            array.push(tabTitle);
            array.sort();
            // we can't use setFormDirty here, because the controller of event.target will not yield the form we need.
            // let's assume it's called baseForm.  if it isn't, the fact we don't call $setDirty() is no big deal.
            const form = ($scope as any).baseForm;
            if (form) {
              form.$setDirty();
            }            
            // if the tab that has just been hidden was the active one, find the first tab that isn't
            // hidden to switch to.  (it can sometimes find another tab itself that can be safely switched to,
            // but that sometimes fails, with weird results.)
            if (thisTabIsSelected) {
              const tabset = getTabSet();
              if (tabset) {
                tabset.select($scope.tabs.findIndex((t) => !array.includes(t.title)));
              }
            }            
          }
        };

        $scope.addTab = function (event, tabTitle: string, hiddenTabArrayProp: string) {
          const array = recordHandlerInstance.getData($scope, hiddenTabArrayProp) as string[];
          if (array && Array.isArray(array)) {
            let idx = array.findIndex((t) => t === tabTitle);
            if (idx === -1) {
              return; // shouldn't happen
            }
            array.splice(idx, 1);
            // we can't use setFormDirty here, because the controller of event.target will not yield the form we need.
            // let's assume it's called baseForm.  if it isn't, the fact we don't call $setDirty() is no big deal.
            const form = ($scope as any).baseForm;
            if (form) {
              form.$setDirty();
            }
            // now select the tab that we've just added
            const tabset = getTabSet();
            if (tabset) {
              tabset.select($scope.tabs.findIndex((t) => t.title === tabTitle));
            }
          }
        };
        
        $scope.hasError = function (form, name, index) {
          return formGeneratorInstance.hasError(form, name, index, $scope);
        };

        $scope.unshift = function (fieldName: string, $event, modelOverride?: any) {
          return formGeneratorInstance.unshift(fieldName, $event, $scope, modelOverride);
        };

        $scope.remove = function (fieldName: string, value, $event, modelOverride?: any) {
          return formGeneratorInstance.remove(fieldName, value, $event, $scope, modelOverride);
        };

        $scope.baseSchema = function () {
          return ($scope.tabs.length ? $scope.tabs : $scope.formSchema);
        };
// TODO Figure out tab history updates (check for other tab-history-todos)
        // $scope.tabDeselect = function($event, $selectedIndex) {
        //   if (!$scope.newRecord) {
        //     $location.path(routingService.buildUrl($scope.modelName + '/' + ($scope.formName ? $scope.formName + '/' : '') + $scope.record._id + '/edit/' + $event.target.text));
        //   }
        // }
      }
    };
  }

  FormGeneratorService.$inject = ["$filter", "RoutingService", "RecordHandlerService", "SecurityService"];

  }
