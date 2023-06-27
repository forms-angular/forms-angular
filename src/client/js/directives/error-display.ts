/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function errorDisplay(CssFrameworkService: fng.ICssFrameworkService) : angular.IDirective {
      return {
        restrict: 'E',
        templateUrl: 'error-display-' + CssFrameworkService.framework() + '.html'
      };
    }
}
