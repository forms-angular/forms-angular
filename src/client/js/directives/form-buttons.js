/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        function formButtons(cssFrameworkService) {
            return {
                restrict: 'A',
                templateUrl: 'form-button-' + cssFrameworkService.framework() + '.html'
            };
        }
        directives.formButtons = formButtons;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
//# sourceMappingURL=form-buttons.js.map