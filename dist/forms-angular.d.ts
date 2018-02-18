/// <reference path="../node_modules/@types/angular/index.d.ts" />
/// <reference path="../node_modules/@types/lodash/index.d.ts" />
/// <reference path="../js/fng-types.d.ts" />
/// <reference types="angular" />
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
    function formButtons(cssFrameworkService: any): angular.IDirective;
}
declare module fng.directives {
    function formInput($compile: any, $rootScope: any, $filter: any, $timeout: any, cssFrameworkService: any, formGenerator: any, formMarkupHelper: any): angular.IDirective;
}
declare module fng.directives {
    function fngNakedDate(): angular.IDirective;
}
declare module fng.controllers {
    function SearchCtrl($scope: any, $http: any, $location: any, routingService: any): void;
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
    function fngModelCtrlService($controller: any): {
        loadControllerAndMenu: (sharedData: any, controllerName: any, level: any, needDivider: any, localScope: any) => void;
    };
}
declare module fng.services {
    function routingService($injector: any, $locationProvider: any): {
        start: (options: IRoutingConfig) => void;
        addRoutes: (fixedRoutes: IBuiltInRoute[], fngRoutes: IBuiltInRoute[]) => void;
        registerAction: (action: string) => void;
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
        glyphClass: () => "icon" | "glyphicon glyphicon";
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
    function recordHandler($http: any, $location: any, $window: any, $filter: any, $timeout: any, routingService: any, SubmissionsService: any, SchemasService: any): fng.IRecordHandler;
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
declare module fng.controllers {
    function BaseCtrl($scope: fng.IFormScope, $rootScope: any, $location: any, $filter: any, $uibModal: any, fngModelCtrlService: any, routingService: any, formGenerator: any, recordHandler: any): void;
}
declare module fng.controllers {
    function SaveChangesModalCtrl($scope: any, $uibModalInstance: any): void;
}
declare module fng.controllers {
    function ModelCtrl($scope: any, $http: any, $location: any, routingService: any): void;
}
declare module fng.controllers {
    function NavCtrl($scope: any, $location: any, $filter: any, routingService: any, cssFrameworkService: any): void;
}
declare module fng {
    var formsAngular: angular.IModule;
}
declare var formsAngular: angular.IModule;
