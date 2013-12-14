myDemoApp.directive('contacts', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            priority: 1,
            templateUrl: 'demo/template/contacts.html'
        }
    });

