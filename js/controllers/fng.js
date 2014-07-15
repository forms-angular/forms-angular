'use strict';

formsAngular.controller('FngCtrl', ['$scope', 'cssFrameworkService', function ($scope, cssFrameworkService) {

  $scope.globalShortcuts = function (event) {
    if (event.keyCode === 191 && event.ctrlKey) {
      // Ctrl+/ takes you to global search
      document.querySelector('#searchinput').focus();
      event.preventDefault();
    }
  };

  $scope.css = function (fn, arg) {
    var result;
    if (typeof cssFrameworkService[fn] === 'function') {
      result = cssFrameworkService[fn](arg);
    } else {
      result = 'error text-error';
    }
    return result;
  };

}]);
