/// <reference path="../../typings/angularjs/angular.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function modelControllerDropdown() : angular.IDirective {
      return {
        restrict: 'AE',
        replace: true,
        template: '<li ng-show="items.length > 0" class="mcdd" uib-dropdown>' +
        ' <a uib-dropdown-toggle>' +
        '  {{contextMenu}} <b class="caret"></b>' +
        ' </a>' +
        ' <ul class="uib-dropdown-menu dropdown-menu">' +
        '  <li ng-repeat="choice in items" ng-hide="isHidden($index)" ng-class="dropdownClass($index)">' +
        '   <a ng-show="choice.text" class="dropdown-option" ng-href="{{choice.url}}" ng-click="doClick($index, $event)">' +
        '    {{choice.text}}' +
        '   </a>' +
        '  </li>' +
        ' </ul>' +
        '</li>'
      };
    }
}
