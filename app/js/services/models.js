'use strict';

var fng = angular.module('formsAngular');


fng.factory( 'ModelsService',
[
    '$http'
,
function ($http) {
    return {
        getAll: function () {
            return $http.get('/api/models');
        }
    };
}]);