/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.services {

  /*@ngInject*/
  export function SchemasService($http) {

    let models: Promise<[{[modelName: string]: string[]}]>;

    return {
      getModels: function() {
        if (!models) {
          models = $http.get('/api/models').then(response => response.data.map(r => r.resourceName));
        }
        return models;
      },
      getSchema: function (modelName, formName) {
        return $http.get('/api/schema/' + modelName + (formName ? '/' + formName : ''), {cache: true});
      }
    };
  }
}
