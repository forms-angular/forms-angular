'use strict';
formsAngular
  .directive('formButtons', ['cssFrameworkService', function (cssFrameworkService) {
    return {
      restrict: 'A',
      templateUrl: 'template/form-button-' + cssFrameworkService.framework() + '.html'
    };
  }]);
