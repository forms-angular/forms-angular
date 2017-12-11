/// <reference path="../../node_modules/@types/angular/index.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function fngNakedDate() : angular.IDirective {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function postlink(scope, element, attrs, ngModel: angular.INgModelController) {
        ngModel.$parsers.push(function(value) {
          if (value) {
            return value.toString();
          }
        });
        ngModel.$formatters.push(function(value) {
          if (value) {
            return new Date(value);
          }
        });
      }
    };
  }
}
