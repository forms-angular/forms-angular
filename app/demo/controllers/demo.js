'use strict';

var demo = angular.module('myDemoApp');

demo.controller( 'DemoCtrl',
[
'$scope', '$location', '$anchorScroll'
,
function($scope, $location, $anchorScroll) {

    $scope.scrollToSection = function(id) {
        $location.hash(id);
        $anchorScroll();
    };

}]);

