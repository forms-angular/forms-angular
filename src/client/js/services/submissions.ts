/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
class ExpirationCache {
  private store;
  private timeout;

  constructor(timeout = 60 * 1000) {
    this.store = new Map();
    this.timeout = timeout;
  }

  get(key) {
    // this.store.has(key) ? console.log(`cache hit`) : console.log(`cache miss`);
    return this.store.get(key);
  }

  put(key, val) {
    this.store.set(key, val);
    // remove it once it's expired
    setTimeout(() => {
      // console.log(`removing expired key ${key}`);
      this.remove(key);
    }, this.timeout);
  }

  remove(key) {
    this.store.delete(key);
  }

  removeAll() {
    this.store = new Map();
  }

  delete() {
    //no op here because this is standalone, not a part of $cacheFactory
  }
}

module fng.services {

  /*@ngInject*/
  export function SubmissionsService($http) {
    let useCacheForGetAll = true;
    const expCache = new ExpirationCache();
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

// TODO Figure out tab history updates (check for other tab-history-todos)
//
//     interface ITabChange {
//       model: string;
//       id: string;
//       record: any;
//       master: any;
//       changed: boolean;
//     }
//
//     let tabChangeData: ITabChange;

    return {
// TODO Figure out tab history updates (check for other tab-history-todos)
//       setUpForTabChange: function(model: string, id: string, data: any, original: any, changed: boolean) {
//         tabChangeData = {
//           model: model,
//           id: id,
//           record: data,
//           master: original,
//           changed: changed
//         };
//       },
      getListAttributes: function (ref: string, id) {
        return $http.get('/api/' + ref + '/' + id + '/list', {cache: expCache});
      },
      readRecord: function (modelName, id): Promise<any> {
// TODO Figure out tab history updates (check for other tab-history-todos)
//         let retVal;
//         if (tabChangeData && tabChangeData.model === modelName && tabChangeData.id === id) {
//           retVal = Promise.resolve({data:tabChangeData.record, changed: tabChangeData.changed, master: tabChangeData.master});
//         } else {
           return $http.get('/api/' + modelName + '/' + id);
//           retVal = $http.get('/api/' + modelName + '/' + id);
//         }
//         tabChangeData = null;
//         return retVal;
      },
      getAll: function (modelName, _options) {
        var options = angular.extend({
          cache: useCacheForGetAll ? expCache : false
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
        expCache.remove('/api/' + modelName);
        return $http.post('/api/' + modelName + '/' + id, dataToSave);
      },
      createRecord: function (modelName, dataToSave) {
        expCache.remove('/api/' + modelName);
        return $http.post('/api/' + modelName, dataToSave);
      },
      useCache: function(val: boolean) {
        useCacheForGetAll = val;
      },
      getCache: function(): boolean {
        return !!expCache;
      },
      clearCache: function() {
        expCache.removeAll();
      }
    };
  }
}
