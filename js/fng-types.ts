/// <reference path="../typings/angularjs/angular.d.ts" />

module fng {

  /*
    The scope which contains form data
   */
  export interface IFormScope extends angular.IScope {
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

  export interface IBuiltInRoute {
    route: string;
    state: string;
    templateUrl: string;
    options? : any;
  }

  export interface IRoutingConfig {
    hashPrefix: string;
    html5Mode: Boolean;
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
    newRecord?:           Boolean;
    analyse?:             Boolean;
    modelName?:           string;
    reportSchemaName? :   string;
    id? :                 string;
    formName? :           string;
    tab? :                string;
    variant? :            string;    // TODO should be enum of supported frameworks
  }

}
