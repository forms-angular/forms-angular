/// <reference path="../../typings/globals/angular/index.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function formButtons(cssFrameworkService):angular.IDirective {
    return {
      restrict: 'A',
      templateUrl: 'form-button-' + cssFrameworkService.framework() + '.html'
    };
  }
}
