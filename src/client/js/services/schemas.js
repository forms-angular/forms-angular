/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        function SchemasService($http) {
            return {
                getSchema: function (modelName, formName) {
                    return $http.get('/api/schema/' + modelName + (formName ? '/' + formName : ''), { cache: true });
                }
            };
        }
        services.SchemasService = SchemasService;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
//# sourceMappingURL=schemas.js.map