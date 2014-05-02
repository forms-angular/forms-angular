'use strict';

var fang = angular.module('formsAngular');


fang.factory( 'SchemasService',
[
    '$http'
,
function ($http) {
    return {
        getSchema: function (modelName, formName) {
            return $http.get('/api/schema/' + modelName + (formName ? '/' + formName : ''), {cache: true});
        }
    };
}]);