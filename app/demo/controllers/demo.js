myDemoApp.controller('DemoCtrl', function($scope, $location, $anchorScroll) {

    $scope.scrollToSection = function(id) {
        $location.hash(id);
        $anchorScroll();
    };

});

