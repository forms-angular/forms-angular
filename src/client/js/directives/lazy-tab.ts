/// <reference path="../../index.d.ts" />

module fng.directives {

  /*
   * Used by the form directive when sharedData.lazyTabs is set: holds back the compilation of its contents until the
   * expression it is given becomes truthy (when the tab is first selected), then compiles them once.
   *
   * Unlike ng-if, this does not create a scope.  Every tab's contents share a scope, and there is code that relies on
   * that (something a directive on one tab puts on its scope being seen by a directive on another, for example).
   */
  /*@ngInject*/
  export function fngLazyTab($compile: angular.ICompileService): angular.IDirective {
    return {
      restrict: 'A',
      terminal: true,
      priority: 1000,
      compile: function (tElement: angular.IAugmentedJQuery) {
        const contents = tElement.contents().remove();
        return function (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) {
          const unwatch = scope.$watch(attrs['fngLazyTab'], (value) => {
            if (value) {
              unwatch();
              // in the DOM before linking, so that directives can find their parents' controllers (the form, for example)
              element.append(contents);
              $compile(contents)(scope);
            }
          });
        };
      }
    };
  }
}
