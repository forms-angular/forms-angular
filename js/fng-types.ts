/// <reference path="../typings/angularjs/angular.d.ts" />

module fng {

  export interface IFieldViewInfo {
    name: string;
    schema: Array<IFieldViewInfo>;
    array: boolean;
    id? : string;
    showIf? : any;
  }

  export interface IRecordHandler {
    convertToMongoModel(schema: Array<IFieldViewInfo>, anObject: any, prefixLength: number, scope: fng.IFormScope): any;
    createNew(dataToSave: any, options: any, scope: fng.IFormScope): void;
    deleteRecord(model: any, id: any, scope: fng.IFormScope, ctrlState: any): void;
    updateDocument(dataToSave : any, options: any, scope: fng.IFormScope, ctrlState: any) : void;
    readRecord($scope: fng.IFormScope, ctrlState);
    scrollTheList($scope: fng.IFormScope);
    getListData(record, fieldName, select2List);
    suffixCleanId(inst, suffix);
    setData(object, fieldname, element, value);
    setUpSelectOptions(lookupCollection, schemaElement, $scope: fng.IFormScope, ctrlState, handleSchema);
    preservePristine(element, fn): void;
    convertIdToListValue(id, idsArray, valuesArray, fname);
    decorateScope($scope:fng.IFormScope, $uibModal, recordHandlerInstance : fng.IRecordHandler, ctrlState);
    fillFormFromBackendCustomSchema(schema, $scope:fng.IFormScope, formGeneratorInstance, recordHandlerInstance, ctrlState);
    fillFormWithBackendSchema($scope: fng.IFormScope, formGeneratorInstance, recordHandlerInstance, ctrlState);
    handleError($scope: fng.IFormScope);
  }

  export interface IFormGenerator {
    generateEditUrl(obj, $scope:fng.IFormScope): string;
    generateNewUrl($scope: fng.IFormScope): string;
    handleFieldType(formInstructions, mongooseType, mongooseOptions, $scope: fng.IFormScope, ctrlState);
    handleSchema(description: string, source, destForm, destList, prefix, doRecursion: boolean, $scope: fng.IFormScope, ctrlState);
    updateDataDependentDisplay(curValue, oldValue, force, $scope: fng.IFormScope);
    add(fieldName, $event, $scope: fng.IFormScope);
    unshift(fieldName, $event, $scope: fng.IFormScope);
    remove(fieldName, value, $event, $scope: fng.IFormScope);
    hasError(formName, name, index, $scope: fng.IFormScope);
    decorateScope($scope: fng.IFormScope, formGeneratorInstance, recordHandlerInstance: fng.IRecordHandler, sharedStuff);
  }

  /*
    The scope which contains form data
   */
  export interface IFormScope extends angular.IScope {
    modelNameDisplay : string;
    modelName: string;
    formName: string;
    cancel(): any;
    showError: any;
    alertTitle: any;
    errorMessage: any;
    save: any;
    newRecord: boolean;
    id: any;
    newClick: any;
    deleteClick: any;
    isDeleteDisabled: any;
    isCancelDisabled: any;
    isNewDisabled: any;
    isSaveDisabled: any;
    disabledText: any;
    getVal: any;

    tabs?: Array<any>;              // In the case of forms that contain a tab set
    topLevelFormName: string;       // The name of the form
    record: any;
    phase: any;
    disableFunctions: any;
    dataEventFunctions: any;
    listSchema: any;
    recordList: any;
    dataDependencies: any;
    conversions: any;
    pageSize: any;
    pagesLoaded: any;
    select2List: any;
    formSchema: Array<IFieldViewInfo>;

    //functions
    baseSchema() : Array<any>;
    setFormDirty: any;
    add: any;
    hasError: any;
    unshift: any;
    remove: any;
    openSelect2: any;
    toJSON: any;
    skipCols: any;
    setPristine: any;
    generateEditUrl: any;
    generateNewUrl: any;
    scrollTheList: any;
    getListData: any;
    dismissError: any;
    handleHttpError(data: any, status: number): void;
  }

  export interface IBaseFormOptions {
    /**
     * The style of the form layout.  Supported values are horizontalcompact, horizontal, vertical, inline
     */
    //TODO supported values should be in an enum
    formstyle?: string;
    /**
     * Model on form scope (defaults to record).
     * <li><strong>model</strong> the object in the scope to be bound to the model controller.  Specifying
     * the model inhibits the generation of the <strong>form</strong> tag unless the <strong>forceform</strong> attribute is set to true</li>
     */
    model? : string;
    /**
     * The name to be given to the form - defaults to myForm
     */
    name?: string;
    /**
     * Normally first field in a form gets autofocus set.  Use this to prevent this
     */
    noautofocus?: string;
  }

  export interface IFormAttrs extends IFormOptions, angular.IAttributes {
    /**
     * Schema used by the form
     */
    schema : string;
    forceform?: string;    // Must be true or omitted.  Forces generation of the <strong>form</strong> tag when model is specified
  }

  export interface IFormOptions extends IBaseFormOptions {
    schema? : string;
    subkey?: string;
    subkeyno?: number;
    subschema? : string;
    subschemaroot? : string;
  }

  export interface IBuiltInRoute {
    route: string;
    state: string;
    templateUrl: string;
    options? : any;
  }

  export interface IRoutingConfig {
    hashPrefix: string;
    html5Mode: boolean;
    routing: string;                // What sort of routing do we want?  ngroute or uirouter.
                                    // TODO Should be enum
    prefix: string;                 // How do we want to prefix out routes?  If not empty string then first character must be slash (which is added if not)
                                    // for example '/db' that gets prepended to all the generated routes.  This can be used to
                                    // prevent generated routes (which have a lot of parameters) from clashing with other routes in
                                    // the web app that have nothing to do with CRUD forms
    fixedRoutes?: Array<IBuiltInRoute>;
    add2fngRoutes?: any;            // An object to add to the generated routes.  One user case would be to add {authenticate: true}
                                    // so that the client authenticates for certain routes

    variantsForDemoWebsite? : any;  // Just for demo website
    variants?: any;                 // Just for demo website
  }

  export interface IFngRoute {
    newRecord?:           boolean;
    analyse?:             boolean;
    modelName?:           string;
    reportSchemaName? :   string;
    id? :                 string;
    formName? :           string;
    tab? :                string;
    variant? :            string;    // TODO should be enum of supported frameworks
  }

}
