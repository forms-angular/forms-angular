/// <reference path="../../typings/angularjs/angular.d.ts" />

module fng.services {

  /*@ngInject*/
  export function SchemasService($http) {
    return {
      getSchema: function (modelName, formName) {
        return $http.get('/api/schema/' + modelName + (formName ? '/' + formName : ''), {cache: true});
      }
    };
  }
}
