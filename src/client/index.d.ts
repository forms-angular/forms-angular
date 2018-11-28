declare module fng {
  var formsAngular: angular.IModule;

  /*
  Type definitions for types that are used on both the client and the server
   */

  export interface IFngLookupReference {
    type: 'lookup';
    collection: string
  }

  /*
  IInternalLookupreference makes it possible to look up from a list (of key / value pairs) in the current record.  For example

  var ShelfSchema = new Schema({
    location: {type: String, required: true}
  });  // Note that this schema needs an _id as it is an internal lookup

  var ESchema = new Schema({
    warehouse_name: {type: String, list: {}},
    shelves: {type: [ShelfSchema]},
    favouriteShelf: {type: Schema.Types.ObjectId, ref: {type: 'internal', property: 'shelves', value:'location'};
  });
   */
  export interface IFngInternalLookupReference {
    type: 'internal';
    property: string;
    value: string;
  }

  /*
  ILookupListReference makes it possible to look up from a list (of key / value pairs)
  in a document in another collection for example:

  const LSchemaDef : IFngSchemaDefinition = {
    descriptin: {type: String, required: true, list: {}},
    warehouse: {type: Schema.Types.ObjectId, ref:'k_referencing_self_collection', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}}},
    shelf: {type: Schema.Types.ObjectId, ref: {type: 'lookupList', collection:'k_referencing_self_collection', id:'$warehouse', property: 'shelves', value:'location'}},
  };
  */
  export interface IFngLookupListReference {
    type: 'lookupList';
    collection: string;   // collection that contains the list
    /*
    Some means of calculating _id in collection.  If it starts with $ then it is property in record
    */
    id: string;
    property: string;
    value: string;
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
    comp: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
    rhs: any;
  }

  /*
  link allows the setting up of hyperlinks for lookup reference fields
  */
  export interface IFngLinkSetup {
    linkOnly?: boolean;  // if true (which at the time of writing is the only option supported) then the input element is not generated.
    form?: string;    // can be used to generate a link to a custom schema
    text?: string;   // the literal value used for the link. If this property is omitted then text is generated from the field values of the document referred to by the link.
  }

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

    hidden?: boolean;   // inhibits this schema key from appearing on the generated form.
    label?: string | null;   // overrides the default input label. label:null suppresses the label altogether.
    ref?: IFngLookupReference | IFngInternalLookupReference;

    id?: string; // specifies the id of the input field (which defaults to f_name)

    placeHolder?: string // adds placeholder text to the input (depending on data type).
    help?: string;  // adds help text under the input.
    helpInline?: string;  // adds help to the right of the input.
    popup?: string;  // adds popup help as specified.
    order?: number;  // allows user to specify the order / tab order of this field in the form. This overrides the position in the Mongoose schema.
    size?: 'mini' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'block-level';  // sets control width.  Default is 'medium''
    readonly?: boolean;  // adds the readonly attribute to the generated input (currently doesn't work with date - and perhaps other types).
    rows?: number | 'auto';  // sets the number of rows in inputs (such as textarea) that support this. Setting rows to "auto" makes the textarea expand to fit the content, rather than create a scrollbar.
    tab?: string;  // Used to divide a large form up into a tabset with multiple tabs
    showWhen?: IFngShowWhen | string;  // allows conditional display of fields based on values elsewhere.  string must be an abular expression.

    /*
      add: 'class="myClass"' allows custom styling of a specific input
    Angular model options can be used - for example add: 'ng-model-options="{updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 }}" '
    custom validation directives, such as the timezone validation in this schema
    */
    add?: string;    //  allows arbitrary attributes to be added to the input tag.

    class?: string;  // allows arbitrary classes to be added to the input tag.
    inlineRadio?: boolean;  // (only valid when type is radio) should be set to true to present all radio button options in a single line
    link?: IFngLinkSetup; // handles displaying links for IFngLookupReference lookups

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
    noAdd?: boolean; // inhibits an Add button being generated for arrays.
    unshift?: boolean; // (for arrays of sub documents) puts an add button in the sub schema header which allows insertion of new sub documents at the beginning of the array.
    noRemove?: boolean;  // inhibits a Remove button being generated for array elements.
    formstyle?: 'inline' | 'vertical' | 'horizontal' | 'horizontalCompact';  // (only valid on a sub schema) sets style of sub form.
    sortable? : boolean;  // Allows drag and drop sorting of arrays - requires angular-ui-sortable

    /*
    The next section relates to the display of sub documents
     */
    customSubDoc?: string; // Allows you to specify custom HTML (which may include directives) for the sub doc
    customFooter?: string; // Allows you to specify custom HTML (which may include directives) for the footer of a group of sub docs
  }

  // Schema passed from server - derived from Mongoose schema
  export interface IFieldViewInfo extends IFngSchemaTypeFormOpts {
    name: string;
    schema?: Array<IFieldViewInfo>;
    array?: boolean;
    showIf? : any;
    required?: boolean;
    step? : number;
  }

  // Schema used internally on client - often derived from IFieldViewInfo passed from server
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
    ref? : any;
    link? : any;
    linkText?: string;
    form?: string;           // the form that is linked to
    select2? : any;          // deprecated
    schema?: Array<IFormInstruction>;
  }

  export interface IContainer {
    /*
      Type of container, which determines markup.  This is currently only available when the schema is generated by
      the client for use independent of the BaseController
      In the case of a string which does not match one of the predefined options
      the generated container div is given the class of the name
     */
    containerType: 'fieldset' | 'well' | 'tabset' | 'tab' | 'well-large' | 'well-small' | string;
    title?: string;
    /*
      h1...h6 will use a header style
      anything else will be used as a paragraph stype
     */
    titleTagOrClass? : string;
    content: IFormInstruction[];
  }

  export type IFormSchemaElement = IFormInstruction | IContainer;

  export type IFormSchema = IFormSchemaElement[];
  export type IControlledFormSchema = IFormInstruction[];

  export interface IEnumInstruction {
    repeat: string;
    value: string;
    label? : string;
  }

  export interface IFngCtrlState {
    master: any;
    allowLocationChange: boolean;   // Do we allow location change or prompt for permission
  }
  export interface IRecordHandler {
    convertToMongoModel(schema: IControlledFormSchema, anObject: any, prefixLength: number, scope: IFormScope): any;
    createNew(dataToSave: any, options: any, scope: IFormScope, ctrlState: IFngCtrlState): void;
    deleteRecord(model: any, id: any, scope: IFormScope, ctrlState: any): void;
    updateDocument(dataToSave : any, options: any, scope: IFormScope, ctrlState: IFngCtrlState) : void;
    readRecord($scope: IFormScope, ctrlState);
    scrollTheList($scope: IFormScope);
    getListData($scope: IFormScope, record, fieldName, listSchema);
    suffixCleanId(inst, suffix);
    setData(object, fieldname, element, value);
    setUpLookupOptions(lookupCollection, schemaElement, $scope: IFormScope, ctrlState, handleSchema);
    setUpLookupListOptions: (ref: IFngLookupListReference, formInstructions: IFormInstruction, $scope: IFormScope, ctrlState: IFngCtrlState) => void;
    handleInternalLookup($scope: IFormScope, formInstructions, ref): void;
    preservePristine(element, fn): void;
    convertIdToListValue(id, idsArray, valuesArray, fname);
    decorateScope($scope:IFormScope, $uibModal, recordHandlerInstance : IRecordHandler, ctrlState);
    fillFormFromBackendCustomSchema(schema, $scope:IFormScope, formGeneratorInstance, recordHandlerInstance, ctrlState);
    fillFormWithBackendSchema($scope: IFormScope, formGeneratorInstance, recordHandlerInstance, ctrlState);
    handleError($scope: IFormScope);
  }

  export interface IFormGenerator {
    generateEditUrl(obj, $scope:IFormScope): string;
    generateNewUrl($scope: IFormScope): string;
    handleFieldType(formInstructions, mongooseType, mongooseOptions, $scope: IFormScope, ctrlState);
    handleSchema(description: string, source, destForm, destList, prefix, doRecursion: boolean, $scope: IFormScope, ctrlState);
    updateDataDependentDisplay(curValue, oldValue, force, $scope: IFormScope);
    add(fieldName, $event, $scope: IFormScope);
    unshift(fieldName, $event, $scope: IFormScope);
    remove(fieldName, value, $event, $scope: IFormScope);
    hasError(formName, name, index, $scope: IFormScope);
    decorateScope($scope: IFormScope, formGeneratorInstance, recordHandlerInstance: IRecordHandler, sharedStuff);
  }

  export interface IFngSingleLookupHandler {
    formInstructions: IFormInstruction;
    lastPart: string;
    possibleArray: string;
  }

  export interface IFngLookupHandler {
    lookupOptions: string[];
    lookupIds: string[];
    handlers: IFngSingleLookupHandler[]
  }

  export interface IFngInternalLookupHandlerInfo extends IFngLookupHandler {
    ref: IFngInternalLookupReference;
  }

  export interface IFngLookupListHandlerInfo extends IFngLookupHandler {
    ref: IFngLookupListReference;
  }

  /*
    The scope which contains form data
   */
  export interface IFormScope extends angular.IScope {
    sharedData: any;
    modelNameDisplay : string;
    modelName: string;
    formName: string;
    alertTitle: any;
    errorMessage: any;
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
    internalLookups: IFngInternalLookupHandlerInfo[];
    listLookups: IFngLookupListHandlerInfo[];
    conversions: any;
    pageSize: any;
    pagesLoaded: any;
    cancel: () => any;
    showError: (error: any, alertTitle? : string) => void;
    prepareForSave: (cb: (error: string, dataToSave?: any) => void) => void;
    formSchema: IControlledFormSchema;
    baseSchema: () => Array<any>;
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
    handleHttpError: (response: any) => void;
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
    isHidden?: () => boolean;

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
