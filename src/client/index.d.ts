declare module fng {
  export interface IFng extends angular.IModule {
    beforeProcess?: (scope: IFormScope, cb: (err?: Error) => void) => void;
    beforeHandleIncomingDataPromises?: () => angular.IPromise<any>[];
    pseudo?: (token: string, upperFirst: boolean) => string;
    title?: { prefix?: string; suffix?: string };
    // when provided, the named function (assumed to be present on $rootscope) will be used to determine the visibility
    // of menu items and control groups
    hiddenSecurityFuncName?: string;
    // when provided, the named function (assumed to be present on $rootscope) will be used to determine the disabled
    // state of menu items and individual form input controls
    disabledSecurityFuncName?: string;
    // when provided, the named function (assumed to be present on $rootscope) will be called each time a new page
    // or popup is accessed, providing the host app with the opportunity to confirm whether there are ANY hidden elements
    // at all on that page.  where there are not, we can optimise by skipping logic relating to DOM element visibility.
    skipHiddenSecurityFuncName?: string;
    // when provided, the named function (assumed to be present on $rootscope) will be called each time a new page
    // or popup is accessed, providing the host app with the opportunity to confirm whether there are ANY disabled elements
    // at all on that page.  where there are not, we can optimise by skipping logic relating to disabling DOM elements.
    skipDisabledSecurityFuncName?: string;
    // when provided, the named function (assumed to be present on $rootscope) will be called each time a new page
    // or popup is accessed, providing the host app with the opportunity to confirm whether there are ANY elements on that
    // page that require their child elements to be disabled.  where there are not, we can optimise by skipping 
    // disabled ancestor checks.
    skipDisabledAncestorSecurityFuncName?: string;
    // how the function identified by elemSecurityFuncName should be bound.  "instant" means that it will be called
    // as the markup is being constructed, with 'hidden' elements not included in the markup at all, and disabled elements
    // given a simple DISABLED attribute.  this is the most efficient approach.  "one-time" will add ng-hide and
    // ng-disabled directives to the relevant elements, with one-time binding to the security function.  this is
    // also reasonably efficient (but not as efficient as "instant", due to the need for watches).  "normal" will not use
    // one-time binding, which has the potential to be highly resource-intensive on large forms.  which
    // option is chosen will depend upon when the function identified by elemSecurityFuncName will be ready to
    // make the necessary determination.
    elemSecurityFuncBinding?: "instant" | "one-time" | "normal";
    hideableAttr?: string; // an attribute to mark all elements that can be hidden using security
    disableableAttr?: string; // an attribute to mark all elements that can be disabled using security
    disableableAncestorAttr?: string; // an attribute to mark all elements whose children can all be disabled using "disabled + children" security
    // if an element's id is a partial match on any of this array's contents, it will never be marked with hideableAttr/disableableAttr
    ignoreIdsForHideableOrDisableableAttrs?: string[];
    keyboardShortCuts? : {
      letter: string;
      keycode: number;
      id: string;
      desc: string;
    } [];
  }
  var formsAngular: IFng;

  /*
  Type definitions for types that are used on both the client and the server
   */
  type formStyle = "inline" | "vertical" | "horizontal" | "horizontalCompact" | "stacked";

  export interface IBaseArrayLookupReference {
    property: string;
    value: string;
  }

  interface ILookupItem {
    id: string;
    text: string;
  }
  /*
  IInternalLookupreference makes it possible to look up from a list (of key / value pairs) in the current record.  For example

  var ShelfSchema = new Schema({
    location: {type: String, required: true}
  });  // Note that this schema needs an _id as it is an internal lookup

  var ESchema = new Schema({
    warehouse_name: {type: String, list: {}},
    shelves: {type: [ShelfSchema]},
    favouriteShelf: {type: Schema.Types.ObjectId, internalRef: {property: 'shelves', value:'location'};
  });
   */
  export interface IFngInternalLookupReference extends IBaseArrayLookupReference {
    noConvert?: boolean; // can be used by a tricksy hack to get around nesting limitations
  }

  /*
  ILookupListReference makes it possible to look up from a list (of key / value pairs)
  in a document in another collection for example:

  const LSchemaDef : IFngSchemaDefinition = {
    descriptin: {type: String, required: true, list: {}},
    warehouse: {type: Schema.Types.ObjectId, ref:'k_referencing_self_collection', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}}},
    shelf: {type: Schema.Types.ObjectId, lookupListRef: {collection:'k_referencing_self_collection', id:'$warehouse', property: 'shelves', value:'location'}},
  };
  */
  export interface IFngLookupListReference extends IBaseArrayLookupReference {
    collection: string; // collection that contains the list
    /*
    Some means of calculating _id in collection.  If it starts with $ then it is property in record
    */
    id: string;
  }

  /*
  showWhen allows conditional display of fields based on values elsewhere.

  For example having prompted whether someone is a smoker you may want a field asking how many they smoke a day:
    smoker: {type: Boolean},
    howManyPerDay: {type: Number, form:{showWhen:{lhs:"$smoker", comp:"eq", rhs:true}}}

  As you can see from the example there are three parts to the showIf object:

  lhs (left hand side) a value to be compared. To use the current value of another field in the document preceed it with $.
  comp supported comparators are 'eq' for equality, 'ne' for not equals, 'gt' (greater than), 'gte' (greater than or equal to),
  'lt' (less than) and 'lte' (less than or equal to)
  rhs (right hand side) the other value to be compared. Details as for lhs.
   */
  export interface IFngShowWhen {
    lhs: any;
    comp: "eq" | "ne" | "gt" | "gte" | "lt" | "lte";
    rhs: any;
  }

  /*
  link allows the setting up of hyperlinks for lookup reference fields
  */
  export interface IFngLinkSetup {
    linkOnly?: boolean; // if true then the input element is not generated (this overrides label)
    label?: boolean; // Make a link out of the label (causes text to be overridden) (this overrides text)
    form?: string; // can be used to generate a link to a custom schema
    linktab?: string; // can be used to generate a link to a tab on a form
    text?: string; // the literal value used for the link. If this property is omitted then text is generated from the field values of the document referred to by the link.
  }

  export type FieldSizeString = "mini" | "small" | "medium" | "large" | "xlarge" | "xxlarge" | "block-level"; // sets control width.  Default is 'medium''

  export interface IFngSchemaTypeFormOpts {
    /*
      The input type to be generated - which must be compatible with the Mongoose type.
      Common examples are email, url.

      In addition to the standard HTML5 types there are some 'special' types:
        textarea: a textarea control
        radio: a radio button control
        select: a select control

      Note that if the field type is String and the name (or label) contains the string
      'password' then type="password" will be used unless type="text".

      If the Mongoose schema has an enum array you can specify a radio button group
      (instead of a select) by using a type of radio
     */
    type?: string;

    hidden?: boolean; // inhibits this schema key from appearing on the generated form.
    label?: string | null; // overrides the default input label. label:null suppresses the label altogether.
    ref?: string; // reference to another collection
    internalRef?: IFngInternalLookupReference;
    lookupListRef?: IFngLookupListReference;
    id?: string; // specifies the id of the input field (which defaults to f_name)

    placeHolder?: string; // adds placeholder text to the input (depending on data type).
    help?: string; // adds help text under the input.
    helpInline?: string; // adds help to the right of the input.
    popup?: string; // adds title (popup help) as specified.
    ariaLabel?: string; // adds aria-label as specified.
    order?: number; // allows user to specify the order / tab order of this field in the form. This overrides the position in the Mongoose schema.
    size?: FieldSizeString;
    readonly?: boolean | string; // adds the readonly or ng-readonly attribute to the generated input (currently doesn't work with date - and perhaps other types).
    rows?: number | "auto"; // sets the number of rows in inputs (such as textarea) that support this. Setting rows to "auto" makes the textarea expand to fit the content, rather than create a scrollbar.
    tab?: string; // Used to divide a large form up into a tabset with multiple tabs
    showWhen?: IFngShowWhen | string; // allows conditional display of fields based on values elsewhere.  string must be an abular expression.

    /*
      add: 'class="myClass"' allows custom styling of a specific input
    Angular model options can be used - for example add: 'ng-model-options="{updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 }}" '
    custom validation directives, such as the timezone validation in this schema
    */
    add?: string; //  allows arbitrary attributes to be added to the input tag.

    class?: string; // allows arbitrary classes to be added to the input tag.
    inlineRadio?: boolean; // (only valid when type is radio) should be set to true to present all radio button options in a single line
    link?: IFngLinkSetup; // handles displaying links for ref lookups
    asText?: boolean; // (only valid when type is ObjectId) should be set to true to force a simple text input rather than a select.  presumed for advanced cases where the objectid is going to be pasted in.

    /*
      With a select / radio type you can specify the options.
      You can either do this by putting the option values in an array and passing it directly, or by putting them in an
      array on the scope and passing the name of the array (which allows run-time modification
     */
    options?: Array<string> | string;

    /* Directive allows you to specify custom behaviour.

     Gets passed attributes from form-input (with schema replaced with the current element - so add can be used to pass data into directives).
     */
    directive?: string;
    /* Inhibits the forms-angular client from looking up the possible values for a
      IFngLookupReference or IFngInternalLookupReference field
      (when a directive has a an alternative way of handling things)
     */
    noLookup?: boolean;

    /*
    The next few options relate to the handling and display of arrays (including arrays of subdocuments)
     */
    noAdd?: boolean | string; // inhibits an Add button being generated for arrays.
    noneIndicator?: boolean; // show "None" where there's no add button and no array items
    unshift?: boolean; // (for arrays of sub documents) puts an add button in the sub schema header which allows insertion of new sub documents at the beginning of the array.
    noRemove?: boolean | string; // inhibits a Remove button being generated for array elements.
    formstyle?: formStyle; // (only valid on a sub schema) sets style of sub form.
    sortable?: boolean | string; // Allows drag and drop sorting of arrays - requires angular-ui-sortable
    ngClass?: string; // Allows for conditional per-item styling through the addition of an ng-class expression to the class list of li elements created for each item in the array
    filterable?: boolean; // Add a data-ng-hide to all array elements, referring to subDoc._hidden.  Does not actually (yet) provide a UI for managing this property, however (which needs to be done via an external directive)
    subDocContainerType?:
      | "fieldset"
      | "well"
      | "well-large"
      | "well-small"
      | string
      | ((info) => { before: ""; after: "" }); // allows each element in the array to be nested in a container
    subDocContainerProps?: any; // the parameters that will be passed if subDocContainerType is a function

    /*
    The next section relates to the display of sub documents
     */
    customSubDoc?: string; // Allows you to specify custom HTML (which may include directives) for the sub doc
    customHeader?: string; // Allows you to specify custom HTML (which may include directives) for the header of a group of sub docs
    customFooter?: string; // Allows you to specify custom HTML (which may include directives) for the footer of a group of sub docs

    /*
      Suppresses warnings about attenpting deep nesting which would be logged to console in some circumstances when a
      directive fakes deep nesting
     */
    suppressNestingWarning?: boolean;
  }

  // Schema passed from server - derived from Mongoose schema
  export interface IFieldViewInfo extends IFngSchemaTypeFormOpts {
    name: string;
    schema?: Array<IFieldViewInfo>;
    array?: boolean;
    showIf?: any;
    required?: boolean;
    step?: number;
  }

  export type fieldType =
    | "string"
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "link"
    | "date"
    | "checkbox"
    | "password"
    | "radio";

  // Schema used internally on client - often derived from IFieldViewInfo passed from server
  export interface IFormInstruction extends IFieldViewInfo {
    id?: string; // id of generated DOM element
    nonUniqueId?: string; // where this field is part of a sub-sub-schema, id is likely to include $index from the sub-schema, to ensure uniqueness.  provide it here without reference to $parent.$index for use in security evaluations.
    type?: fieldType;
    defaultValue?: any;
    rows?: number;
    label?: string;
    options?: any;
    ids?: any;
    hidden?: boolean;
    tab?: string;
    add?: string;
    ref?: any;
    link?: any;
    linktext?: string;
    linklabel?: boolean;
    form?: string; // the form that is linked to
    select2?: any; // deprecated
    schema?: IFormInstruction[]; // If the field is an array of fields
    intType?: "date";
    coloffset?: number;
    [directiveOptions: string]: any;
  }

  interface IContainerInstructions {
    before?: string;
    after?: string;
    omit?: boolean;
  }

  export type HiddenTabReintroductionMethod = "none" | "tab";

  export interface IContainer {
    /*
      Type of container, which determines markup.  This is currently only available when the schema is generated by
      the client for use independent of the BaseController
      In the case of a string which does not match one of the predefined options
      the generated container div is given the class of the name
     */
    containerType: "fieldset" | "well" | "tabset" | "tab" | "+tab" | "well-large" | "well-small" | string | ((info: IContainer) => IContainerInstructions);
    title?: string;
    /*
      Applies only to tabs - causing them to be rendered with a x for closing ('hiding') the tab in question.
      Where hideable is true, hiddenTabArrayProp can be used to specify a property name (which can include ".", and which
      will be assumed to identiy an array) that should be used to store the ids of closed ('hidden') tabs.  
      Where this is not specified, record.hiddenTabs will be used.
      If hiddenTabReintroductionMethod is set to "tab", an additional tab will be added to the end of the tabset
      with a + heading, and clicking on this will provide a UI for re-introducing hidden tabs.
    */
    hideable?: boolean;
    hiddenTabArrayProp?: string;
    hiddenTabReintroductionMethod?: HiddenTabReintroductionMethod;
    /*
      h1...h6 will use a header style
      anything else will be used as a paragraph stype
     */
    titleTagOrClass?: string;
    content: IFormSchemaElement[];
  }

  export type IFormSchemaElement = IFormInstruction | IContainer;

  export type IFormSchema = IFormSchemaElement[];
  export type IControlledFormSchema = IFormInstruction[];

  export interface IEnumInstruction {
    repeat: string;
    value: string;
    label?: string;
  }

  export interface IFngCtrlState {
    master: any;
    allowLocationChange: boolean; // Do we allow location change or prompt for permission
  }
  export interface IRecordHandlerService {
    convertToMongoModel(schema: IControlledFormSchema, anObject: any, prefixLength: number, scope: IFormScope): any;
    createNew(dataToSave: any, options: any, scope: IFormScope, ctrlState: IFngCtrlState): void;
    deleteRecord(id: string, scope: IFormScope, ctrlState: IFngCtrlState): void;
    updateDocument(dataToSave: any, options: any, scope: IFormScope, ctrlState: IFngCtrlState): void;
    beginReadingRecord($scope: IFormScope): void;
    finishReadingThenProcessRecord($scope: IFormScope, ctrlState): void;
    scrollTheList($scope: IFormScope);
    getListData(record, fieldName, listSchema?, $scope?: IFormScope);
    suffixCleanId(inst, suffix);
    setData(object, fieldname: string, element, value);
    getData(object, fieldname: string, element?: any);
    setUpLookupOptions(lookupCollection, schemaElement, $scope: IFormScope, ctrlState, handleSchema);
    setUpLookupListOptions: (
      ref: IFngLookupListReference,
      formInstructions: IFormInstruction,
      $scope: IFormScope,
      ctrlState: IFngCtrlState
    ) => void;
    handleInternalLookup($scope: IFormScope, formInstructions, ref): void;
    preservePristine(element, fn): void;
    convertIdToListValue(id, idsArray, valuesArray, fname);
    decorateScope($scope: IFormScope, $uibModal, recordHandlerInstance: IRecordHandlerService, ctrlState);
    fillFormFromBackendCustomSchema(
      schema,
      $scope: IFormScope,
      formGeneratorInstance,
      recordHandlerInstance,
      ctrlState
    );
    fillFormWithBackendSchema($scope: IFormScope, formGeneratorInstance, recordHandlerInstance, ctrlState);
    handleError($scope: IFormScope);
    convertToAngularModel($scope: IFormScope);
    convertToAngularModelWithSchema(schema: IControlledFormSchema, data, $scope: IFormScope)
  }

  export interface IFormGeneratorService {
    generateEditUrl(obj, $scope: IFormScope): string;
    generateViewUrl(obj, $scope: IFormScope): string;
    generateNewUrl($scope: IFormScope): string;
    handleFieldType(formInstructions, mongooseType, mongooseOptions, $scope: IFormScope, ctrlState);
    handleSchema(
      description: string,
      source,
      destForm,
      destList,
      prefix,
      doRecursion: boolean,
      $scope: IFormScope,
      ctrlState
    );
    updateDataDependentDisplay(curValue, oldValue, force, $scope: IFormScope);
    add(fieldName: string, $event, $scope: IFormScope, modelOverride?: any);
    unshift(fieldName: string, $event, $scope: IFormScope, modelOverride?: any);
    remove(fieldName: string, value, $event, $scope: IFormScope, modelOverride?: any);
    hasError(formName, name, index, $scope: IFormScope);
    decorateScope($scope: IFormScope, formGeneratorInstance: IFormGeneratorService, recordHandlerInstance: IRecordHandlerService, sharedStuff, pseudoUrl?: string);
  }

  export interface IFngSingleLookupHandler {
    formInstructions: IFormInstruction;
    lastPart: string;
    possibleArray: string;
    // If the looked-up record changes, we use these fields to see if the old lookup value also exists in the new lookup record
    oldValue?: string | string[];
    oldId?: string | string[];
  }

  export interface IFngLookupHandler {
    lookupOptions: string[];
    lookupIds: string[];
    handlers: IFngSingleLookupHandler[];
  }

  export interface IFngInternalLookupHandlerInfo extends IFngLookupHandler {
    ref: IFngInternalLookupReference;
  }

  export interface IFngLookupListHandlerInfo extends IFngLookupHandler {
    ref: IFngLookupListReference;
  }

  // we cannot use an enum here, so this will have to do.  these are the values expected to be returned by the
  // function on $rootScope with the name formsAngular.disabledSecurityFuncName.
  //   false = not disabled,
  //   true = disabled,
  //   "+" = this and all child elements disabled
  export type DisabledOutcome = boolean | "+";

  export interface ISecurableScope extends angular.IScope {
    // added by ISecurityService
    isSecurelyHidden: (elemId: string) => boolean;
    isSecurelyDisabled: (elemId: string) => boolean;
    requiresDisabledChildren: (elemId: string) => boolean;
  }

  /*
    The scope which contains form data
   */
  export interface IFormScope extends ISecurableScope {
    sharedData: any;
    modelNameDisplay: string;
    modelName: string;
    formName: string;
    alertTitle: any;
    errorVisible: boolean;
    errorMessage: any;
    errorHideTimer: number;
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
    whyDisabled: string;
    unconfirmedDelete: boolean;
    getVal: any;
    sortableOptions: any;
    tabs?: Array<any>; // In the case of forms that contain a tab set
    tab?: string; // title of the active tab - from the route
    activeTabNo?: number;
    topLevelFormName: string; // The name of the form
    record: any;
    originalData: any; // the unconverted data read from the server
    phase: any;
    disableFunctions: any;
    dataEventFunctions: any;
    listSchema: any;
    recordList: any;
    dataDependencies: any;
    internalLookups: IFngInternalLookupHandlerInfo[];
    listLookups: IFngLookupListHandlerInfo[];
    conversions: any;
    pageSize: any;
    pagesLoaded: any;
    redirectOptions?: { redirect?: string; allowChange?: boolean };
    cancel: () => any;
    showError: (error: any, alertTitle?: string) => void;
    prepareForSave: (cb: (error: string, dataToSave?: any) => void) => void;
    setDefaults: (formSchema: IFormSchema, base?: string) => any;
    formSchema: IControlledFormSchema;
    baseSchema: () => Array<any>;
    setFormDirty: any;
    dirtyChecked?: boolean;
    add: any;
    hideTab: (event, tabTitle: string, hiddenTabArrayProp: string) => void;
    addTab: (event, tabTitle: string, hiddenTabArrayProp: string) => void;
    hasError: any;
    unshift: any;
    remove: any;
    openSelect2: any;
    toJSON: any;
    skipCols: any;
    setPristine: any;
    generateEditUrl: any;
    generateViewUrl: any;
    generateNewUrl: any;
    scrollTheList: any;
    getListData: any;
    phaseWatcher: any;
    dismissError: () => void;
    stickError: () => void;
    clearTimeout: () => void;
    handleHttpError: (response: any) => void;
    dropConversionWatcher: () => void;
    readingRecord?: angular.IPromise<any>;
    onSchemaFetch?: (description: string, source: IFieldViewInfo[]) => void;
    onSchemaProcessed?: (description: string, formSchema: IFormInstruction[]) => void;
    updateQueryForTab?: (tab: string) => void;
    showLoading? : boolean;  // a spinner that fades in
    showSpinner? : boolean;  // an immediate spinner
    tabDeselect?: ($event: any, $selectedIndex: number) => void;
    setUpCustomLookupOptions?: (
      schemaElement: IFormInstruction,
      ids: string[],
      options: string[],
      baseScope: any
    ) => void;
  }

  export interface IContextMenuDivider {
    divider: boolean;
  }
  export interface IContextMenuBaseOption {
    // provided to the security hook (see elemSecurityFuncName) - optional where that is not being used
    id?: string;

    text?: string;
    textFunc?: () => string;
    isDisabled?: () => boolean;
    isHidden?: () => boolean;

    // Does the option appear in the following contexts?
    listing: boolean;
    creating: boolean;
    editing: boolean;
  }
  export interface IContextSubMenuOption extends IContextMenuBaseOption {
    items: ContextMenuItem[];
  }
  export interface IContextMenuOption extends IContextMenuBaseOption{
    // For it to make any sense, a menu option needs one of the next three properties
    url?: string;
    fn?: (...args: any) => void;
    urlFunc?: () => string;
    broadcast?: string;
    args?: any[];
  }
  export type ContextMenuItem = IContextMenuOption | IContextSubMenuOption | IContextMenuDivider;

  export interface IModelCtrlService {
    loadControllerAndMenu: (sharedData: any, titleCaseModelName: string, level: number, needDivider: boolean, scope: angular.IScope) => void;
  }

  export interface IModelController extends IFormScope {
    onBaseCtrlReady?: (baseScope: IFormScope) => void; // Optional callback after form is instantiated
    onAllReady?: (baseScope: IFormScope) => void; // Optional callback after form is instantiated and populated
    contextMenu?: ContextMenuItem[];
    contextMenuPromise?: Promise<ContextMenuItem[]>;
  }

  export interface IBaseFormOptions {
    /**
     * The style of the form layout.  Supported values are horizontalcompact, horizontal, vertical, inline
     */
    //TODO supported values should be in an enum
    formstyle?: formStyle;
    /**
     * Model on form scope (defaults to record).
     * <li><strong>model</strong> the object in the scope to be bound to the model controller.  Specifying
     * the model inhibits the generation of the <strong>form</strong> tag unless the <strong>forceform</strong> attribute is set to true</li>
     */
    model?: string;
    /**
     * The name to be given to the form - defaults to myForm
     */
    name?: string;
    /**
     * Normally first field in a form gets autofocus set.  Use this to prevent this
     */
    noautofocus?: string;
    /*
    Suppress the generation of element ids
    (sometimes required when using nested form-inputs in a directive)
     */
    noid?: boolean;
  }

  export interface IFormAttrs extends IFormOptions, angular.IAttributes {
    /**
     * Schema used by the form
     */
    schema: string;
    forceform?: string; // Must be true or omitted.  Forces generation of the <strong>form</strong> tag when model is specified
    noid?: boolean;
  }

  export interface IFormOptions extends IBaseFormOptions {
    schema?: string;
    subkey?: string;
    subkeyno?: number;
    subschema?: string;
    subschemaroot?: string;
    viewform?: boolean;
    suppressNestingWarning?: boolean;
  }

  export interface IBuiltInRoute {
    route: string;
    state?: string;
    templateUrl?: string;
    options?: {
      authenticate?: boolean;
      templateUrl?: string | (() => void);
      template?: string;
      controller?: string;      
    }
  }

  export interface IRoutingConfig {
    hashPrefix?: string;
    html5Mode: boolean;
    routing: string; // What sort of routing do we want?  ngroute or uirouter.
    // TODO Should be enum
    prefix: string; // How do we want to prefix out routes?  If not empty string then first character must be slash (which is added if not)
    // for example '/db' that gets prepended to all the generated routes.  This can be used to
    // prevent generated routes (which have a lot of parameters) from clashing with other routes in
    // the web app that have nothing to do with CRUD forms
    fixedRoutes?: Array<IBuiltInRoute>;
    templateFolder?: string; // The folder where the templates for base-list, base-edit and base-analysis live.  Internal templates used by default.  For pre 0.7.0 behaviour use 'partials/'
    add2fngRoutes?: any; // An object to add to the generated routes.  One use case would be to add {authenticate: true}
    // so that the client authenticates for certain routes

    variantsForDemoWebsite?: any; // Just for demo website
    variants?: any; // Just for demo website
    onDelete?: string; // Supports literal (such as '/') or 'new' (which will go to a /new of the model) default is to go to the list view
  }

  export interface IFngRoute {
    newRecord?: boolean;
    analyse?: boolean;
    modelName?: string;
    reportSchemaName?: string;
    id?: string;
    formName?: string;
    tab?: string;
    variant?: string; // TODO should be enum of supported frameworks
  }

  interface IBuildingBlocks {
    common: string;
    sizeClassBS3: string;
    sizeClassBS2: string;
    compactClass: string;
    formControl: string;
    modelString: string;
    disableableAncestorStr: string;
  }

  interface IProcessedAttrs {
    info: IFormInstruction;
    options: IFormOptions;
    directiveOptions: any;
  }

  interface IGenDisableStrParams {
    forceNg?: boolean;
    nonUniqueIdSuffix?: string;
  }
  

  interface IPluginHelperService {
    extractFromAttr: (
      attr: any,
      directiveName: string,
      scope: fng.IFormScope
    ) => { info: IFormInstruction; options: IFormOptions; directiveOptions: any };
    buildInputMarkup: (
      scope: angular.IScope,
      attrs: any,
      params: {
        processedAttrs?: IProcessedAttrs;
        fieldInfoOverrides?: Partial<IFormInstruction>;
        optionOverrides?: Partial<IFormOptions>;
        addButtons?: boolean;
        needsX?: boolean;
      },
      generateInputControl: (buildingBlocks: IBuildingBlocks) => string
    ) => string;
    genIdString: (scope: angular.IScope, processedAttrs: IProcessedAttrs, idSuffix: string) => string;
    genDisabledStr: (
      scope: angular.IScope,
      processedAttrs: IProcessedAttrs,
      idSuffix: string,
      params?: fng.IGenDisableStrParams
    ) => string;
    genIdAndDisabledStr: (
      scope: angular.IScope,
      processedAttrs: IProcessedAttrs,
      idSuffix: string,
      params?: fng.IGenDisableStrParams
    ) => string;
    genDateTimePickerDisabledStr: (scope: angular.IScope, processedAttrs: IProcessedAttrs, idSuffix: string) => string;
    genDateTimePickerIdAndDisabledStr: (
      scope: angular.IScope,
      processedAttrs: IProcessedAttrs,
      idSuffix: string
    ) => string;
    genUiSelectIdAndDisabledStr: (
      scope: angular.IScope,
      processedAttrs: IProcessedAttrs,
      idSuffix: string
    ) => string;
    handlePseudos: (scope: fng.IFormScope, str: string) => string;
    genDisableableAncestorStr: (processedAttrs: IProcessedAttrs) => string;
  }

  interface ISecurityVisibility {
    omit?: boolean;
    visibilityAttr?: string;
  }

  interface IGenerateDisableAttrParams {
    attr?: string;
    attrRequiresValue?: boolean;
    forceNg?: boolean;
  }

  type SecurityType = "hidden" | "disabled";
  
  interface ISecurityService {
    canDoSecurity: (type: SecurityType) => boolean;
    canDoSecurityNow: (scope: fng.ISecurableScope, type: SecurityType) => boolean;
    isSecurelyHidden: (elemId: string, pseudoUrl?: string) => boolean;
    isSecurelyDisabled: (elemId: string, pseudoUrl?: string) => boolean;
    decorateSecurableScope: (securableScope: ISecurableScope, params?: { pseudoUrl?: string, overrideSkipping?: boolean }) => void;
    doSecurityWhenReady: (cb: () => void) => void;
    considerVisibility: (id: string, scope: fng.ISecurableScope) => ISecurityVisibility;
    considerContainerVisibility: (contentIds: string[], scope: fng.ISecurableScope) => fng.ISecurityVisibility;
    getDisableableAttrs: (id: string) => string;
    getHideableAttrs: (id: string) => string;
    getDisableableAncestorAttrs: (id: string) => string;
    generateDisabledAttr: (id: string, scope: fng.ISecurableScope, params?: IGenerateDisableAttrParams) => string;
  }

  interface IListQueryOptions {
    limit?: number;
    find?: any; // e.g., { "careWorker.isCareWorker": true }
    aggregate?: any;
    projection?: any;
    order?: any; // e.g., { familyName: -1, givenName: -1 }
    skip?: number;
    concatenate?: boolean; // whether the list fields should be concatenated into a single .text property
  }

  interface ISubmissionsService {
    // return all of the list attributes of the record from db.<modelName>.<id>
    // where returnRaw is true, the document (albeit with only its list attributes present) will be returned without transformation
    // otherwise, the list fields will be concatenated (space-seperated) and returned as the list property of a record { list: string }
    // e.g., "John Doe", in the case of a person
    getListAttributes: (
      modelName: string,
      id: string,
      returnRaw?: boolean
    ) => angular.IHttpPromise<{ list: string } | any>;
    readRecord: (modelName: string, id: string, formName?: string) => angular.IHttpPromise<any>;
    getAll: (modelName: string, _options: any) => angular.IHttpPromise<any[]>;
    getAllListAttributes: (ref: string) => angular.IHttpPromise<ILookupItem[]>;
    getAllPickListAttributes: (ref: string) => angular.IHttpPromise<ILookupItem[]>;
    getPagedAndFilteredList: (
      modelName: string,
      options: IListQueryOptions
    ) => angular.IHttpPromise<any[]>;
    getPagedAndFilteredListFull: (
      modelName: string,
      options: IListQueryOptions
    ) => angular.IHttpPromise<any[]>;
    deleteRecord: (model: string, id: string, formName: string) => angular.IHttpPromise<void>;
    updateRecord: (modelName: string, id: string, dataToSave: any, formName?: string) => angular.IHttpPromise<any>;
    createRecord: (modelName: string, dataToSave: any, formName?: string) => angular.IHttpPromise<any>;
    useCache: (val: boolean) => void;
    clearCache: () => void;
    getCache: () => boolean;
  }

  interface IRoutingServiceProvider {
    start: (options: IRoutingConfig) => void;
    addRoutes: (fixedRoutes: Array<IBuiltInRoute>, fngRoutes:Array<IBuiltInRoute>) => void;
    registerAction: (action: string) => void;
    $get: () => IRoutingService;
  }

  interface IRoutingService {
    router: () => string;
    prefix: () => string;
    parsePathFunc: () => (location: string) => void;
    html5hash: () => string;
    buildUrl: (path: string) => string;
    buildOperationUrl: (
      operation: string,
      modelName: string,
      formName: string,
      id: string,
      tabName?: string
    ) => string;
    redirectTo: () => (operation: string, scope: IFormScope, LocationService: angular.ILocationService, id?: string, tab?: string) => void;
  }

  interface ICssFrameworkServiceProvider {
    setOptions: (options: { framework: string }) => void;
    $get: () => ICssFrameworkService;
  }

  interface ICssFrameworkService {
    framework: () => string;
    span: (cols: number) => string;
    offset: (cols: number) => string;
    rowFluid: () => string;
  }

  interface IFngUiSelectHelperService {
    windowChanged: (width: number, height: number) => boolean;
    addClientLookup: (lkpName: string, lkpData: any) => void;
    clearCache: () => void;
    lookupFunc: (value: string, formSchema: IFormInstruction, cb: (formSchema: IFormInstruction, value: ILookupItem ) => void) => void;
    doOwnConversion: (scope: IFormScope, processedAttrs: any, ref: string) => void;
  }

  interface IFormMarkupHelperService {
    isHorizontalStyle: (formStyle: string, includeStacked: boolean) => boolean;
    isArrayElement: (scope: angular.IScope, info: fng.IFormInstruction, options: fng.IFormOptions) => boolean;
    fieldChrome: (scope: fng.IFormScope, info: fng.IFormInstruction, options: fng.IFormOptions) => { omit?: boolean, template?: string, closeTag?: string };
    label: (scope: fng.IFormScope, fieldInfo: fng.IFormInstruction, addButtonMarkup: boolean, options: fng.IFormOptions) => string;
    glyphClass: () => string;
    allInputsVars: (scope: angular.IScope, fieldInfo: fng.IFormInstruction, options: fng.IFormOptions, modelString: string, idString: string, nameString: string) => Partial<fng.IBuildingBlocks>;
    inputChrome: (value: string, fieldInfo: fng.IFormInstruction, options: fng.IFormOptions, markupVars) => string;
    generateSimpleInput: (common: string, fieldInfo: fng.IFormInstruction, options: fng.IFormOptions) => string;
    controlDivClasses: (options: fng.IFormOptions, fieldInfo: fng.IFormInstruction) => string[];
    handleInputAndControlDiv: (inputMarkup: string, controlDivClasses: string[]) => string;
    handleArrayInputAndControlDiv: (inputMarkup: string, controlDivClasses: string[], scope: fng.IFormScope, info: fng.IFormInstruction, options: fng.IFormOptions) => string;
    addTextInputMarkup: (allInputsVars: Partial<fng.IBuildingBlocks>, fieldInfo: fng.IFormInstruction, requiredStr: string) => string;
    handleReadOnlyDisabled: (partialFieldInfo: { name: string, id?: string, nonUniqueId?: string, readonly?: boolean | string }, scope: fng.IFormScope) => string[];
    generateArrayElementIdString: (idString: string, info: fng.IFormInstruction, options: fng.IFormOptions) => string;
    genDisableableAncestorStr: (id: string) => string;
    generateNgShow: (showWhen: IFngShowWhen, model: string) => string;
    handlePseudos: (scope: fng.IFormScope, str: string, dynamicFuncName?: string) => string;
  }
}

declare var formsAngular: fng.IFng;
