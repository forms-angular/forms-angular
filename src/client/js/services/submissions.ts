/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.services {

  /*@ngInject*/
  export function SubmissionsService($http, $cacheFactory) {
    /*
     generate a query string for a filtered and paginated query for submissions.
     options consists of the following:
     {
     aggregate - whether or not to aggregate results (http://docs.mongodb.org/manual/aggregation/)
     find - find parameter
     limit - limit results to this number of records
     skip - skip this number of records before returning results
     order - sort order
     }
     */
    var generateListQuery = function (options) {
      var queryString = '';

      var addParameter = function (param, value) {
        if (value !== undefined && value !== '') {
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          if (queryString === '') {
            queryString = '?';
          } else {
            queryString += '&';
          }
          queryString += param + '=' + value;
        }
      };

      addParameter('l', options.limit);
      addParameter('f', options.find);
      addParameter('a', options.aggregate);
      addParameter('o', options.order);
      addParameter('s', options.skip);

      return queryString;
    };

    interface ITabChange {
      model: string;
      id: string;
      record: any;
      master: any;
      changed: boolean;
    }

    let tabChangeData: ITabChange;

    return {
      setUpForTabChange: function(model: string, id: string, data: any, original: any, changed: boolean) {
        tabChangeData = {
          model: model,
          id: id,
          record: data,
          master: original,
          changed: changed
        };
      },
      getListAttributes: function (ref, id) {
        return $http.get('/api/' + ref + '/' + id + '/list');
      },
      readRecord: function (modelName, id): Promise<any> {
        let retVal;
        if (tabChangeData && tabChangeData.model === modelName && tabChangeData.id === id) {
          retVal = Promise.resolve({data:tabChangeData.record, changed: tabChangeData.changed, master: tabChangeData.master});
        } else {
          retVal = $http.get('/api/' + modelName + '/' + id);
        }
        tabChangeData = null;
        return retVal;
      },
      getAll: function (modelName, _options) {
        var options = angular.extend({
          cache: true
        }, _options);
        return $http.get('/api/' + modelName, options);
      },
      getPagedAndFilteredList: function (modelName, options) {
        return $http.get('/api/' + modelName + generateListQuery(options));
      },
      deleteRecord: function (model, id) {
        return $http.delete('/api/' + model + '/' + id);
      },
      updateRecord: function (modelName, id, dataToSave) {
        $cacheFactory.get('$http').remove('/api/' + modelName);
        return $http.post('/api/' + modelName + '/' + id, dataToSave);
      },
      createRecord: function (modelName, dataToSave) {
        $cacheFactory.get('$http').remove('/api/' + modelName);
        return $http.post('/api/' + modelName, dataToSave);
      }

    };
  }
}
