angular.module('ui.bootstrap.tabs', [])
    .controller('TabsController', ['$scope', '$element', function($scope, $element) {
    var panes = $scope.panes = [];

    $scope.select = function selectPane(pane) {
        angular.forEach(panes, function(pane) {
            pane.selected = false;
        });
        pane.selected = true;
    };

    this.addPane = function addPane(pane) {
        if (!panes.length) {
            $scope.select(pane);
        }
        panes.push(pane);
    };

    this.removePane = function removePane(pane) {
        var index = panes.indexOf(pane);
        panes.splice(index, 1);
        //Select a new pane if removed pane was selected
        if (pane.selected && panes.length > 0) {
            $scope.select(panes[index < panes.length ? index : index-1]);
        }
    };
}])
    .directive('tabs', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: 'TabsController',
            template:
                '<div class="tabbable">' +
                   '<ul class="nav nav-tabs">' +
                     '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
                       '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
                     '</li>' +
                   '</ul>' +
                   '<div class="tab-content" ng-transclude></div>' +
                '</div>',
            replace: true
        };
    })
    .directive('pane', function() {
        return {
            require: '^tabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            link: function(scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
                scope.$on('$destroy', function() {
                    tabsCtrl.removePane(scope);
                });
            },
            template: '<div class="tab-pane" ng-class="{active: selected}" ng-show="selected" ng-transclude></div>',
            replace: true
        };
    });
