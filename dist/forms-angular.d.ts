/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/underscore/underscore.d.ts" />
declare module fng {
    interface IFormScope extends angular.IScope {
        tabs?: Array<any>;
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
        generateEditUrl: any;
        generateNewUrl: any;
        scrollTheList: any;
        getListData: any;
        select2List: any;
        setPristine: any;
        dismissError: any;
        skipCols: any;
        setFormDirty: any;
        add: any;
        hasError: any;
        unshift: any;
        remove: any;
        openSelect2: any;
        toJSON: any;
        baseSchema: any;
        formSchema: any;
    }
    interface IBuiltInRoute {
        route: string;
        state: string;
        templateUrl: string;
        options?: any;
    }
    interface IRoutingConfig {
        hashPrefix: string;
        html5Mode: Boolean;
        routing: string;
        prefix: string;
        fixedRoutes?: Array<IBuiltInRoute>;
        add2fngRoutes?: any;
        variantsForDemoWebsite?: any;
        variants?: any;
    }
    interface IFngRoute {
        newRecord?: Boolean;
        analyse?: Boolean;
        modelName?: string;
        reportSchemaName?: string;
        id?: string;
        formName?: string;
        tab?: string;
        variant?: string;
    }
}
declare module fng.controllers {
    function BaseCtrl($scope: any, $rootScope: any, $location: any, $filter: any, $modal: any, $data: any, routingService: any, formGenerator: any, recordHandler: any): void;
}
declare module fng.controllers {
    function SaveChangesModalCtrl($scope: any, $modalInstance: any): void;
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
    function formInput($compile: any, $rootScope: any, $filter: any, $data: any, routingService: any, cssFrameworkService: any, formGenerator: any, formMarkupHelper: any): angular.IDirective;
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
    /**
     *
     * Manipulate record items for generating a form
     *
     * All methods should be state-less
     *
     */
    function formGenerator($location: any, $timeout: any, $filter: any, SubmissionsService: any, routingService: any, recordHandler: any): {
        generateEditUrl: (obj: any, $scope: any) => string;
        generateNewUrl: ($scope: any) => string;
        handleFieldType: (formInstructions: any, mongooseType: any, mongooseOptions: any, $scope: any, ctrlState: any, handleError: any) => any;
        handleSchema: (description: any, source: any, destForm: any, destList: any, prefix: any, doRecursion: any, $scope: any, ctrlState: any, handleError: any) => void;
        updateDataDependentDisplay: (curValue: any, oldValue: any, force: any, $scope: any) => any;
        add: (fieldName: any, $event: any, $scope: any) => void;
        unshift: (fieldName: any, $event: any, $scope: any) => void;
        remove: (fieldName: any, value: any, $event: any, $scope: any) => void;
        hasError: (formName: any, name: any, index: any, $scope: any) => boolean;
        decorateScope: ($scope: IFormScope, formGeneratorInstance: any, recordHandlerInstance: any, sharedStuff: any) => void;
    };
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
        inputChrome: (value: any, fieldInfo: any, options: any, markupVars: any) => any;
        generateSimpleInput: (common: any, fieldInfo: any, options: any) => string;
        controlDivClasses: (options: any) => any[];
        handleInputAndControlDiv: (inputMarkup: any, controlDivClasses: any) => any;
        handleArrayInputAndControlDiv: (inputMarkup: any, controlDivClasses: any, info: any, options: any) => string;
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
    function recordHandler($location: any, $window: any, $filter: any, $timeout: any, routingService: any, SubmissionsService: any, SchemasService: any): {
        readRecord: ($scope: any, ctrlState: any, handleError: any) => void;
        scrollTheList: ($scope: any, handleError: any) => void;
        deleteRecord: (model: any, id: any, $scope: any, ctrlState: any) => void;
        updateDocument: (dataToSave: any, options: any, $scope: any, handleError: any, ctrlState: any) => void;
        createNew: (dataToSave: any, options: any, $scope: any, handleError: any) => void;
        getListData: (record: any, fieldName: any, select2List: any) => any;
        suffixCleanId: (inst: any, suffix: any) => any;
        setData: (object: any, fieldname: any, element: any, value: any) => void;
        setUpSelectOptions: (lookupCollection: any, schemaElement: any, $scope: any, ctrlState: any, handleSchema: any, handleError: any) => void;
        preservePristine: (element: any, fn: any) => void;
        convertToMongoModel: (schema: any, anObject: any, prefixLength: any, $scope: any) => any;
        convertIdToListValue: (id: any, idsArray: any, valuesArray: any, fname: any) => any;
        handleError: ($scope: any) => (data: any, status: any) => void;
        decorateScope: ($scope: any, $modal: any, recordHandlerInstance: any, ctrlState: any) => void;
        fillFormFromBackendCustomSchema: (schema: any, $scope: any, formGeneratorInstance: any, recordHandlerInstance: any, ctrlState: any, handleError: any) => void;
        fillFormWithBackendSchema: ($scope: any, formGeneratorInstance: any, recordHandlerInstance: any, ctrlState: any, handleError: any) => void;
    };
}
declare module fng.services {
    function SchemasService($http: any): {
        getSchema: (modelName: any, formName: any) => any;
    };
}
declare module fng.services {
    function SubmissionsService($http: any): {
        getListAttributes: (ref: any, id: any) => any;
        readRecord: (modelName: any, id: any) => any;
        getAll: (modelName: any) => any;
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
