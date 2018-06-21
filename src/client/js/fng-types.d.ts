declare module fng {
  var formsAngular: angular.IModule;

  // Schema passed from server - derived from Mongoose schema
  export interface IFieldViewInfo {
    name: string;
    schema?: Array<IFieldViewInfo>;
    array?: boolean;
    showIf? : any;
    showWhen? : string;
    directive?: string;
    required?: boolean;
    step? : number;
    noLookup? : boolean;
    readonly? : boolean;
    help? : string;
    size? : string;
  }

  // Schema used internally on client - often derived from IFieldViewInfo pased from server
  export interface IFormInstruction extends IFieldViewInfo {
    id? : string;   // id of generated DOM element
    type?: 'string' | 'text' | 'textarea' | 'number' | 'select' | 'link' | 'date' | 'checkbox' | 'password';
    rows? : number
    label: string;
    options?: any;
    ids?: any;
    hidden?: boolean;
    tab?: string;
    add? : string;
    ref? : string;
    link? : any;
    linkText?: string;
    form?: string;           // the form that is linked to
    select2? : any;          // deprecated
  }

  export interface IEnumInstruction {
    repeat: string;
    value: string;
    label? : string;
  }

  export interface IRecordHandler {
    convertToMongoModel(schema: Array<IFieldViewInfo>, anObject: any, prefixLength: number, scope: fng.IFormScope): any;
    createNew(dataToSave: any, options: any, scope: fng.IFormScope): void;
    deleteRecord(model: any, id: any, scope: fng.IFormScope, ctrlState: any): void;
    updateDocument(dataToSave : any, options: any, scope: fng.IFormScope, ctrlState: any) : void;
    readRecord($scope: fng.IFormScope, ctrlState);
    scrollTheList($scope: fng.IFormScope);
    getListData($scope: fng.IFormScope, record, fieldName, listSchema);
    suffixCleanId(inst, suffix);
    setData(object, fieldname, element, value);
    setUpLookupOptions(lookupCollection, schemaElement, $scope: fng.IFormScope, ctrlState, handleSchema);
    handleInternalLookup($scope: fng.IFormScope, formInstructions, ref): void;
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
    sharedData: any;
    modelNameDisplay : string;
    modelName: string;
    formName: string;
    cancel(): any;
    showError: (error: any, alertTitle? : string) => void;
    alertTitle: any;
    errorMessage: any;
    prepareForSave: (cb: (error: string, dataToSave?: any) => void) => void;
    save: any;
    newRecord: boolean;
    initialiseNewRecord?: any;
    id: any;
    newClick: any;
    deleteClick: any;
    isDeleteDisabled: any;
    isCancelDisabled: any;
    isNewDisabled: any;
    isSaveDisabled: any;
    disabledText: any;
    unconfirmedDelete: boolean;
    getVal: any;
    sortableOptions: any;
    tabDeselect: any;
    tabs?: Array<any>;              // In the case of forms that contain a tab set
    tab?: string;                   // title of the active tab - from the route
    activeTabNo?: number;
    topLevelFormName: string;       // The name of the form
    record: any;
    originalData: any;              // the unconverted data read from the server
    phase: any;
    disableFunctions: any;
    dataEventFunctions: any;
    listSchema: any;
    recordList: any;
    dataDependencies: any;
    conversions: any;
    pageSize: any;
    pagesLoaded: any;
    formSchema: IFormInstruction[];

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
    handleHttpError(response: any): void;
    dropConversionWatcher: () => void;
  }

  export interface IContextMenuDivider {
    divider: boolean;
  }
  export interface IContextMenuOption {
    // For it to make any sense, a menu option needs one of the next two properties
    url?: string;
    fn?: () => void;

    text: string;
    isDisabled?: () => boolean;

    // Does the option appear in the following contexts?
    listing: boolean;
    creating: boolean;
    editing: boolean;
  }

  export interface IModelController extends IFormScope {
    onBaseCtrlReady? : (baseScope: IFormScope) => void;   // Optional callback after form is instantiated
    onAllReady? : (baseScope: IFormScope) => void;        // Optional callback after form is instantiated and populated
    contextMenu? : Array<IContextMenuOption | IContextMenuDivider>
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
    templateFolder?: string;        // The folder where the templates for base-list, base-edit and base-analysis live.  Internal templates used by default.  For pre 0.7.0 behaviour use 'partials/'
    add2fngRoutes?: any;            // An object to add to the generated routes.  One use case would be to add {authenticate: true}
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

declare var formsAngular: angular.IModule;
