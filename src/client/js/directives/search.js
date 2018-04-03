/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
/// <reference path="../controllers/search-ctrl.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        function globalSearch(cssFrameworkService) {
            return {
                restrict: 'AE',
                templateUrl: 'search-' + cssFrameworkService.framework() + '.html',
                controller: fng.controllers.SearchCtrl
            };
        }
        directives.globalSearch = globalSearch;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
//# sourceMappingURL=search.js.map