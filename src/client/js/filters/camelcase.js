/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
var fng;
(function (fng) {
    var filters;
    (function (filters) {
        /*@ngInject*/
        function camelCase() {
            return function (name) {
                var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
                return name.
                    replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
                    return offset ? letter.toUpperCase() : letter;
                });
            };
        }
        filters.camelCase = camelCase;
    })(filters = fng.filters || (fng.filters = {}));
})(fng || (fng = {}));
//# sourceMappingURL=camelcase.js.map