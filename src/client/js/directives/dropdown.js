/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        function modelControllerDropdown() {
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
        directives.modelControllerDropdown = modelControllerDropdown;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
//# sourceMappingURL=dropdown.js.map