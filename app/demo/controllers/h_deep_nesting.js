'use strict';

var demo = angular.module('myDemoApp');

demo.controller( 'HDeepNestingCtrl',
[
    '$data'
,
function($data) {
    $data.modelNameDisplay = "Nesting (work in early progress - buggy)";
}]);

