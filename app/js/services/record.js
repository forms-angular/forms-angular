'use strict';

var fang = angular.module('formsAngular');


fang.factory( 'RecordService',
[
    'SubmissionsService'
,
function (RecordService) {

    var currentRecord = {};


    return {
        reset: function () {
            currentRecord = {};
        },
        set: function (record) {
            currentRecord = record;
        },
        get: function () {
            return currentRecord;
        },
        lowerCaseify: function () {
            for (var property in currentRecord) {
                if (property !== '_id' && typeof currentRecord[property] === 'string') {
                    currentRecord[property] = currentRecord[property].toLowerCase();
                }
            }
        },
        upperCaseify: function () {
            for (var property in currentRecord) {
                if (property !== '_id' && typeof currentRecord[property] === 'string') {
                    currentRecord[property] = currentRecord[property].toUpperCase();
                }
            }
        },




    };
}]);