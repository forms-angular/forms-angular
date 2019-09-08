/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function errorDisplay(cssFrameworkService) : angular.IDirective {
      return {
        restrict: 'E',
        templateUrl: 'error-display-' + cssFrameworkService.framework() + '.html'
      };
    }
}
