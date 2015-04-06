/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../forms-angular.ts" />

module fng {
  formsAngular.factory('SchemasService', ['$http', function ($http) {
    return {
      getSchema: function (modelName, formName) {
        return $http.get('/api/schema/' + modelName + (formName ? '/' + formName : ''), {cache: true});
      }
    };
  }]);
}
