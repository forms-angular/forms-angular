/// <reference path="../../index.d.ts" />

module fng.services {
  /**
   * Operations on a whole record
   *
   * All methods should be state-less
   *
   */

  /*@ngInject*/
  export function recordHandler($http, $location, $window, $filter, $timeout, routingService, SubmissionsService, SchemasService) : fng.IRecordHandler {

    // TODO: Put this in a service
    const makeMongoId = (rnd = r16 => Math.floor(r16).toString(16)) => rnd(Date.now()/1000) + ' '.repeat(16).replace(/./g, () => rnd(Math.random()*16));

    var suffixCleanId = function suffixCleanId(inst, suffix) {
      return (inst.id || 'f_' + inst.name).replace(/\./g, '_') + suffix;
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
        if (!workingRec) {
          throw new Error(`walkTree failed: Object = ${object}, fieldname = ${fieldname}, i = ${i}`);
        }
        if (angular.isArray(workingRec)) {
          workingRec = _.map(workingRec, function (obj) {
            return obj[parts[i]];
          });
        } else {
          workingRec = workingRec[parts[i]];
        }
        if (angular.isArray(workingRec) && typeof element !== 'undefined') {
          if (element.scope && typeof element.scope === 'function') {
            // If we come across an array we need to find the correct position, if we have an element
            workingRec = workingRec[element.scope().$index];
          } else if (typeof element === 'number') {
            workingRec = workingRec[element];
          } else {
            throw new Error('Unsupported element type in walkTree ' + fieldname)
          }
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

    var setData = function setData(object, fieldname, element, value) {
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

    var getData = function (object, fieldname, element?:any) {
      var leafData = walkTree(object, fieldname, element);
      var retVal;
      if (leafData.lastObject && leafData.key) {
        if (angular.isArray(leafData.lastObject)) {
          retVal = _.map(leafData.lastObject, function (obj) {
            return obj[leafData.key];
          });
        } else {
          retVal = leafData.lastObject[leafData.key];
        }
      }
      return retVal;
    };

    var updateRecordWithLookupValues = function (schemaElement, $scope, ctrlState) {
      // Update the master and the record with the lookup values, master first
      if (!$scope.topLevelFormName || $scope[$scope.topLevelFormName].$pristine) {
        updateObject(schemaElement.name, ctrlState.master, function (value) {
          return convertForeignKeys(schemaElement, value, $scope[suffixCleanId(schemaElement, 'Options')], $scope[suffixCleanId(schemaElement, '_ids')]);
        });
        // Then copy the converted keys from master into record
        var newVal = getData(ctrlState.master, schemaElement.name);
        if (newVal) {
          setData($scope.record, schemaElement.name, undefined, newVal);
        }
      }
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

    var getListData = function getListData($scope, record, fieldName, listSchema=null) {
      var retVal = record;
      var nests = fieldName.split('.');
      for (var i = 0; i < nests.length; i++) {
        if (retVal !== undefined && retVal !== null && nests && nests[i]) {
          retVal = retVal[nests[i]];
        }
      }
      if (retVal === undefined) {
        retVal = '';
      }

      if (retVal && listSchema) {
        // Convert list fields as per instructions in params (ideally should be the same as what is found in data_form getListFields
        var schemaElm  = _.find(listSchema, elm => (elm['name'] === fieldName));
        if (schemaElm) {
          switch (schemaElm['params']) {
            case undefined :
              break;
            case 'timestamp' :
              var timestamp = retVal.toString().substring(0,8);
              var date = new Date( parseInt( timestamp, 16 ) * 1000 );
              retVal = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
              break;
            default:
              retVal = $scope.dataEventFunctions[schemaElm['params']](record);
          }
        }
      }
      return retVal;
    };

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

    // Set up the lookup lists (value and id) on the scope for an internal lookup.  Called by convertToAngularModel and $watch
    function setUpInternalLookupLists($scope, optionsList, idsList, newVal, valueAttrib) {
      $scope[optionsList].length = 0;
      $scope[idsList].length = 0;
      if (!!newVal && (newVal.length > 0)) {
        newVal.forEach(a => {
          let value = a[valueAttrib];
          if (value && value.length > 0) {
            $scope[optionsList].push(value);
            if (!a._id) {
              a._id = makeMongoId();
            }
            $scope[idsList].push(a._id);
          }
        });
      }
    }

    var simpleArrayNeedsX = function (aSchema) {
      var result = false;

      if (aSchema.needsX) {
        result = true;
      } else if (!aSchema.directive) {
        if (aSchema.type === 'text') {
          result = true;
        } else if (aSchema.type === 'select' && !aSchema.ids) {
          result = true;
        }
      }
      return result;
    };

    /* Look up a conversion set up by a plugin */
    function getConversionObject(scope: any, entryName: string, schemaName? : string) : any {
      let conversions = scope.conversions;
      if (schemaName) {
        conversions = conversions[schemaName] || {};
      }
      return conversions[entryName];
    }


    // Convert mongodb json to what we use in the browser, for example {_id:'xxx', array:['item 1'], lookup:'012abcde'} to {_id:'xxx', array:[{x:'item 1'}], lookup:'List description for 012abcde'}
    // This will currently only work for a single level of nesting (conversionObject will not go down further without amendment, and offset needs to be an array, at least)
    var convertToAngularModel = function (schema, anObject, prefixLength, $scope, schemaName? : string, master?, offset?: number) {
      master = master || anObject;
      for (var i = 0; i < schema.length; i++) {
        var schemaEntry = schema[i];
        var fieldName = schemaEntry.name.slice(prefixLength);
        var fieldValue = getData(anObject, fieldName);
        if (schemaEntry.schema) {
          if (fieldValue) {
            for (var j = 0; j < fieldValue.length; j++) {
              fieldValue[j] = convertToAngularModel(schemaEntry.schema, fieldValue[j], prefixLength + 1 + fieldName.length, $scope, fieldName, master, j);
            }
          }
        } else {
          if (schemaEntry.ref && schemaEntry.ref.type === 'internal') {
            setUpInternalLookupLists($scope, schemaEntry.options, schemaEntry.ids, master[schemaEntry.ref.property], schemaEntry.ref.value);
          }
          // Convert {array:['item 1']} to {array:[{x:'item 1'}]}
          var thisField = getListData($scope, anObject, fieldName);
          if (schemaEntry.array && simpleArrayNeedsX(schemaEntry) && thisField) {
            for (var k = 0; k < thisField.length; k++) {
              thisField[k] = {x: thisField[k]};
            }
          }

          // Convert {lookup:'012abcde'} to {lookup:'List description for 012abcde'}
          var idList = $scope[suffixCleanId(schemaEntry, '_ids')];
          let thisConversion: any;
          if (fieldValue && idList && idList.length > 0) {
            if (fieldName.indexOf('.') !== -1) {
              throw new Error('Trying to directly assign to a nested field 332');
            }  // Not sure that this can happen, but put in a runtime test
            anObject[fieldName] = convertForeignKeys(schemaEntry, fieldValue, $scope[suffixCleanId(schemaEntry, 'Options')], idList);
          } else if (schemaEntry.select2) {
            // Do nothing with these - handled elsewhere (and deprecated)
            console.log('fng-select2 is deprecated - use fng-ui-select instead');
            void(schemaEntry.select2);
          } else if (fieldValue && (thisConversion = getConversionObject($scope, fieldName, schemaName)) &&
            thisConversion.fngajax &&
            !thisConversion.noconvert
          ) {
            thisConversion.fngajax(fieldValue, schemaEntry, function (updateEntry, value) {
              // Update the master and (preserving pristine if appropriate) the record
              setData(master, updateEntry.name, offset, value);
              preservePristine( angular.element('#' + updateEntry.id), function () {
                setData($scope.record, updateEntry.name, offset, value);
              });
            });
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
        var needsX = !schemaElement.directive || simpleArrayNeedsX(schemaElement);
        for (var j = 0; j < input.length; j++) {
          var val = input[j];
          if (val && val.x) {
            val = val.x;
          }
          var lookup = convertIdToListValue(val, ids, values, schemaElement.name);
          if (needsX) {
            lookup = {x: lookup};
          }
          returnArray.push(lookup);
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

    var preservePristine = function preservePristine(element, fn) {
      // stop the form being set to dirty when a fn is called
      // Use when the record (and master) need to be updated by lookup values displayed asynchronously
      var modelController = element.inheritedData('$ngModelController');
      var isClean = (modelController && modelController.$pristine);
      if (isClean) {
        // fake it to dirty here and reset after call to fn
        modelController.$pristine = false;
      }
      fn();
      if (isClean) {
        modelController.$pristine = true;
      }
    };

    var convertIdToListValue = function convertIdToListValue(id, idsArray, valuesArray, fname) {
      if (typeof(id) === 'object') {
        id = id.id;
      }
      var index = idsArray.indexOf(id);
      if (index === -1) {
        throw new Error('convertIdToListValue: Invalid data - id ' + id + ' not found in ' + idsArray + ' processing ' + fname);
      }
      return valuesArray[index];
    };

    var processServerData = function processServerData(recordFromServer, $scope, ctrlState) {
        ctrlState.master = convertToAngularModel($scope.formSchema, recordFromServer, 0, $scope);
        $scope.phase = 'ready';
        $scope.cancel();
    };

    function fillFormFromBackendCustomSchema(schema, $scope:fng.IFormScope, formGeneratorInstance, recordHandlerInstance, ctrlState) {
      var listOnly = (!$scope.id && !$scope.newRecord);
      // passing null for formSchema parameter prevents all the work being done when we are just after the list data,
      // but should be removed when/if formschemas are cached
      formGeneratorInstance.handleSchema('Main ' + $scope.modelName, schema, listOnly ? null : $scope.formSchema, $scope.listSchema, '', true, $scope, ctrlState);

      if (listOnly) {
        ctrlState.allowLocationChange = true;
      } else {
        var force = true;
        if (!$scope.newRecord) {
          $scope.dropConversionWatcher = $scope.$watchCollection('conversions', function (newValue, oldValue) {
            if (newValue !== oldValue && $scope.originalData) {
              processServerData($scope.originalData, $scope, ctrlState);
            }
          });
        }
        $scope.$watch('record', function (newValue, oldValue) {
          if (newValue !== oldValue) {
            if (Object.keys(oldValue).length > 0 && $scope.dropConversionWatcher) {
              $scope.dropConversionWatcher();  // Don't want to convert changed data
              $scope.dropConversionWatcher = null;
            }
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
                recordHandlerInstance.readRecord($scope, ctrlState);
              }
            });
          } else {
            recordHandlerInstance.readRecord($scope, ctrlState);
          }
        } else {
          // New record
          ctrlState.master = {};
          let passedRecord = $scope.initialiseNewRecord || $location.$$search.r;
          if (passedRecord) {
            try {
              ctrlState.master = JSON.parse(passedRecord);

              // Although this is a new record we are making it dirty from the url so we need to $setDirty
              $scope.$on('fngCancel', () => {
                setTimeout(() => {
                  if ($scope[$scope.topLevelFormName]) {
                    $scope[$scope.topLevelFormName].$setDirty();
                  }
                }, 2);  // Has to fire after the setPristime timeout.
              });

            } catch (e) {
              console.log('Error parsing specified record : ' + e.message);
            }
          }
          if (typeof $scope.dataEventFunctions.onInitialiseNewRecord === 'function') {
            $scope.dataEventFunctions.onInitialiseNewRecord(ctrlState.master);
          }
          $scope.phase = 'ready';
          $scope.cancel();
        }
      }
    }

    function handleError($scope: fng.IFormScope) {
      return function(response:any) : void {
        if ([200, 400].indexOf(response.status) !== -1) {
          var errorMessage = '';
          for (var errorField in response.data.errors) {
            if (response.data.errors.hasOwnProperty(errorField)) {
              errorMessage += '<li><b>' + $filter('titleCase')(errorField) + ': </b> ';
              switch (response.data.errors[errorField].type) {
                case 'enum' :
                  errorMessage += 'You need to select from the list of values';
                  break;
                default:
                  errorMessage += response.data.errors[errorField].message;
                  break;
              }
              errorMessage += '</li>';
            }
          }
          if (errorMessage.length > 0) {
            errorMessage = response.data.message + '<br /><ul>' + errorMessage + '</ul>';
          } else {
            errorMessage = response.data.message || 'Error!  Sorry - No further details available.';
          }
          $scope.showError(errorMessage);
        } else {
          $scope.showError(response.status + ' ' + JSON.stringify(response.data));
        }
      }
    }

    function handleIncomingData(data, $scope, ctrlState) {
      ctrlState.allowLocationChange = false;
      $scope.phase = 'reading';
      if (typeof $scope.dataEventFunctions.onAfterRead === 'function') {
        $scope.dataEventFunctions.onAfterRead(data);
      }
      $scope.originalData = data;
      processServerData(data, $scope, ctrlState);
    }

    return {
      readRecord: function readRecord($scope, ctrlState) {
        // TODO Consider using $parse for this - http://bahmutov.calepin.co/angularjs-parse-hacks.html
        SubmissionsService.readRecord($scope.modelName, $scope.id)
          .then(function (response) {
            let data: any = response.data;
            if (data.success === false) {
              $location.path('/404');
// TODO Figure out tab history updates (check for other tab-history-todos)
//             } else if (response.master) {
//
//               ctrlState.allowLocationChange = false;
//               $scope.phase = 'ready';
//               $scope.record = angular.copy(response.data);
//               ctrlState.master = angular.copy(response.master);
//               if (response.changed) {
//                 $timeout(() => {
//                   $scope[$scope.topLevelFormName].$setDirty();
//                 });
//               } else {
//                 $timeout($scope.setPristine);
//               }
            } else {
              handleIncomingData(data, $scope, ctrlState);
            }
          }, $scope.handleHttpError);
      },

      scrollTheList: function scrollTheList($scope) {
        var pagesLoaded = $scope.pagesLoaded;
        SubmissionsService.getPagedAndFilteredList($scope.modelName, {
          aggregate: $location.$$search.a,
          find: $location.$$search.f,
          limit: $scope.pageSize,
          skip: pagesLoaded * $scope.pageSize,
          order: $location.$$search.o
        })
          .then(function (response) {
            let data: any = response.data;
            if (angular.isArray(data)) {
              //  I have seen an intermittent problem where a page is requested twice
              if (pagesLoaded === $scope.pagesLoaded) {
                $scope.pagesLoaded++;
                $scope.recordList = $scope.recordList.concat(data);
              } else {
                console.log('DEBUG: infinite scroll component asked for a page twice');
              }
            } else {
              $scope.showError(data, 'Invalid query');
            }
          }, $scope.handleHttpError);
      },

      // TODO: Do we need model here?  Can we not infer it from scope?
      deleteRecord: function deleteRecord(model, id, $scope, ctrlState) {
        SubmissionsService.deleteRecord(model, id)
          .then(function () {
            if (typeof $scope.dataEventFunctions.onAfterDelete === 'function') {
              $scope.dataEventFunctions.onAfterDelete(ctrlState.master);
            }
            routingService.redirectTo()('list', $scope, $location);
          });
      },

      updateDocument: function updateDocument(dataToSave, options, $scope: fng.IFormScope, ctrlState) {
        $scope.phase = 'updating';

        SubmissionsService.updateRecord($scope.modelName, $scope.id, dataToSave)
          .then(function (response) {
            let data: any = response.data;
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
                handleIncomingData(data, $scope, ctrlState);
                $scope.setPristine(false);
              }
            } else {
              $scope.showError(data);
            }
          }, $scope.handleHttpError);
      },

      createNew: function createNew(dataToSave, options, $scope: fng.IFormScope) {
        SubmissionsService.createRecord($scope.modelName, dataToSave)
          .then(function (response) {
            let data: any = response.data;
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
          }, $scope.handleHttpError);
      },

      getListData: getListData,

      suffixCleanId: suffixCleanId,

      setData: setData,

      setUpLookupOptions: function setUpLookupOptions(lookupCollection, schemaElement, $scope, ctrlState, handleSchema) {
        var optionsList = $scope[schemaElement.options] = [];
        var idList = $scope[schemaElement.ids] = [];

        SchemasService.getSchema(lookupCollection)
          .then(function (response) {
            let data: any = response.data;
            var listInstructions = [];
            handleSchema('Lookup ' + lookupCollection, data, null, listInstructions, '', false, $scope, ctrlState);

            var dataRequest;
            if (typeof schemaElement.filter !== 'undefined' && schemaElement.filter) {
              dataRequest = SubmissionsService.getPagedAndFilteredList(lookupCollection, schemaElement.filter);
            } else {
              dataRequest = SubmissionsService.getAll(lookupCollection);
            }
            dataRequest
              .then(function (response) {
                let data: any = response.data;
                if (data) {
                  for (var i = 0; i < data.length; i++) {
                    var option = '';
                    for (var j = 0; j < listInstructions.length; j++) {
                      let thisVal: string = data[i][listInstructions[j].name];
                      option += thisVal ? thisVal + ' ' : '';
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
      },

      handleInternalLookup: function handleInternalLookup($scope, formInstructions, ref) {

        function convertOldToNew(val, attrib, newVals, oldVals) {
          // check this is a chage to an existing value, rather than a new one or one being deleted
          if (oldVals && oldVals.length > 0 && oldVals.length === newVals.length && val[attrib]) {
            let index = oldVals.findIndex(a => a[ref.value] === val[attrib]);
            if (index > -1) {
              let newVal = newVals[index][ref.value];
              if (newVal) {
                val[attrib] = newVal;
              }
            }
          }
        }

        $scope[formInstructions.options] = [];
        $scope[formInstructions.ids] = [];
        let nameElements = formInstructions.name.split('.');
        let lastPart = nameElements.pop();
        let possibleArray = nameElements.join('.');
        $scope.$watch(`record.${ref.property}`, function(newVal: Array<any>, oldVal: Array<any>) {
          setUpInternalLookupLists($scope, formInstructions.options, formInstructions.ids, newVal, ref.value);
          // now change the looked-up values that matched the old to the new
          if ((newVal && newVal.length > 0) || (oldVal && oldVal.length > 0)) {
            if (possibleArray) {
              let arr = getData($scope.record, possibleArray, null);
              if (arr && arr.length > 0) {
                arr.forEach(a => convertOldToNew(a, lastPart, newVal, oldVal))
              }
            } else if (angular.isArray($scope.record[lastPart])) {
              $scope.record[lastPart].forEach(a => {
                convertOldToNew(a,'x',newVal,oldVal);
              });
            } else {
              convertOldToNew($scope.record, lastPart, newVal, oldVal);
            }
          }
        }, true);

      },

      preservePristine: preservePristine,

      // Reverse the process of convertToAngularModel
      convertToMongoModel: function convertToMongoModel(schema, anObject, prefixLength, $scope, schemaName? : string) {

        function convertLookup(lookup, conversionInst) {
          var retVal;
          if (conversionInst && conversionInst.fngajax) {
            if (lookup) {
              retVal = lookup.id || lookup;
            }
          } else if (lookup) {
            retVal = lookup.text || (lookup.x ? lookup.x.text : lookup);
          }
          return retVal;
        }

        for (var i = 0; i < schema.length; i++) {
          var fieldname = schema[i].name.slice(prefixLength);
          var thisField = getListData($scope, anObject, fieldname);

          if (schema[i].schema) {
            if (thisField) {
              for (var j = 0; j < thisField.length; j++) {
                thisField[j] = convertToMongoModel(schema[i].schema, thisField[j], prefixLength + 1 + fieldname.length, $scope, fieldname);
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
            let thisConversion: any;
            if (idList && idList.length > 0) {
              updateObject(fieldname, anObject, function (value) {
                return convertToForeignKeys(schema[i], value, $scope[suffixCleanId(schema[i], 'Options')], idList);
              });
            } else if (thisConversion = getConversionObject($scope, fieldname, schemaName)) {
              var lookup = getData(anObject, fieldname, null);
              var newVal;
              if (schema[i].array) {
                newVal = [];
                if (lookup) {
                  for (var n = 0; n < lookup.length; n++) {
                    newVal[n] = convertLookup(lookup[n], thisConversion);
                  }
                }
              } else {
                newVal = convertLookup(lookup, thisConversion);
              }
              setData(anObject, fieldname, null, newVal);
            }

          }
        }
        return anObject;
      },

      convertIdToListValue: convertIdToListValue,

      handleError: handleError,

      decorateScope: function decorateScope($scope:fng.IFormScope, $uibModal, recordHandlerInstance : fng.IRecordHandler, ctrlState) {

        $scope.handleHttpError = handleError($scope);

        $scope.cancel = function () {
          angular.copy(ctrlState.master, $scope.record);
          $scope.$broadcast('fngCancel', $scope);
          // Let call backs etc resolve in case they dirty form, then clean it
          $timeout($scope.setPristine);
        };

        //listener for any child scopes to display messages
        // pass like this:
        //    scope.$emit('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
        // or
        //    scope.$broadcast('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
        $scope.$on('showErrorMessage', function (event, args) {
          $scope.showError(args.body, args.title);
        });

        $scope.showError = function (error: any, alertTitle? : string) {
          $scope.alertTitle = alertTitle ? alertTitle : 'Error!';
          if (typeof error === 'string') {
            $scope.errorMessage = error;
          } else if (error.message && typeof error.message === 'string') {
            $scope.errorMessage = error.message;
          } else if (error.data && error.data.message) {
            $scope.errorMessage = error.data.message;
          } else {
            try {
              $scope.errorMessage = JSON.stringify(error);
            } catch(e) {
              $scope.errorMessage = error;
            }
          }
        };

        $scope.dismissError = function () {
          delete $scope.errorMessage;
          delete $scope.alertTitle;
        };

        $scope.prepareForSave = function(cb: (error: string, dataToSave?: any) => void): void {
          //Convert the lookup values into ids
          let dataToSave = recordHandlerInstance.convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0, $scope);
          if ($scope.id) {
            if (typeof $scope.dataEventFunctions.onBeforeUpdate === 'function') {
              $scope.dataEventFunctions.onBeforeUpdate(dataToSave, ctrlState.master, function (err) {
                if (err) {
                  cb(err);
                } else {
                  cb(null, dataToSave);
                }
              });
            } else {
              cb(null, dataToSave);
            }
          } else {
            if (typeof $scope.dataEventFunctions.onBeforeCreate === 'function') {
              $scope.dataEventFunctions.onBeforeCreate(dataToSave, function (err) {
                if (err) {
                  cb(err);
                } else {
                  cb(null, dataToSave);
                }
              });
            } else {
              cb(null, dataToSave);
            }
          }
        };

        $scope.save = function (options) {
          options = options || {};
          $scope.prepareForSave((err, dataToSave) => {
            if (err) {
              if (err !== '_update_handled_') {
                $scope.showError(err);
              }
            } else if ($scope.id) {
              recordHandlerInstance.updateDocument(dataToSave, options, $scope, ctrlState);
            } else {
              recordHandlerInstance.createNew(dataToSave, options, $scope);
            }
          });
        };

        $scope.newClick = function () {
          routingService.redirectTo()('new', $scope, $location);
        };

        $scope.$on('$locationChangeStart', function (event, next) {
          // let changed = !$scope.isCancelDisabled();
          // let curPath = window.location.href.split('/');
          // let nextPath = next.split('/');
          // let tabChangeOnly = true;
          // let i = 0;
          // do {
          //   i += 1;
          //   if (curPath[i] !== nextPath[i]) {
          //     tabChangeOnly = false;
          //   }
          // } while (tabChangeOnly && curPath[i] !== 'edit');
          // if (tabChangeOnly) {
          //   // let dataToReturn = recordHandlerInstance.convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0, $scope);
          //   SubmissionsService.setUpForTabChange($scope.modelName, $scope.id, $scope.record, ctrlState.master, changed);
          // } else if (!ctrlState.allowLocationChange && changed) {
          if (!ctrlState.allowLocationChange && !$scope.isCancelDisabled()) {
            event.preventDefault();
            const modalInstance = $uibModal.open({
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
              function(result) {
                if (result) {
                  $scope.save({ redirect: next, allowChange: true });    // save changes
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
            let confirmDelete: Promise<boolean>;
            if ($scope.unconfirmedDelete) {
              confirmDelete = Promise.resolve(true);
            } else {
              let modalInstance = $uibModal.open({
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
              confirmDelete = modalInstance.result;
            }

            confirmDelete.then(
              function (result) {
                if (result) {
                  if (typeof $scope.dataEventFunctions.onBeforeDelete === 'function') {
                    $scope.dataEventFunctions.onBeforeDelete(ctrlState.master, function (err) {
                      if (err) {
                        if (err !== '_delete_handled_') {
                          $scope.showError(err);
                        }
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

        $scope.getVal = function (expression, index) {
          if (expression.indexOf('$index') === -1 || typeof index !== 'undefined') {
            expression = expression.replace(/\$index/g, index);
            return $scope.$eval('record.' + expression);
          }
          //else {
// Used to show error here, but angular seems to call before record is populated sometimes
//      throw new Error('Invalid expression in getVal(): ' + expression);
          //}
        };

        $scope.sortableOptions = {
          update: function() {
            if ($scope.topLevelFormName) {
              $scope[$scope.topLevelFormName].$setDirty();
            }
          }
        };

      },

      fillFormFromBackendCustomSchema: fillFormFromBackendCustomSchema,

      fillFormWithBackendSchema: function fillFormWithBackendSchema($scope, formGeneratorInstance, recordHandlerInstance, ctrlState) {

        SchemasService.getSchema($scope.modelName, $scope.formName)
          .then(function (response) {
          let schema: any = response.data;
            fillFormFromBackendCustomSchema(schema, $scope, formGeneratorInstance, recordHandlerInstance, ctrlState);
          }, $scope.handleHttpError);
      }
    }
  }
}
