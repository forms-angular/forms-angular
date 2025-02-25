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
  export function SubmissionsService($http: angular.IHttpService): fng.ISubmissionsService {
    let useCacheForGetAll = true;
    const expCache = new ExpirationCache();
    /*
     generate a query string for a filtered and paginated query for submissions.
     options consists of the following:
     {
     aggregate - whether or not to aggregate results (http://docs.mongodb.org/manual/aggregation/)
     find - find parameter
     projection - the fields to return
     limit - limit results to this number of records
     skip - skip this number of records before returning results
     order - sort order
     concatenate - whether to concatenate all of the list fields into a single text field (and return { id, text }[]), or not (in which case the documents - albeit only list fields and _id - are returned without transformation)
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
      addParameter('p', options.projection);
      addParameter('a', options.aggregate);
      addParameter('o', options.order);
      addParameter('s', options.skip);
      addParameter('c', options.concatenate);

      return queryString;
    };

    function generateUrl(modelName: string, formName: string, id?: string): string {
      let url = `/api/${modelName}`;
      if (formName) {
        url += `/${formName}`;
      }
      if (id) {
        url += `/${id}`;
      }
      return url;
    }

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

      // return only the list attributes for the given record.  where returnRaw is true, the record's
      // list attributes will be returned without transformation.  otherwise, the list attributes will be concatenated
      // (with spaces) and returned in the form { list: string }
      getListAttributes: function (ref: string, id: any, returnRaw: boolean) {
        const actualId = typeof id === "string" ? id : id.id || id._id || id.x || id;
        if (typeof actualId === "object") {
          throw new Error(`getListAttributes doesn't expect an object but was provided with ${JSON.stringify(id)}`);
        }
        const queryString = returnRaw ? "?returnRaw=1" : "";
        return $http.get(`/api/${ref}/${actualId}/list${queryString}`, { cache: expCache });
      },

      // return only the list attributes for ALL records in the given collection, returning ILookupItem[]
      // getAllPickListAttributes() is intended to be used to retrieve records for display in a picklist;
      // getAllListAttributes() for all other use cases
      getAllListAttributes: function (ref: string): angular.IHttpPromise<ILookupItem[]> {
        return $http.get(`/api/${ref}/listAll`, { cache: expCache });
      },
      getAllPickListAttributes: function (ref: string): angular.IHttpPromise<ILookupItem[]> {
        return $http.get(`/api/${ref}/picklistAll`, { cache: expCache });
      },

      // return only the list attributes for records in the given collection that satisfy the given query conditions (filter, limit etc.)
      // return ILookupItem[] if options.concatenate is true, else the raw documents
      getPagedAndFilteredList: function (ref: string, options) {
        if (options.projection) {
          throw new Error("Cannot use projection option for getPagedAndFilteredList, because it only returns list fields");
        }
        if (options.concatenate === undefined) {
          options.concatenate = false;
        }
        return $http.get(`/api/${ref}/listAll${generateListQuery(options)}`);
      },

      // return ALL attributes for records in the given collection that satisfy the given query conditions (filter, limit etc.)
      getPagedAndFilteredListFull: function (ref: string, options) {
        return $http.get(`/api/${ref}${generateListQuery(options)}`);
      },

      readRecord: function (modelName: string, id: any, formName: string): angular.IHttpPromise<any> {
// TODO Figure out tab history updates (check for other tab-history-todos)
//         let retVal;
//         if (tabChangeData && tabChangeData.model === modelName && tabChangeData.id === id) {
//           retVal = Promise.resolve({data:tabChangeData.record, changed: tabChangeData.changed, master: tabChangeData.master});
//         } else {
          const actualId = typeof id === "string" ? id : id.id || id._id || id.x || id;
          if (typeof actualId === "object") {
            throw new Error(`readRecord doesn't expect an object but was provided with ${JSON.stringify(id)}`);
          }
          const url = generateUrl(modelName, formName, actualId);
          return $http.get(url);
//           retVal = $http.get('/api/' + modelName + '/' + id);
//         }
//         tabChangeData = null;
//         return retVal;
      },

      getAll: function (modelName, _options) {
        var options = angular.extend({
          cache: useCacheForGetAll ? expCache : false
        }, _options);
        return $http.get(`/api/${modelName}`, options);
      },

      deleteRecord: function (modelName: string, id: string, formName: string) {
        const url = generateUrl(modelName, formName, id);
        return $http.delete(url);
      },

      updateRecord: function (modelName: string, id: string, dataToSave: any, formName: string) {
        expCache.remove(`/api/${modelName}`);
        const url = generateUrl(modelName, formName, id);
        return $http.post(url, dataToSave);
      },

      createRecord: function (modelName: string, dataToSave: any, formName: string) {
        expCache.remove(`/api/${modelName}`);
        const url = generateUrl(modelName, formName) + "/new";
        return $http.post(url, dataToSave);
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
