/// <reference path="../../../node_modules/@types/angular/index.d.ts" />
/// <reference path="controllers/base.ts" />
/// <reference path="controllers/saveChangesModal.ts" />
/// <reference path="controllers/model.ts" />
/// <reference path="controllers/nav.ts" />
/// <reference path="controllers/search-ctrl.ts" />
/// <reference path="directives/dropdown.ts" />
/// <reference path="directives/error-display.ts" />
/// <reference path="directives/fng-link.ts" />
/// <reference path="directives/form.ts" />
/// <reference path="directives/form-buttons.ts" />
/// <reference path="directives/search.ts" />
/// <reference path="filters/camelcase.ts" />
/// <reference path="filters/titlecase.ts" />
/// <reference path="services/add-all.ts" />
/// <reference path="services/css-framework.ts" />
/// <reference path="services/fng-model-controller.ts" />
/// <reference path="services/fng-routes.ts" />
/// <reference path="services/form-generator.ts" />
/// <reference path="services/form-markup-helper.ts" />
/// <reference path="services/input-size-helper.ts" />
/// <reference path="services/plugin-helper.ts" />
/// <reference path="services/record-handler.ts" />
/// <reference path="services/schemas.ts" />
/// <reference path="services/submissions.ts" />

module fng {

  export var formsAngular: fng.IFng = angular.module('formsAngular', [
    'ngSanitize',
    'ngMessages',
    'ui.bootstrap',
    'infinite-scroll',
    'monospaced.elastic'
  ])
  .controller('BaseCtrl',fng.controllers.BaseCtrl)
  .controller('SaveChangesModalCtrl', fng.controllers.SaveChangesModalCtrl)
  .controller('LinkCtrl', fng.controllers.LinkCtrl)
  .controller('ModelCtrl', fng.controllers.ModelCtrl)
  .controller('NavCtrl', fng.controllers.NavCtrl)
  .directive('modelControllerDropdown',fng.directives.modelControllerDropdown)
  .directive('dropDownItem',fng.directives.dropDownItem)
  .directive('dropDownSubMenu',fng.directives.dropDownSubMenu)
  .directive('errorDisplay',fng.directives.errorDisplay)
  .directive('fngLink',fng.directives.fngLink)
  .directive('formInput',fng.directives.formInput)
  .directive('formButtons',fng.directives.formButtons)
  .directive('globalSearch',fng.directives.globalSearch)
  .directive('fngNakedDate',fng.directives.fngNakedDate)
  .filter('camelCase', fng.filters.camelCase)
  .filter('titleCase', fng.filters.titleCase)
  .filter('extractTimestampFromMongoID', fng.filters.extractTimestampFromMongoID)
  .service('AddAllService', fng.services.AddAllService)
  .provider('CssFrameworkService', fng.services.CssFrameworkService)
  .provider('RoutingService', fng.services.RoutingService)
  .factory('FngModelCtrlService', fng.services.FngModelCtrlService)
  .factory('FormGeneratorService', fng.services.FormGeneratorService)
  .factory('FormMarkupHelperService', fng.services.FormMarkupHelperService)
  .factory('InputSizeHelperService', fng.services.InputSizeHelperService)
  .factory('PluginHelperService', fng.services.PluginHelperService)
  .factory('RecordHandlerService', fng.services.RecordHandlerService)
  .factory('SchemasService', fng.services.SchemasService)
  .factory('SubmissionsService', fng.services.SubmissionsService)
  .factory('SecurityService', fng.services.SecurityService)
  ;
}

// expose the library
var formsAngular = fng.formsAngular;
