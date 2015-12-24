/// <reference path="../../typings/angularjs/angular.d.ts" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        function SubmissionsService($http, $cacheFactory) {
            var generateListQuery = function (options) {
                var queryString = '';
                var addParameter = function (param, value) {
                    if (value && value !== '') {
                        if (typeof value === 'object') {
                            value = JSON.stringify(value);
                        }
                        if (queryString === '') {
                            queryString = '?';
                        }
                        else {
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
            return {
                getListAttributes: function (ref, id) {
                    return $http.get('/api/' + ref + '/' + id + '/list');
                },
                readRecord: function (modelName, id) {
                    return $http.get('/api/' + modelName + '/' + id);
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
        services.SubmissionsService = SubmissionsService;
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
