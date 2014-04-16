myDemoApp.directive('emailField', ['$compile','$filter', function ($compile, $filter) {
        return {
            restrict: 'E',
            replace: true,
            priority: 1,
            compile: function () {
                return function (scope, element, attrs) {
                    scope.$watch(attrs.formInput, function () {
                        var info = scope[attrs.schema];
                        var template = '<div class="form-group" id="cg_' + info.id + '">';
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

                        element.replaceWith($compile(template)(scope));
                    });
                };
            }
        };
    }]);

