/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function formButtons(CssFrameworkService: fng.ICssFrameworkService):angular.IDirective {
    return {
      restrict: 'A',
      templateUrl: 'form-button-' + CssFrameworkService.framework() + '.html'
    };
  }
}
