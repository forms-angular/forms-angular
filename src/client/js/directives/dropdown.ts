/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function modelControllerDropdown() : angular.IDirective {
      return {
        restrict: 'AE',
        replace: true,
        template: '<li ng-show="items.length > 0" class="mcdd" uib-dropdown>' +
        ' <a href="#" uib-dropdown-toggle>' +
        '  {{contextMenu}} <b class="caret"></b>' +
        ' </a>' +
        ' <ul class="uib-dropdown-menu dropdown-menu">' +
        // to reduce the performance overhead, we should minimise the number of times isSecurelyHidden() and
        // isSecurelyDisabled() are called when determining the security state of menu items.
        // this is achieved through the use of one-time binding.  as we cannot use one-time binding for the more general
        // isHidden and isDisabled logic (since these functions are highly likely to include model-dependent logic),
        // we need to seperate these two tasks, which we do as follows:
        //   - for visibility, the security check uses a one-time-bound ng-if,
        //       and the general isHidden check uses ng-hide
        //   - for disabled state, the security check uses a one-time-bound class={{...}},
        //       and the general isDisabled check uses ng-class
        // note the 'normal' class might not be used, but for the one-time binding to work correctly, we need to return a truthy
        // value
        '  <li ng-repeat="choice in items" ng-if="::!isSecurelyHidden(choice.id)" ng-hide="isHidden($index)" ng-attr-id="{{choice.id}}" class="{{ ::isSecurelyDisabled(choice.id) ? \'disabled\' : \'normal\' }}" ng-class="dropdownClass($index)">' +
        '   <a ng-show="choice.text || choice.textFunc" class="dropdown-option" ng-href="{{choice.url || choice.urlFunc()}}" ng-click="doClick($index, $event)">' +
        '    {{ choice.text || choice.textFunc() }}' +
        '   </a>' +
        '  </li>' +
        ' </ul>' +
        '</li>'
      };
    }
}
