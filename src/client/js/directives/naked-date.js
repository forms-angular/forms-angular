/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        function fngNakedDate() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function postlink(scope, element, attrs, ngModel) {
                    ngModel.$parsers.push(function (value) {
                        if (value) {
                            return value.toString();
                        }
                    });
                    ngModel.$formatters.push(function (value) {
                        if (value) {
                            return new Date(value);
                        }
                    });
                }
            };
        }
        directives.fngNakedDate = fngNakedDate;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
//# sourceMappingURL=naked-date.js.map