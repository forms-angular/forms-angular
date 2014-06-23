'use strict';

formsAngular.factory('SubmissionsService', ['$http', function ($http) {
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
    var queryString = '?l=' + options.limit;

    var addParameter = function (param, value) {
      if (value && value !== '') {
        queryString += '&' + param + '=' + value;
      }
    };

    addParameter('f', options.find);
    addParameter('a', options.aggregate);
    addParameter('o', options.order);
    addParameter('s', options.skip);

    return queryString;
  };

  return {
    getListAttributes: function (ref, id) {
      return $http.get('/api/' + ref + '/' + id + '/list');
    },
    readRecord: function (modelName, id) {
      return $http.get('/api/' + modelName + '/' + id);
    },
    getAll: function (modelName) {
      return $http.get('/api/' + modelName, {cache: true});
    },
    getPagedAndFilteredList: function (modelName, options) {
      return $http.get('/api/' + modelName + generateListQuery(options));
    },
    deleteRecord: function (model, id) {
      return $http.delete('/api/' + model + '/' + id);
    },
    updateRecord: function (modelName, id, dataToSave) {
      return $http.post('/api/' + modelName + '/' + id, dataToSave);
    },
    createRecord: function (modelName, dataToSave) {
      return $http.post('/api/' + modelName, dataToSave);
    }

  };
}]);
