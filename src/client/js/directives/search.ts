/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
/// <reference path="../controllers/search-ctrl.ts" />

module fng.directives {

  /*@ngInject*/
  export function globalSearch(CssFrameworkService: fng.ICssFrameworkService):angular.IDirective {
    return {
      restrict: 'AE',
      templateUrl: 'search-' + CssFrameworkService.framework() + '.html',
      controller: fng.controllers.SearchCtrl
    };
  }
}
