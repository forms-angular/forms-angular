/// <reference path="../../index.d.ts" />

module fng.services {
  /**
   * Operations on a whole record
   *
   * All methods should be state-less
   *
   */

  /*@ngInject*/
  export function RecordHandlerService(
    $location: angular.ILocationService,
    $window: angular.IWindowService,
    $filter,
    $timeout: angular.ITimeoutService,
    $sce: angular.ISCEService,
    RoutingService: fng.IRoutingService,
    CssFrameworkService: fng.ICssFrameworkService,
    SubmissionsService: fng.ISubmissionsService,
    SchemasService
  ): fng.IRecordHandlerService {

    // TODO: Put this in a service
    const makeMongoId = (rnd = r16 => Math.floor(r16).toString(16)) => rnd(Date.now() / 1000) + " ".repeat(16).replace(/./g, () => rnd(Math.random() * 16));

    function _handleCancel(resp: string) {
        if (["cancel", "backdrop click", "escape key press"].indexOf(resp) === -1) {
          throw resp;
        }
    }

    var suffixCleanId = function suffixCleanId(inst, suffix) {
      return (inst.id || "f_" + inst.name).replace(/\./g, "_") + suffix;
    };

    var walkTree = function(object, fieldname, element? , insertIntermediateObjects = false) {
      // Walk through subdocs to find the required key
      // for instance walkTree(master,'address.street.number',element)
      // called by getData and setData

      // element is used when accessing in the context of a input, as the id (like exams-2-grader)
      // gives us the element of an array (one level down only for now).  Leaving element blank returns the whole array
      var parts = fieldname.split("."),
          higherLevels = parts.length - 1,
          workingRec = object;
      for (var i = 0; i < higherLevels; i++) {
        if (!workingRec) {
          throw new Error(`walkTree failed: Object = ${object}, fieldname = ${fieldname}, i = ${i}`);
        }
        if (angular.isArray(workingRec)) {
          workingRec = _.map(workingRec, function(obj) {
            return obj[parts[i]];
          });
        } else {
          if (insertIntermediateObjects && !workingRec[parts[i]]) {
            workingRec[parts[i]] = {};
          }
          workingRec = workingRec[parts[i]];
        }
        if (angular.isArray(workingRec) && typeof element !== "undefined") {
          if (element.scope && typeof element.scope === "function") {
            // If we come across an array we need to find the correct position, if we have an element
            workingRec = workingRec[element.scope().$index];
          } else if (typeof element === "number") {
            workingRec = workingRec[element];
          } else {
            throw new Error("Unsupported element type in walkTree " + fieldname);
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

    var setData = function setData(object, fieldname, element?, value?) {
      var leafData = walkTree(object, fieldname, element, !!value);

      if (leafData.lastObject && leafData.key) {
        if (value) {
          if (angular.isArray(leafData.lastObject)) {
            for (var i = 0; i < leafData.lastObject.length; i++) {
              leafData.lastObject[i][leafData.key] = value[i];
            }
          } else {
            leafData.lastObject[leafData.key] = value;
          }
        } else {
          delete leafData.lastObject[leafData.key];
        }
      }
    };

    var getData = function(object, fieldname, element?: any) {
      var leafData = walkTree(object, fieldname, element);
      var retVal;
      if (leafData.lastObject && leafData.key) {
        if (angular.isArray(leafData.lastObject)) {
          retVal = _.map(leafData.lastObject, function(obj) {
            return obj[leafData.key];
          });
        } else {
          retVal = leafData.lastObject[leafData.key];
        }
      }
      return retVal;
    };

    var updateRecordWithLookupValues = function(schemaElement, $scope, ctrlState: IFngCtrlState, ignoreDirty = false) {
      // Update the master and the record with the lookup values, master first
      if (!$scope.topLevelFormName || ($scope[$scope.topLevelFormName] && (ignoreDirty || $scope[$scope.topLevelFormName].$pristine))) {
        updateObject(schemaElement.name, ctrlState.master, function(value) {
          if (typeof value == "object" && value.id) {
            return value;
          } else {
            return convertForeignKeys(schemaElement, value, $scope[suffixCleanId(schemaElement, "Options")], $scope[suffixCleanId(schemaElement, "_ids")]);
          }
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
      var nesting = aFieldName.split("."),
          result = [nesting[0]];

      if (nesting.length > 1) {
        result.push(nesting.slice(1).join("."));
      }

      return result;
    }

    var getListData = function getListData(record, fieldName, listSchema = null, $scope) {
      let retVal = getData(record, fieldName) || "";
      if (retVal && listSchema) {
        // Convert list fields as per instructions in params (ideally should be the same as what is found in data_form getListFields
        var schemaElm = _.find(listSchema, elm => (elm["name"] === fieldName));
        if (schemaElm) {
          switch (schemaElm["params"]) {
            case undefined :
              break;
            case "timestamp" :
              var timestamp = retVal.toString().substring(0, 8);
              var date = new Date(parseInt(timestamp, 16) * 1000);
              retVal = date.toLocaleDateString() + " " + date.toLocaleTimeString();
              break;
            default:
              retVal = $scope.dataEventFunctions[schemaElm["params"]](record);
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
            if (type === "undefined" || (type === "object" && Object.keys(theValue[i]).length === 0)) {
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
    function setUpInternalLookupLists($scope: fng.IFormScope, options: string[] | string, ids: string[] | string, newVal, valueAttrib) {
      let optionsArray = (typeof options === "string" ? $scope[options] : options);
      let idsArray = (typeof ids === "string" ? $scope[ids] : ids);
      optionsArray.length = 0;
      idsArray.length = 0;
      if (!!newVal && (newVal.length > 0)) {
        newVal.forEach(a => {
          let value = a[valueAttrib];
          if (value && value.length > 0) {
            optionsArray.push(value);
            if (!a._id) {
              a._id = makeMongoId();
            }
            idsArray.push(a._id);
          }
        });
      }
    }

    var simpleArrayNeedsX = function(aSchema) {
      var result = false;

      if (aSchema.needsX) {
        result = true;
      } else if (!aSchema.directive) {
        if (aSchema.type === "text") {
          result = true;
        } else if (aSchema.type === "select" && !aSchema.ids) {
          result = true;
        }
      }
      return result;
    };

    /* Look up a conversion set up by a plugin */
    function getConversionObject(scope: any, entryName: string, schemaName?: string): any {
      let conversions = scope.conversions;
      if (schemaName) {
        conversions = getData(conversions, schemaName) || {};
      }
      return conversions[entryName];
    }


    // Convert mongodb json to what we use in the browser, for example {_id:'xxx', array:['item 1'], lookup:'012abcde'} to {_id:'xxx', array:[{x:'item 1'}], lookup:'List description for 012abcde'}
    // This will currently only work for a single level of nesting (conversionObject will not go down further without amendment, and offset needs to be an array, at least)
    var convertToAngularModel = function(schema: IFormInstruction[], anObject, prefixLength, $scope, schemaName?: string, master?, offset?: number) {
      master = master || anObject;
      for (var i = 0; i < schema.length; i++) {
        var schemaEntry = schema[i];
        var fieldName = schemaEntry.name.slice(prefixLength);
        if (!fieldName.length) {
          fieldName = schemaEntry.name.split('.').pop();
        }
        var fieldValue = getData(anObject, fieldName);
        if (schemaEntry.intType === 'date' && typeof fieldValue === 'string') {
          setData(anObject, fieldName, null, new Date(fieldValue))
        }
        if (schemaEntry.schema) {
          if (fieldValue) {
            for (var j = 0; j < fieldValue.length; j++) {
              fieldValue[j] = convertToAngularModel(schemaEntry.schema, fieldValue[j], 1 + fieldName.length, $scope, fieldName, master, j);
            }
          }
        } else {
          if (schemaEntry.internalRef) {
            setUpInternalLookupLists($scope, schemaEntry.options, schemaEntry.ids, master[schemaEntry.internalRef.property], schemaEntry.internalRef.value);
          }
          // Convert {array:['item 1']} to {array:[{x:'item 1'}]}
          var thisField = getListData(anObject, fieldName, null, $scope);
          if (
              schemaEntry.array &&
              simpleArrayNeedsX(schemaEntry) &&
              thisField &&
              !(thisField.length > 0 && thisField[0].x)      // Don't keep on coverting
          ) {
            for (var k = 0; k < thisField.length; k++) {
              thisField[k] = { x: thisField[k] };
            }
          }

          // Convert {lookup:'012abcde'} to {lookup:'List description for 012abcde'}
          var idList = $scope[suffixCleanId(schemaEntry, "_ids")];
          let thisConversion: any;
          if (fieldValue && idList && idList.length > 0) {
            if (
              // it's not a nested field
              !fieldName.includes(".") && 
              // Check we are starting with an ObjectId (ie not being called because of $watch on conversion, with a converted value, which would cause an exception)
              fieldValue.toString().match(/^[a-f0-9]{24}$/) &&
              // We are not suppressing conversions
              (!schemaEntry.internalRef || !schemaEntry.internalRef.noConvert)
            ) {
              anObject[fieldName] = convertForeignKeys(schemaEntry, fieldValue, $scope[suffixCleanId(schemaEntry, "Options")], idList);
            }
          } else if (schemaEntry.select2) {
            // Do nothing with these - handled elsewhere (and deprecated)
            console.log("fng-select2 is deprecated - use fng-ui-select instead");
            void (schemaEntry.select2);
          } else if (fieldValue && (thisConversion = getConversionObject($scope, fieldName, schemaName)) &&
            thisConversion.fngajax &&
            typeof thisConversion.fngajax === "function" && // if the field is securely hidden, the directive won't have been invoked at all and therefore the conversion will not have been initialised.  but if it's hidden, we don't need to do the conversion anyway
            !thisConversion.noconvert
          ) {
            thisConversion.fngajax(fieldValue, schemaEntry, function(updateEntry, value) {
              // Update the master and (preserving pristine if appropriate) the record
              setData(master, updateEntry.name, offset, value);
              preservePristine(angular.element("#" + updateEntry.id), function() {
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
      if (schemaElement.array || angular.isArray(input)) {
        var returnArray = [];
        var needsX = schemaElement.array && (!schemaElement.directive || simpleArrayNeedsX(schemaElement));
        for (var j = 0; j < input.length; j++) {
          var val = input[j];
          if (val && val.x) {
            val = val.x;
          }
          var lookup = convertIdToListValue(val, ids, values, schemaElement.name);
          if (needsX) {
            lookup = { x: lookup };
          }
          returnArray.push(lookup);
        }
        return returnArray;
      } else if (schemaElement.select2) {
        return { id: input, text: convertIdToListValue(input, ids, values, schemaElement.name) };
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

    var convertListValueToId = function(value, valuesArray, idsArray, fname) {
      var textToConvert = _.isObject(value) ? ((<any>value).x || (<any>value).text) : value;
      if (textToConvert && textToConvert.match(/^[0-9a-f]{24}$/)) {
        return textToConvert;  // a plugin probably added this
      } else {
        var index = valuesArray.indexOf(textToConvert);
        if (index === -1) {
          throw new Error("convertListValueToId: Invalid data - value " + textToConvert + " not found in " + valuesArray + " processing " + fname);
        }
        return idsArray[index];
      }
    };

    var preservePristine = function preservePristine(element, fn) {
      // stop the form being set to dirty when a fn is called
      // Use when the record (and master) need to be updated by lookup values displayed asynchronously
      var modelController = element.inheritedData("$ngModelController");
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
      if (typeof (id) === "object") {
        id = id.id;
      }
      var index = idsArray.indexOf(id);
      if (index === -1) {
        index = valuesArray.indexOf(id);    // This can get called twice - second time with converted value (not sure how atm) so protect against that...
        if (index === -1) {
          throw new Error("convertIdToListValue: Invalid data - id " + id + " not found in " + idsArray + " processing " + fname);
        }
      }
      return valuesArray[index];
    };

    var processServerData = function processServerData(recordFromServer, $scope, ctrlState: IFngCtrlState) {
      ctrlState.master = convertToAngularModel($scope.formSchema, recordFromServer, 0, $scope);
      $scope.phase = "ready";
      $scope.cancel();
    };

    function convertOldToNew(ref, val, attrib, newVals, oldVals) {
      // check this is a change to an existing value, rather than a new one or one being deleted
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

    function fillFormFromBackendCustomSchema(schema, $scope: fng.IFormScope, formGeneratorInstance, recordHandlerInstance: fng.IRecordHandlerService, ctrlState: IFngCtrlState) {
      var listOnly = (!$scope.id && !$scope.newRecord);
      if (!listOnly && $scope.id) {
        // get started with reading the record now.  we'll wait for the promise to resolve later when calling finishReadingThenProcessRecord
        recordHandlerInstance.beginReadingRecord($scope);
      }
      // passing null for formSchema parameter prevents all the work being done when we are just after the list data,
      // but should be removed when/if formschemas are cached
      formGeneratorInstance.handleSchema("Main " + $scope.modelName, schema, listOnly ? null : $scope.formSchema, $scope.listSchema, "", true, $scope, ctrlState);

      function processLookupHandlers(newValue, oldValue) {
// If we have any internal lookups then update the references
        $scope.internalLookups.forEach((lkp: fng.IFngInternalLookupHandlerInfo) => {
          let newVal = newValue[lkp.ref.property];
          let oldVal = oldValue[lkp.ref.property];
          setUpInternalLookupLists($scope, lkp.lookupOptions, lkp.lookupIds, newVal, lkp.ref.value);
          // now change the looked-up values that matched the old to the new
          if ((newVal && newVal.length > 0) || (oldVal && oldVal.length > 0)) {
            lkp.handlers.forEach((h) => {
              if (h.possibleArray) {
                let arr = getData($scope.record, h.possibleArray, null);
                if (arr && arr.length > 0) {
                  arr.forEach(a => convertOldToNew(lkp.ref, a, h.lastPart, newVal, oldVal));
                }
              } else if (angular.isArray($scope.record[h.lastPart])) {
                $scope.record[h.lastPart].forEach(a => {
                  convertOldToNew(lkp.ref, a, "x", newVal, oldVal);
                });
              } else {
                convertOldToNew(lkp.ref, $scope.record, h.lastPart, newVal, oldVal);
              }
            });
          }
        });

        // If we have any list lookups then update the references
        $scope.listLookups.forEach((lkp: fng.IFngLookupListHandlerInfo) => {

          function extractIdVal(obj: any, idString: string): any {
            let retVal = obj[idString];
            if (retVal && retVal.id) {
              retVal = retVal.id;
            }
            return retVal;
          }

          function blankListLookup(inst: IFormInstruction) {
            setData($scope.record, inst.name);
          }

          let idString = lkp.ref.id.slice(1);
          if (idString.includes(".")) {
            throw new Error(`No support for nested list lookups yet - ${JSON.stringify(lkp.ref)}`);
          }
          let newVal = extractIdVal(newValue, idString);
          let oldVal = extractIdVal(oldValue, idString);
          if (newVal !== oldVal) {
            if (newVal) {
              if (oldVal) {
                lkp.handlers.forEach(function (h) {
                  h.oldValue = getData($scope.record, h.formInstructions.name);
                  if (angular.isArray(h.oldValue)) {
                    h.oldId = h.oldValue.map(function (a) {
                      return $scope[h.formInstructions.ids][$scope[h.formInstructions.options].indexOf(a)];
                    });
                  } else {
                    h.oldId = $scope[h.formInstructions.ids][$scope[h.formInstructions.options].indexOf(h.oldValue)];
                  }
                })
              }
              SubmissionsService.readRecord(lkp.ref.collection, newVal).then(function (response) {
                lkp.handlers.forEach(function (h) {
                  var optionsList = $scope[h.formInstructions.options];
                  optionsList.length = 0;
                  var idList = $scope[h.formInstructions.ids];
                  idList.length = 0;
                  var data = response.data[lkp.ref.property] || [];
                  for (var i = 0; i < data.length; i++) {
                    var option = data[i][lkp.ref.value];
                    var pos = _.sortedIndex(optionsList, option);
                    // handle dupes
                    if (optionsList[pos] === option) {
                      option = option + "    (" + data[i]._id + ")";
                      pos = _.sortedIndex(optionsList, option);
                    }
                    optionsList.splice(pos, 0, option);
                    idList.splice(pos, 0, data[i]._id);
                  }
                  if (Object.keys(oldValue).length === 0) {
                    // Not sure how safe this is, but the record is fresh so I think it's OK...
                    updateRecordWithLookupValues(h.formInstructions, $scope, ctrlState, true);
                  }
                  else if (h.oldId) {
                    // Here we are reacting to a change in the lookup pointer in the record.
                    // If the old id exists in the new idList we can keep it, otherwise we need to blank it.
                    // We need to remember that we can have an array of ids
                    if (angular.isArray(h.oldId)) {
                      h.oldId.forEach(function (id, idx) {
                        let pos = idList.indexOf(id);
                        setData($scope.record, h.formInstructions.name, idx, pos === -1 ? undefined : optionsList[pos]);
                      });
                    } else {
                      let pos = idList.indexOf(h.oldId);
                      if (pos !== -1) {
                        setData($scope.record, h.formInstructions.name, undefined, optionsList[pos]);
                      } else {
                        blankListLookup(h.formInstructions);
                      }
                    }
                  } else {
                    blankListLookup(h.formInstructions);
                  }
                });
              });
            }
            else {
              lkp.handlers.forEach(function (h) {
                $scope[h.formInstructions.options].length = 0;
                $scope[h.formInstructions.ids].length = 0;
                blankListLookup(h.formInstructions);
              });
            }
          }
        });
      }

      function notifyReady() {
        $scope.phase = "ready";
        $scope.cancel();
        processLookupHandlers($scope.record, {});
      }

      if (listOnly) {
        ctrlState.allowLocationChange = true;
      } else {
        var force = true;
        if (!$scope.newRecord) {
          $scope.dropConversionWatcher = $scope.$watchCollection("conversions", function(newValue, oldValue) {
            if (newValue !== oldValue && $scope.originalData) {
              processServerData($scope.originalData, $scope, ctrlState);
            }
          });
        }
        $scope.$watch("record", function(newValue, oldValue) {
          if (newValue !== oldValue) {
            if (Object.keys(oldValue).length > 0 && $scope.dropConversionWatcher) {
              $scope.dropConversionWatcher();  // Don't want to convert changed data
              $scope.dropConversionWatcher = null;
            }
            force = formGeneratorInstance.updateDataDependentDisplay(newValue, oldValue, force, $scope);
            processLookupHandlers(newValue, oldValue);

            if (formsAngular.title) {
              let title: string = formsAngular.title.prefix || '';
              if ($scope['editFormHeader']) {
                title += $scope['editFormHeader']();
              } else {
                for (let listElm in $scope.listSchema) {
                  if ($scope.listSchema.hasOwnProperty(listElm)) {
                    title += $scope.getListData($scope.record, $scope.listSchema[listElm].name) + ' ';
                  }
                }
              }
              title = title.trimEnd() + (formsAngular.title.suffix || '');
              $window.document.title = title.replace(/<\/?[^>]+(>|$)/g, "");;
            }
          }
        }, true);

        if ($scope.id) {
          // Going to read a record
          if (typeof $scope.dataEventFunctions.onBeforeRead === "function") {
            $scope.dataEventFunctions.onBeforeRead($scope.id, function(err) {
              if (err) {
                $scope.showError(err);
              } else {
                recordHandlerInstance.finishReadingThenProcessRecord($scope, ctrlState);
              }
            });
          } else {
            recordHandlerInstance.finishReadingThenProcessRecord($scope, ctrlState);
          }
        } else {
          // New record
          ctrlState.allowLocationChange = false;
          ctrlState.master = $scope.setDefaults($scope.formSchema);
          let passedRecord = $scope.initialiseNewRecord || ($location as any).$$search.r;
          if (passedRecord) {
            try {
              Object.assign(ctrlState.master, JSON.parse(passedRecord));
              if (!$scope["newRecordsStartPristine"]) {
                // Although this is a new record we are making it dirty from the url so we need to $setDirty
                $scope.$on("fngCancel", () => {
                  $timeout(() => {
                    if ($scope[$scope.topLevelFormName]) {
                      $scope[$scope.topLevelFormName].$setDirty();
                    }
                  }, 1000);  // Has to fire after the setPristime timeout.
                });
              }
            } catch (e) {
              console.log("Error parsing specified record : " + e.message);
            }
          }
          if (typeof $scope.dataEventFunctions.onInitialiseNewRecord === "function") {
            console.log("onInitialiseNewRecord is deprecated - use the async version - onNewRecordInit(data,cb)");
            $scope.dataEventFunctions.onInitialiseNewRecord(ctrlState.master);
          }
          if (typeof $scope.dataEventFunctions.onNewRecordInit === "function") {
            $scope.dataEventFunctions.onNewRecordInit(ctrlState.master, function(err) {
              if (err) {
                $scope.showError(err);
              } else {
                notifyReady();
              }
            });
          } else {
            notifyReady();
          }
        }
      }
    }

    function handleError($scope: fng.IFormScope) {
      return function(response: any): void {
        if ([200, 400, 403].indexOf(response.status) !== -1) {
          var errorMessage = "";
          if (response.data && response.data.errors) {
            for (var errorField in response.data.errors) {
              if (response.data.errors.hasOwnProperty(errorField)) {
                errorMessage += "<li><b>" + $filter("titleCase")(errorField) + ": </b> ";
                switch (response.data.errors[errorField].type) {
                  case "enum" :
                    errorMessage += "You need to select from the list of values";
                    break;
                  default:
                    errorMessage += response.data.errors[errorField].message;
                    break;
                }
                errorMessage += "</li>";
              }
            }
          }
          if (errorMessage.length > 0) {
            errorMessage = (response.data.message || response.data._message) + "<br /><ul>" + errorMessage + "</ul>";
          } else {
            errorMessage = response.data.message || response.data._message || response.data.err || "Error!  Sorry - No further details available.";
          }
          // anyone using a watch on $scope.phase, and waiting for it to become "ready" before proceeding, will probably
          // want to know that an error has occurred.  This value is NOT used anywhere in forms-angular.
          $scope.phase = "error";
          $scope.showError(errorMessage);
        } else {
          let msg = response.data;
          if (typeof msg !== "string") {
            msg = JSON.stringify(msg);
          }
          if (response.status !== 500) {
            msg = response.status + " " + msg;
          } 
          $scope.showError(msg);
        }
      };
    }

    function handleIncomingData(data, $scope, ctrlState: IFngCtrlState) {
      ctrlState.allowLocationChange = false;
      $scope.phase = "reading";
      if (typeof $scope.dataEventFunctions.onAfterRead === "function") {
        $scope.dataEventFunctions.onAfterRead(data);
      }
      $scope.originalData = data;
      processServerData(data, $scope, ctrlState);
    }

    function addArrayLookupToLookupList($scope: IFormScope, formInstructions: IFormInstruction, ref: IBaseArrayLookupReference,
                                                      lookups: (IFngInternalLookupHandlerInfo | IFngLookupListHandlerInfo)[]) {
      let nameElements = formInstructions.name.split(".");

      let refHandler: IFngInternalLookupHandlerInfo | IFngLookupListHandlerInfo = lookups.find((lkp) => {
        return lkp.ref.property === ref.property && lkp.ref.value === ref.value;
      });

      let thisHandler: IFngSingleLookupHandler = {
        formInstructions: formInstructions,
        lastPart: nameElements.pop(),
        possibleArray: nameElements.join(".")
      };

      if (!refHandler) {
        refHandler = {
          ref: ref,
          lookupOptions: [],
          lookupIds: [],
          handlers: []
        };
        lookups.push(refHandler);
      }
      refHandler.handlers.push(thisHandler);
      $scope[formInstructions.options] = refHandler.lookupOptions;
      $scope[formInstructions.ids] = refHandler.lookupIds;

    }

    return {
      beginReadingRecord: ($scope) => {
        $scope.readingRecord = SubmissionsService.readRecord($scope.modelName, $scope.id, $scope.formName);
      },

      finishReadingThenProcessRecord: ($scope, ctrlState: IFngCtrlState) => {
        const promises = [$scope.readingRecord];
        if (typeof formsAngular.beforeHandleIncomingDataPromises === "function") {
          promises.push(...formsAngular.beforeHandleIncomingDataPromises());
        }
        Promise.all(promises)
          .then((results) => {
            let data: any = angular.copy(results[0].data);
            handleIncomingData(data, $scope, ctrlState);
          })
          .catch((e) => {
            if ($scope.dataEventFunctions.onReadError) {
              $scope.dataEventFunctions.onReadError($scope.id, e);
            } else {
              if (e.status === 404) {
                $location.path("/404");
              } else {
                $scope.handleHttpError(e);
              }
            }
          });
      },

      scrollTheList: function scrollTheList($scope) {
        var pagesLoaded = $scope.pagesLoaded;
        SubmissionsService.getPagedAndFilteredList($scope.modelName, {
          aggregate: ($location as any).$$search.a,
          find: ($location as any).$$search.f,
          limit: $scope.pageSize,
          skip: pagesLoaded * $scope.pageSize,
          order: ($location as any).$$search.o,
          concatenate: false
        })
          .then(function(response) {
            let data: any = response.data;
            if (angular.isArray(data)) {
              // if the options for the resource identified by $scope.modelName has disambiguation parameters,
              // and that resource has more than one list field, the items returned by getPagedAndFilteredList
              // might include a "disambiguation" property.  for this to appear on the list page, we need
              // to add an item for it to the list schema
              if (!$scope.listSchema.find((f) => f.name === "disambiguation") && data.some((d) => d.disambiguation)) {
                $scope.listSchema.push({
                  name: "disambiguation",
                })
              }
              // I have seen an intermittent problem where a page is requested twice
              if (pagesLoaded === $scope.pagesLoaded) {
                $scope.pagesLoaded++;
                $scope.recordList = $scope.recordList.concat(data);
              } else {
                console.log("DEBUG: infinite scroll component asked for a page twice - the model was " + $scope.modelName);
              }
            } else {
              $scope.showError(data, "Invalid query");
            }
          }, $scope.handleHttpError);
      },

      deleteRecord: function deleteRecord(id, $scope, ctrlState) {
        $scope.phase = "deleting";
        SubmissionsService.deleteRecord($scope.modelName, id, $scope.formName)
          .then(function() {
            if (typeof $scope.dataEventFunctions.onAfterDelete === "function") {
              $scope.dataEventFunctions.onAfterDelete(ctrlState.master);
            }
            RoutingService.redirectTo()("onDelete", $scope, $location);
          }, (err) => {
            if (err.status === 404) {
              // Someone already deleted it
              RoutingService.redirectTo()("onDelete", $scope, $location);
            } else if (err.status === 403) {
              $scope.showError(err.data?.message || err.message || err.data || err, 'Permission denied');
            } else {
              $scope.showError(`${err.statusText} (${err.status}) while deleting record<br />${err.data}`, 'Error deleting record');
            }
          });
      },

      updateDocument: function updateDocument(dataToSave, options, $scope: fng.IFormScope, ctrlState: IFngCtrlState) {
        $scope.phase = "updating";

        SubmissionsService.updateRecord($scope.modelName, $scope.id, dataToSave, $scope.formName)
          .then(function(response) {
            let data: any = response.data;
            if (data.success !== false) {
              if (typeof $scope.dataEventFunctions.onAfterUpdate === "function") {
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
          }, function(err) {
            $scope.handleHttpError(err);
          });
      },

      createNew: function createNew(dataToSave, options, $scope: fng.IFormScope, ctrlState: IFngCtrlState) {
        SubmissionsService.createRecord($scope.modelName, dataToSave, $scope.formName)
          .then(function(response) {
            let data: any = response.data;
            if (data.success !== false) {
              ctrlState.allowLocationChange = true;
              if (typeof $scope.dataEventFunctions.onAfterCreate === "function") {
                $scope.dataEventFunctions.onAfterCreate(data);
              }
              if (options.redirect) {
                $window.location = options.redirect;
              } else {
                RoutingService.redirectTo()("edit", $scope, $location, data._id);
              }
            } else {
              $scope.showError(data);
            }
          }, $scope.handleHttpError);
      },

      getListData,

      suffixCleanId,

      getData,

      setData,

      setUpLookupOptions: function setUpLookupOptions(lookupCollection, schemaElement, $scope, ctrlState, handleSchema) {
        const optionsList = $scope[schemaElement.options] = [];
        const idList = $scope[schemaElement.ids] = [];
        const dataRequest = !!schemaElement.filter
          ? SubmissionsService.getPagedAndFilteredList(lookupCollection, Object.assign({ concatenate: true }, schemaElement.filter)) // { concatenate: true } causes it to concatenate the list fields into the .text property of ILookupItem objects
          : SubmissionsService.getAllListAttributes(lookupCollection);
        dataRequest
          .then((response: angular.IHttpResponse<fng.ILookupItem[]>) => {
            const items = response.data;
            if (items) {
              items.sort((a, b) => a.text.localeCompare(b.text));
              optionsList.push(...items.map((i) => i.text));
              idList.push(...items.map((i) => i.id));
              const dupes = new Set<string>();
              for (let i = 0; i < optionsList.length - 1; i++) {
                for (let j = i + 1; j < optionsList.length; j++) {
                  if (_.isEqual(optionsList[i], optionsList[j])) {
                    dupes.add(optionsList[i]);
                  }
                }
              }
              // append the id to any duplicates to make them unique
              dupes.forEach((d) => {
                for (let i = 0; i < optionsList.length; i++) {
                  if (optionsList[i] === d) {
                    optionsList[i] += "(" + idList[i] + ")";
                  }
                }
              })
              if ($scope.readingRecord) {
                $scope.readingRecord
                  .then(() => {
                    updateRecordWithLookupValues(schemaElement, $scope, ctrlState);
                  })
              }
            }
          })
          .catch ((e) => {
            $scope.handleHttpError(e)
          });
      },

      setUpLookupListOptions: function setUpLookupListOptions(ref: IFngLookupListReference, formInstructions: IFormInstruction, $scope: IFormScope, ctrlState: IFngCtrlState) {
        let optionsList = $scope[formInstructions.options] = [];
        let idList = $scope[formInstructions.ids] = [];
        if (ref.id[0] === "$") {
          // id of document that contains out lookup list comes from record, so we need to deal with in $watch by adding it to listLookups
          addArrayLookupToLookupList($scope, formInstructions, ref, $scope.listLookups)
        } else {
          // we can do it now
          SubmissionsService.readRecord(ref.collection, $scope.$eval(ref.id)).then(
            (response) => {
              let data = response.data[ref.property];
              for (var i = 0; i < data.length; i++) {
                var option = data[i][ref.value];
                var pos = _.sortedIndex(optionsList, option);
                // handle dupes
                if (optionsList[pos] === option) {
                  option = option + "    (" + data[i]._id + ")";
                  pos = _.sortedIndex(optionsList, option);
                }
                optionsList.splice(pos, 0, option);
                idList.splice(pos, 0, data[i]._id);
              }
              updateRecordWithLookupValues(formInstructions, $scope, ctrlState);
            }
          );
        }
      },

      handleInternalLookup: function handleInternalLookup($scope: IFormScope, formInstructions: IFormInstruction, ref: IFngInternalLookupReference) {
        addArrayLookupToLookupList($scope, formInstructions, ref, $scope.internalLookups);
      },

      preservePristine,

      // Reverse the process of convertToAngularModel
      convertToMongoModel: function convertToMongoModel(schema, anObject, prefixLength, $scope, schemaName?: string) {

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
          const schemaI = schema[i];
          const fieldname = schemaI.name.slice(prefixLength);
          const thisField = getListData(anObject, fieldname, null, $scope);

          if (schemaI.schema) {
            if (thisField) {
              for (let j = 0; j < thisField.length; j++) {
                thisField[j] = convertToMongoModel(schemaI.schema, thisField[j], 1 + fieldname.length, $scope, fieldname);
              }
            }
          } else {
            // Convert {array:[{x:'item 1'}]} to {array:['item 1']}
            if (schemaI.array && simpleArrayNeedsX(schemaI) && thisField) {
              for (let k = 0; k < thisField.length; k++) {
                thisField[k] = thisField[k].x;
              }
            }

            // Convert {lookup:'List description for 012abcde'} to {lookup:'012abcde'}
            const idList = $scope[suffixCleanId(schemaI, "_ids")];
            if (idList && idList.length > 0) {
              updateObject(fieldname, anObject, function(value) {
                return convertToForeignKeys(schemaI, value, $scope[suffixCleanId(schemaI, "Options")], idList);
              });
            } else {
              let thisConversion = getConversionObject($scope, fieldname, schemaName);
              if (thisConversion) {
                const lookup = getData(anObject, fieldname, null);
                let newVal;
                if (schemaI.array) {
                  newVal = [];
                  if (lookup) {
                    for (let n = 0; n < lookup.length; n++) {
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
        }
        return anObject;
      },

      convertIdToListValue: convertIdToListValue,

      handleError: handleError,

      decorateScope: function decorateScope($scope: fng.IFormScope, $uibModal, recordHandlerInstance: fng.IRecordHandlerService, ctrlState: IFngCtrlState) {

        $scope.handleHttpError = handleError($scope);

        $scope.cancel = function() {
          angular.copy(ctrlState.master, $scope.record);
          $scope.$broadcast("fngCancel", $scope);
          // Let call backs etc resolve in case they dirty form, then clean it
          $timeout($scope.setPristine);
        };

        //listener for any child scopes to display messages
        // pass like this:
        //    scope.$emit('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
        // or
        //    scope.$broadcast('showErrorMessage', {title: 'Your error Title', body: 'The body of the error message'});
        $scope.$on("showErrorMessage", function(event, args) {
          if (!event.defaultPrevented) {
            event.defaultPrevented = true;
            $scope.showError(args.body, args.title);
          }
        });

        $scope.showError = function (error: any, alertTitle?: string) {
          function generateErrorText() : string{
            $timeout(()=> {
              $scope.phase = "ready";
            }, 25);
            if (typeof error === "string") {
              return $sce.trustAsHtml(error);
            } else if (!error) {
              return "An error occurred - that's all we got.  Sorry.";
            } else if (error.message && typeof error.message === "string") {
              return error.message;
            } else if (error.data && error.data.message) {
              return error.data.message;
            } else {
              try {
                return JSON.stringify(error);
              } catch (e) {
                return error;
              }
            }
          }

          if ($scope.errorHideTimer) {
            // we already have an error showing, so clear timeout and don't overwrite it
            $scope.clearTimeout();
          }
          if ($scope.errorMessage) {
            $scope.errorMessage += '<br /><br />';
          } else {
            $scope.errorMessage = '';
          }
          $scope.errorMessage += generateErrorText();
          $scope.alertTitle = alertTitle ? alertTitle : "Error!";

          $scope.errorHideTimer = window.setTimeout(function() {
            $scope.dismissError();
            $scope.$digest();
          }, 3500 + (1000 * ($scope.alertTitle + $scope.errorMessage).length / 50));
          $scope.errorVisible = true;
          window.setTimeout(() => {
            $scope.$digest();
          })
        };

        $scope.clearTimeout = function() {
          if ($scope.errorHideTimer) {
            clearTimeout($scope.errorHideTimer);
            delete $scope.errorHideTimer;
          }
        };

        $scope.dismissError = function() {
          $scope.clearTimeout;
          $scope.errorVisible = false;
          delete $scope.errorMessage;
          delete $scope.alertTitle;
        };

        $scope.stickError = function() {
          clearTimeout($scope.errorHideTimer);
        };

        $scope.prepareForSave = function(cb: (error: string, dataToSave?: any) => void): void {
          //Convert the lookup values into ids
          let dataToSave = recordHandlerInstance.convertToMongoModel($scope.formSchema, angular.copy($scope.record), 0, $scope);
          if ($scope.id) {
            if (typeof $scope.dataEventFunctions.onBeforeUpdate === "function") {
              $scope.dataEventFunctions.onBeforeUpdate(dataToSave, ctrlState.master, function(err) {
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
            if (typeof $scope.dataEventFunctions.onBeforeCreate === "function") {
              $scope.dataEventFunctions.onBeforeCreate(dataToSave, function(err) {
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

        $scope.save = function(options) {
          options = options || {};
          // stash these against the scope as well, so the onBeforeUpdate or onBeforeCreate handlers that may be called from
          // prepareForSave() have knowledge of any redirection that should occur after the save has been successfully made
          $scope.redirectOptions = options;
          $scope.prepareForSave((err, dataToSave) => {
            if (err) {
              if (err !== "_update_handled_") {
                $timeout(() => {
                  $scope.showError(err);
                });
              }
            } else if ($scope.id) {
              recordHandlerInstance.updateDocument(dataToSave, options, $scope, ctrlState);
            } else {
              recordHandlerInstance.createNew(dataToSave, options, $scope, ctrlState);
            }
          });
        };

        $scope.newClick = function() {
          RoutingService.redirectTo()("new", $scope, $location);
        };

        $scope.$on("$locationChangeStart", function(event, next) {
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
              template:
`<div class="modal-header">
   <h3>Record modified</h3>
</div>
<div class="modal-body">
   <p>Would you like to save your changes?</p>
</div>
<div class="modal-footer">
    <button class="btn btn-primary dlg-yes" ng-click="yes()">Yes</button>
    <button class="btn btn-warning dlg-no" ng-click="no()">No</button>
    <button class="btn dlg-cancel" ng-click="cancel()">Cancel</button>
</div>`,
              controller: "SaveChangesModalCtrl",
              backdrop: "static"
            });

            modalInstance.result
                .then(function(result) {
                if (result) {
                  $scope.save({ redirect: next, allowChange: true });    // save changes
                } else {
                  ctrlState.allowLocationChange = true;
                  $window.location = next;
                }
              }
            )
                .catch(_handleCancel);
          }
        });

        $scope.deleteClick = function() {
          if ($scope.record._id) {
            let confirmDelete: Promise<boolean>;
            if ($scope.unconfirmedDelete) {
              confirmDelete = Promise.resolve(true);
            } else {
              let modalInstance = $uibModal.open({
                template:
`<div class="modal-header">
   <h3>Delete Item</h3>
</div>
<div class="modal-body">
   <p>Are you sure you want to delete this record?</p>
</div>
<div class="modal-footer">
    <button class="btn btn-primary dlg-no" ng-click="cancel()">No</button>
    <button class="btn btn-warning dlg-yes" ng-click="yes()">Yes</button>
</div>`,
                controller: "SaveChangesModalCtrl",
                backdrop: "static"
              });
              confirmDelete = modalInstance.result;
            }

            confirmDelete.then(
              function(result) {

                function doTheDeletion() {
                  recordHandlerInstance.deleteRecord($scope.id, $scope, ctrlState);
                }

                if (result) {
                  if (typeof $scope.dataEventFunctions.onBeforeDelete === "function") {
                    $scope.dataEventFunctions.onBeforeDelete(ctrlState.master, function(err) {
                      if (err) {
                        if (err !== "_delete_handled_") {
                          $scope.showError(err);
                        }
                      } else {
                        doTheDeletion();
                      }
                    });
                  } else {
                    doTheDeletion();
                  }
                }
              }
            )
                .catch(_handleCancel);
          }
        };

        $scope.isCancelDisabled = function() {
          if (($scope[$scope.topLevelFormName] && $scope[$scope.topLevelFormName].$pristine) ||$scope.phase !== "ready") {
            return true;
          } else if (typeof $scope.disableFunctions?.isCancelDisabled === "function") {
            return $scope.disableFunctions.isCancelDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
          } else {
            return false;
          }
        };

        $scope.isSaveDisabled = function() {
          $scope.whyDisabled = undefined;
          let pristine = false;

          function generateWhyDisabledMessage(form, subFormName?: string) {
            form.$$controls.forEach(c => {
              if (c.$invalid) {
                if (c.$$controls) {
                  // nested form
                  generateWhyDisabledMessage(c, c.$name)
                } else {
                  $scope.whyDisabled += "<br /><strong>";
                  if (subFormName) {
                    $scope.whyDisabled += subFormName + ' ';
                  }
                  if (
                    CssFrameworkService.framework() === "bs2" &&
                    c.$$element &&
                    c.$$element.parent() &&
                    c.$$element.parent().parent() &&
                    c.$$element.parent().parent().find("label") &&
                    c.$$element.parent().parent().find("label").text()
                  ) {
                    $scope.whyDisabled += c.$$element.parent().parent().find("label").text();
                  } else if (
                    CssFrameworkService.framework() === "bs3" &&
                    c.$$element &&
                    c.$$element.parent() &&
                    c.$$element.parent().parent() &&
                    c.$$element.parent().parent().parent() &&
                    c.$$element.parent().parent().parent().find("label") &&
                    c.$$element.parent().parent().parent().find("label").text()
                  ) {
                    $scope.whyDisabled += c.$$element.parent().parent().parent().find("label").text();
                  } else {
                    $scope.whyDisabled += c.$name;
                  }
                  $scope.whyDisabled += "</strong>: ";
                  if (c.$error) {
                    for (let type in c.$error) {
                      if (c.$error.hasOwnProperty(type)) {
                        switch (type) {
                          case "required":
                            $scope.whyDisabled += "Field missing required value. ";
                            break;
                          case "pattern":
                            $scope.whyDisabled += "Field does not match required pattern. ";
                            break;
                          default:
                            $scope.whyDisabled += type + ". ";
                        }
                      }
                    }
                  }
                }
              }
            });
          }

          if ($scope[$scope.topLevelFormName]) {
            if ($scope[$scope.topLevelFormName].$invalid) {
              $scope.whyDisabled = 'The form data is invalid:';
              generateWhyDisabledMessage($scope[$scope.topLevelFormName]);
            } else if ($scope[$scope.topLevelFormName].$pristine) {
              // Don't have disabled message - should be obvious from Cancel being disabled,
              // and the message comes up when the Save button is clicked.
              pristine = true;
            }
          } else {
            $scope.whyDisabled = "Top level form name invalid";
          }

          if (pristine || !!$scope.whyDisabled || $scope.phase !== "ready") {
            return true;
          } else if (typeof $scope.disableFunctions?.isSaveDisabled !== "function") {
            return false;
          } else {
            let retVal = $scope.disableFunctions.isSaveDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
            if (typeof retVal === "string") {
              $scope.whyDisabled = retVal;
            } else {
              $scope.whyDisabled = "An application level user-specified function is inhibiting saving the record";
            }
            return !!retVal;
          }
        };

        $scope.isDeleteDisabled = function() {
          if (!$scope.id || $scope.phase !== "ready") {
            return true;
          } else if (typeof $scope.disableFunctions?.isDeleteDisabled === "function") {
            return $scope.disableFunctions.isDeleteDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
          } else {
            return false;
          }
        };

        $scope.isNewDisabled = function() {
          if (typeof $scope.disableFunctions?.isNewDisabled === "function") {
            return $scope.disableFunctions.isNewDisabled($scope.record, ctrlState.master, $scope[$scope.topLevelFormName]);
          } else {
            return false;
          }
        };

        $scope.setDefaults = function(formSchema: IFormInstruction[], base = ''): any {
          const retVal = {};
          formSchema.forEach(s => {
            if (s.defaultValue !== undefined) {
              const nameParts = s.name.replace(base, '').split(".");
              let target = retVal;
              for (let i = 0; i < nameParts.length - 1; i++) {
                  if (!target[nameParts[i]]) {
                    target[nameParts[i]] = {};
                  }                  
                  target = target[nameParts[i]];
              }
              target[nameParts[nameParts.length - 1]] = s.defaultValue;
            }
          });
          return retVal;
        };

        $scope.getVal = function(expression, index) {
          if (expression.indexOf("$index") === -1 || typeof index !== "undefined") {
            expression = expression.replace(/\$index/g, index);
            return $scope.$eval("record." + expression);
          }
          //else {
// Used to show error here, but angular seems to call before record is populated sometimes
//      throw new Error('Invalid expression in getVal(): ' + expression);
          //}
        };

        $scope.sortableOptions = {
          update: function (e, ui) {
              if (e.target.hasAttribute("disabled")) {
                  // where formsAngular.elemSecurityFuncBinding is set to "one-time" or "normal", the <ol> that the
                  // ui-sortable directive has been used with will have an ng-disabled that may or may not have caused
                  // a disabled attribute to be added to that element.  in the case where this attribute has been
                  // added, sorting should be prevented.
                  // allowing the user to begin the drag, and then preventing it only once they release the mouse button,
                  // doesn't seem like the best solution, but I've yet to find something that works better.  the
                  // cancel property (see commented-out code below) looks like it should work (and kind of does), but this
                  // screws up mouse events on input fields hosted within the draggable <li> items, so you're
                  // basically prevented from updating any form element in the nested schema
                  ui.item.sortable.cancel();
              } else if ($scope.topLevelFormName) {
                  $scope[$scope.topLevelFormName].$setDirty();
              }
          },
          // don't do this (see comment above)
          //cancel: "ol[disabled]>li"
      };

        $scope.setUpCustomLookupOptions = function (schemaElement: IFormInstruction, ids: string[], options: string[], baseScope: any): void {
          for (const scope of [$scope, baseScope]) {
            if (scope) {
              // need to be accessible on our scope for generation of the select options, and - for nested schemas -
              // on baseScope for the conversion back to ids done by prepareForSave 
              scope[schemaElement.ids] = ids;
              scope[schemaElement.options] = options;
            }                            
          }
          let data = getData($scope.record, schemaElement.name);
          if (!data) {
            return;
          }
          if (Array.isArray(data)) {
            data = data.filter((i) => i !== undefined && i !== null);
          }
          data = convertForeignKeys(schemaElement, data, options, ids);
          setData($scope.record, schemaElement.name, undefined, data);
        }        
      },

      fillFormFromBackendCustomSchema: fillFormFromBackendCustomSchema,

      fillFormWithBackendSchema: function fillFormWithBackendSchema($scope, formGeneratorInstance, recordHandlerInstance, ctrlState: IFngCtrlState) {

        SchemasService.getSchema($scope.modelName, $scope.formName)
          .then(function(response) {
            let schema: any = response.data;
            fillFormFromBackendCustomSchema(schema, $scope, formGeneratorInstance, recordHandlerInstance, ctrlState);
          }, $scope.handleHttpError);
      }
    };
  }
}
