'use strict';
var COL_FIELD = /COL_FIELD/g;
formsAngular.directive('ngTotalCell', ['$compile', '$domUtilityService', function ($compile, domUtilityService) {
  var ngTotalCell = {
    scope: false,
    compile: function () {
      return {
        pre: function ($scope, iElement) {
          var html;
// ellText" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD |number}}</s
// ellText" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD }}</s
          var cellTemplate,
            filterMatch = $scope.col.cellTemplate.match(/{{COL_FIELD \|(.+)}}/);
          if (filterMatch) {
            cellTemplate = $scope.col.cellTemplate.replace('COL_FIELD |' + filterMatch[1], 'getTotalVal("' + $scope.col.field + '","' + filterMatch[1] + '")');
          } else {
            cellTemplate = $scope.col.cellTemplate.replace(COL_FIELD, 'getTotalVal("' + $scope.col.field + '")');
          }

          if ($scope.col.enableCellEdit) {
            html = $scope.col.cellEditTemplate;
            html = html.replace(DISPLAY_CELL_TEMPLATE, cellTemplate);
            html = html.replace(EDITABLE_CELL_TEMPLATE, $scope.col.editableCellTemplate.replace(COL_FIELD, 'row.entity.' + $scope.col.field));
          } else {
            html = cellTemplate;
          }

          var cellElement = $compile(html)($scope);

          if ($scope.enableCellSelection && cellElement[0].className.indexOf('ngSelectionCell') === -1) {
            cellElement[0].setAttribute('tabindex', 0);
            cellElement.addClass('ngCellElement');
          }

          iElement.append(cellElement);
        },
        post: function ($scope, iElement) {
          if ($scope.enableCellSelection) {
            $scope.domAccessProvider.selectionHandlers($scope, iElement);
          }

          $scope.$on('ngGridEventDigestCell', function () {
            domUtilityService.digest($scope);
          });
        }
      };
    }
  };

  return ngTotalCell;
}]);


