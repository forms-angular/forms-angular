/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../forms-angular.d.ts" />

'use strict';
formsAngular
  .directive('formButtons', ['cssFrameworkService', function (cssFrameworkService) {
    return {
      restrict: 'A',
      templateUrl: 'template/form-button-' + cssFrameworkService.framework() + '.html'
    };
  }]);
