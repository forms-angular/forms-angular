'use strict';
formsAngular.directive('emailField', ['$compile', '$filter', 'cssFrameworkService', function ($compile, $filter, cssFrameworkService) {
  return {
    restrict: 'E',
    replace: true,
    priority: 1,
    compile: function () {
      return function (scope, element, attrs) {
        scope.$watch(attrs.formInput, function () {
          var info = scope[attrs.schema],
            template;
          if (cssFrameworkService.framework() === 'bs2') {
            template = '<div class="control-group" id="cg_' + info.id + '">';
            if (!info.label) {
              info.label = $filter('titleCase')(info.name);
            }
            if (info.label !== '') {
              template += '<label class="control-label" for="' + info.id + '">' + info.label + '</label>';
            }
            template += '<div class="controls">' +
              '<div class="input-prepend">' +
              '<span class="add-on">@</span>' +
              '<input type="email" ng-model="record.' + info.name + '" id="' + info.id + '" name="' + info.id + '" />' +
              '</div>' +
              '</div>';
            template += '</div>';
          } else {
            template = '<div class="form-group" id="cg_' + info.id + '">';
            if (!info.label) {
              info.label = $filter('titleCase')(info.name);
            }
            if (info.label !== '') {
              template += '<label class="col-sm-2" for="' + info.id + '">' + info.label + '</label>';
            }
            template += '<div class="col-sm-10">' +
              '<div class="col-xs-4">' +
              '<div class="input-group">' +
              '<span class="input-group-addon input-sm">@</span>' +
              '<input type="email" class="form-control input-sm" ng-model="record.' + info.name + '" id="' + info.id + '" name="' + info.id + '" />' +
              '</div>' +
              '</div>' +
              '</div>';
            template += '</div>';
          }

          element.replaceWith($compile(template)(scope));
        });
      };
    }
  };
}]);

