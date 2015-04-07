/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../controllers/search-ctrl.ts" />

module fng.directives {

  /*@ngInject*/
  export function globalSearch(cssFrameworkService):angular.IDirective {
    return {
      restrict: 'AE',
      templateUrl: 'search-' + cssFrameworkService.framework() + '.html',
      controller: fng.controllers.SearchCtrl
    };
  }
}
