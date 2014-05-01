'use strict';

var fang = angular.module('formsAngular');


fang.factory( 'ModelsService',
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