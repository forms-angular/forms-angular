/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../forms-angular.ts" />

module fng {

  formsAngular
    .directive('errorDisplay', function () {
      return {
        restrict: 'E',
        template: '<div id="display-error" ng-show="errorMessage" ng-class="css(\'rowFluid\')">' +
        '  <div class="alert alert-error col-lg-offset-3 offset3 col-lg-6 col-xs-12 span6 alert-warning alert-dismissable">' +
        '    <button type="button" class="close" ng-click="dismissError()">×</button>' +
        '    <h4>{{alertTitle}}</h4>' +
        '    <div ng-bind-html="errorMessage"></div>' +
        '  </div>' +
        '</div>'
      };
    });

}
