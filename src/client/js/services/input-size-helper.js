/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        function inputSizeHelper() {
            var sizeMapping = [1, 2, 4, 6, 8, 10, 12];
            var sizeDescriptions = ['mini', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'block-level'];
            var defaultSizeOffset = 2; // medium, which was the default for Twitter Bootstrap 2
            return {
                sizeMapping: sizeMapping,
                sizeDescriptions: sizeDescriptions,
                defaultSizeOffset: defaultSizeOffset,
                sizeAsNumber: function (fieldSizeAsText) {
                    return sizeMapping[fieldSizeAsText ? sizeDescriptions.indexOf(fieldSizeAsText) : defaultSizeOffset];
                }
            };
        }
        services.inputSizeHelper = inputSizeHelper;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
//# sourceMappingURL=input-size-helper.js.map