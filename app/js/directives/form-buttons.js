formsAngular
    .directive('formButtons', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            compile: function () {
                return function ($scope, $element) {
                    var template =
                        '<div class="btn-group pull-right">' +
                            '<button id="saveButton" class="btn btn-mini btn-primary form-btn" ng-click="save()" ng-disabled="isSaveDisabled()"><i class="glyphicon glyphicon-ok"></i> Save</button>' +
                            '<button id="cancelButton" class="btn btn-mini btn-warning form-btn" ng-click="cancel()" ng-disabled="isCancelDisabled()"><i class="glyphicon glyphicon-remove"></i> Cancel</button>' +
                        '</div>' +
                        '<div class="btn-group pull-right">' +
                            '<button id="newButton" class="btn btn-mini btn-success form-btn" ng-click="new()" ng-disabled="isNewDisabled()"><i class="glyphicon glyphicon-plus"></i> New</button>' +
                            '<button id="deleteButton" class="btn btn-mini btn-danger form-btn" ng-click="delete()" ng-disabled="isDeleteDisabled()"><i class="glyphicon glyphicon-minus"></i> Delete</button>' +
                        '</div>';
                    $element.replaceWith($compile(template)($scope));
                }
            }
        }
    }]);
