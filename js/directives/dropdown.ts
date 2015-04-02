/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../forms-angular.d.ts" />

'use strict';
formsAngular
  .directive('modelControllerDropdown', function () {
    return {
      restrict: 'AE',
      replace: true,
      template: '<li ng-show="items.length > 0" class="dropdown mcdd" dropdown>' +
                ' <a class="dropdown-toggle" dropdown-toggle>' +
                '  {{contextMenu}} <b class="caret"></b>' +
                ' </a>' +
                ' <ul class="dropdown-menu">' +
                '  <li ng-repeat="choice in items" ng-hide="isHidden($index)" ng-class="dropdownClass($index)">' +
                '   <a ng-show="choice.text" class="dropdown-option" ng-href="{{choice.url}}" ng-click="doClick($index, $event)">' +
                '    {{choice.text}}' +
                '   </a>' +
                '  </li>' +
                ' </ul>' +
                '</li>'
    };
  });
