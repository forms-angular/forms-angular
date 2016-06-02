/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/underscore/underscore.d.ts" />
declare module fng {
    interface IFieldViewInfo {
        name: string;
        schema: Array<IFieldViewInfo>;
        array: boolean;
        id?: string;
        showIf?: any;
    }
    interface IEnumInstruction {
        repeat: string;
        value: string;
        label?: string;
    }
    interface IRecordHandler {
        convertToMongoModel(schema: Array<IFieldViewInfo>, anObject: any, prefixLength: number, scope: fng.IFormScope): any;
        createNew(dataToSave: any, options: any, scope: fng.IFormScope): void;
        deleteRecord(model: any, id: any, scope: fng.IFormScope, ctrlState: any): void;
        updateDocument(dataToSave: any, options: any, scope: fng.IFormScope, ctrlState: any): void;
        readRecord($scope: fng.IFormScope, ctrlState: any): any;
        scrollTheList($scope: fng.IFormScope): any;
        getListData(record: any, fieldName: any, select2List: any): any;
        suffixCleanId(inst: any, suffix: any): any;
        setData(object: any, fieldname: any, element: any, value: any): any;
        setUpSelectOptions(lookupCollection: any, schemaElement: any, $scope: fng.IFormScope, ctrlState: any, handleSchema: any): any;
        preservePristine(element: any, fn: any): void;
        convertIdToListValue(id: any, idsArray: any, valuesArray: any, fname: any): any;
        decorateScope($scope: fng.IFormScope, $uibModal: any, recordHandlerInstance: fng.IRecordHandler, ctrlState: any): any;
        fillFormFromBackendCustomSchema(schema: any, $scope: fng.IFormScope, formGeneratorInstance: any, recordHandlerInstance: any, ctrlState: any): any;
        fillFormWithBackendSchema($scope: fng.IFormScope, formGeneratorInstance: any, recordHandlerInstance: any, ctrlState: any): any;
        handleError($scope: fng.IFormScope): any;
    }
    interface IFormGenerator {
        generateEditUrl(obj: any, $scope: fng.IFormScope): string;
        generateNewUrl($scope: fng.IFormScope): string;
        handleFieldType(formInstructions: any, mongooseType: any, mongooseOptions: any, $scope: fng.IFormScope, ctrlState: any): any;
        handleSchema(description: string, source: any, destForm: any, destList: any, prefix: any, doRecursion: boolean, $scope: fng.IFormScope, ctrlState: any): any;
        updateDataDependentDisplay(curValue: any, oldValue: any, force: any, $scope: fng.IFormScope): any;
        add(fieldName: any, $event: any, $scope: fng.IFormScope): any;
        unshift(fieldName: any, $event: any, $scope: fng.IFormScope): any;
        remove(fieldName: any, value: any, $event: any, $scope: fng.IFormScope): any;
        hasError(formName: any, name: any, index: any, $scope: fng.IFormScope): any;
        decorateScope($scope: fng.IFormScope, formGeneratorInstance: any, recordHandlerInstance: fng.IRecordHandler, sharedStuff: any): any;
    }
    interface IFormScope extends angular.IScope {
        modelNameDisplay: string;
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
        tabs?: Array<any>;
        tab?: string;
        activeTabNo?: number;
        topLevelFormName: string;
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
        baseSchema(): Array<any>;
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
    interface IBaseFormOptions {
        /**
         * The style of the form layout.  Supported values are horizontalcompact, horizontal, vertical, inline
         */
        formstyle?: string;
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
    }
    interface IFormAttrs extends IFormOptions, angular.IAttributes {
        /**
         * Schema used by the form
         */
        schema: string;
        forceform?: string;
    }
    interface IFormOptions extends IBaseFormOptions {
        schema?: string;
        subkey?: string;
        subkeyno?: number;
        subschema?: string;
        subschemaroot?: string;
    }
    interface IBuiltInRoute {
        route: string;
        state: string;
        templateUrl: string;
        options?: any;
    }
    interface IRoutingConfig {
        hashPrefix: string;
        html5Mode: boolean;
        routing: string;
        prefix: string;
        fixedRoutes?: Array<IBuiltInRoute>;
        templateFolder?: string;
        add2fngRoutes?: any;
        variantsForDemoWebsite?: any;
        variants?: any;
    }
    interface IFngRoute {
        newRecord?: boolean;
        analyse?: boolean;
        modelName?: string;
        reportSchemaName?: string;
        id?: string;
        formName?: string;
        tab?: string;
        variant?: string;
    }
}
declare module fng.controllers {
    function BaseCtrl($scope: fng.IFormScope, $rootScope: any, $location: any, $filter: any, $uibModal: any, $data: any, routingService: any, formGenerator: any, recordHandler: any): void;
}
declare module fng.controllers {
    function SaveChangesModalCtrl($scope: any, $uibModalInstance: any): void;
}
declare module fng.controllers {
    function ModelCtrl($scope: any, $http: any, $location: any, routingService: any): void;
}
declare module fng.controllers {
    function NavCtrl($scope: any, $data: any, $location: any, $filter: any, $controller: any, routingService: any, cssFrameworkService: any): void;
}
declare module fng.controllers {
    function SearchCtrl($scope: any, $http: any, $location: any, routingService: any): void;
}
declare module fng.directives {
    function modelControllerDropdown(): angular.IDirective;
}
declare module fng.directives {
    function errorDisplay(): angular.IDirective;
}
declare module fng.directives {
    function fngLink(routingService: any, SubmissionsService: any): angular.IDirective;
}
declare module fng.directives {
    function formInput($compile: any, $rootScope: any, $filter: any, $data: any, $timeout: any, cssFrameworkService: any, formGenerator: any, formMarkupHelper: any): angular.IDirective;
}
declare module fng.directives {
    function formButtons(cssFrameworkService: any): angular.IDirective;
}
declare module fng.directives {
    function globalSearch(cssFrameworkService: any): angular.IDirective;
}
declare module fng.filters {
    function camelCase(): (name: any) => any;
}
declare module fng.filters {
    function titleCase(): (str: any, stripSpaces: any) => any;
}
declare module fng.services {
    function addAllService(): void;
}
declare module fng.services {
    function cssFrameworkService(): {
        setOptions: (options: any) => void;
        $get: () => {
            framework: () => string;
            setFrameworkForDemoWebsite: (framework: any) => void;
            span: (cols: any) => any;
            offset: (cols: any) => any;
            rowFluid: () => any;
        };
    };
}
declare module fng.services {
    function $data(): {
        record: {};
        disableFunctions: {};
        dataEventFunctions: {};
        modelControllers: any[];
    };
}
declare module fng.services {
    function routingService($injector: any, $locationProvider: any): {
        start: (options: IRoutingConfig) => void;
        $get: () => {
            router: () => string;
            prefix: () => string;
            parsePathFunc: () => (location: any) => IFngRoute;
            buildUrl: (path: any) => string;
            buildOperationUrl: (operation: any, modelName: any, formName: any, id: any, tab: any) => any;
            redirectTo: () => (operation: any, scope: any, location: any, id: any, tab: any) => void;
        };
    };
}
declare module fng.services {
    function formGenerator($location: any, $timeout: any, $filter: any, SubmissionsService: any, routingService: any, recordHandler: any): IFormGenerator;
}
declare module fng.services {
    function formMarkupHelper(cssFrameworkService: any, inputSizeHelper: any, addAllService: any): {
        isHorizontalStyle: (formStyle: any) => boolean;
        fieldChrome: (scope: any, info: any, options: any) => {
            template: string;
            closeTag: string;
        };
        label: (scope: any, fieldInfo: any, addButtonMarkup: any, options: any) => string;
        glyphClass: () => string;
        allInputsVars: (scope: any, fieldInfo: any, options: any, modelString: any, idString: any, nameString: any) => {
            common: any;
            sizeClassBS3: string;
            sizeClassBS2: string;
            compactClass: string;
            formControl: string;
        };
        inputChrome: (value: any, fieldInfo: any, options: IFormOptions, markupVars: any) => any;
        generateSimpleInput: (common: any, fieldInfo: any, options: any) => string;
        controlDivClasses: (options: any) => any[];
        handleInputAndControlDiv: (inputMarkup: any, controlDivClasses: any) => any;
        handleArrayInputAndControlDiv: (inputMarkup: any, controlDivClasses: any, info: any, options: IFormOptions) => string;
        addTextInputMarkup: (allInputsVars: any, fieldInfo: any, requiredStr: any) => string;
    };
}
declare module fng.services {
    function inputSizeHelper(): {
        sizeMapping: number[];
        sizeDescriptions: string[];
        defaultSizeOffset: number;
        sizeAsNumber: (fieldSizeAsText: any) => number;
    };
}
declare module fng.services {
    function pluginHelper(formMarkupHelper: any): {
        extractFromAttr: (attr: any, directiveName: any) => {
            info: {};
            options: {
                formStyle: any;
            };
            directiveOptions: {};
        };
        buildInputMarkup: (scope: any, model: any, info: any, options: any, addButtons: any, needsX: any, generateInputControl: any) => any;
        findIdInSchemaAndFlagNeedX: (scope: any, id: any) => boolean;
    };
}
declare module fng.services {
    /**
     * Operations on a whole record
     *
     * All methods should be state-less
     *
     */
    function recordHandler($location: any, $window: any, $filter: any, $timeout: any, routingService: any, SubmissionsService: any, SchemasService: any): fng.IRecordHandler;
}
declare module fng.services {
    function SchemasService($http: any): {
        getSchema: (modelName: any, formName: any) => any;
    };
}
declare module fng.services {
    function SubmissionsService($http: any, $cacheFactory: any): {
        getListAttributes: (ref: any, id: any) => any;
        readRecord: (modelName: any, id: any) => any;
        getAll: (modelName: any, _options: any) => any;
        getPagedAndFilteredList: (modelName: any, options: any) => any;
        deleteRecord: (model: any, id: any) => any;
        updateRecord: (modelName: any, id: any, dataToSave: any) => any;
        createRecord: (modelName: any, dataToSave: any) => any;
    };
}
declare module fng {
    var formsAngular: ng.IModule;
}
declare var formsAngular: ng.IModule;
