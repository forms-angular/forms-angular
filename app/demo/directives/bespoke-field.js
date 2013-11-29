myDemoApp.directive('emailField', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            priority: 1,
            compile: function () {
                return function (scope, element, attrs) {
                    scope.$watch(attrs.formInput, function () {
                        var info = scope[attrs.schema];
                        var template = '<div class="control-group" id="cg_' + info.id + '">';
                        if (info.label !== '') {
                            template += '<label class="control-label" for="' + info.id + '">' + info.label + '</label>';
                        }
                        template += '<div class="controls">' +
                            '<div class="input-prepend">' +
                            '<span class="add-on">@</span>' +
                            '<input type="text" ng-model="record.' + info.name + '" id="' + info.id + '" name="' + info.id + '" />' +
                            '</div>' +
                            '</div>';
                        template += '</div>';

                        element.replaceWith($compile(template)(scope));
                    });
                };
            }
        };
    });

