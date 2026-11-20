'use strict';

describe('lazy tabs', function () {
  var elm, scope;

  beforeEach(angular.mock.module('formsAngular'));

  function compileTabbedForm($rootScope, $compile, lazyTabs) {
    elm = angular.element('<div><form-input schema="formSchema"></form-input></div>');
    scope = $rootScope.$new();
    scope.sharedData = { lazyTabs: lazyTabs, modelControllers: [] };
    scope.record = { name: 'Fred', eyeColour: 'Blue' };
    scope.tabs = [{ title: 'First' }, { title: 'Second' }];
    scope.formSchema = [
      { containerType: 'tab', title: 'First', content: [{ name: 'name', id: 'nameId', label: 'Name', type: 'text' }] },
      { containerType: 'tab', title: 'Second', content: [{ name: 'eyeColour', id: 'eyeColourId', label: 'Eye Colour', type: 'text' }] }
    ];
    $compile(elm)(scope);
    scope.$digest();
  }

  function byId(id) {
    return elm[0].querySelectorAll('#' + id);
  }

  function selectTab(n) {
    angular.element(elm[0].querySelectorAll('ul.nav-tabs li a')[n]).triggerHandler('click');
    scope.$digest();
  }

  describe('when sharedData.lazyTabs is set', function () {
    beforeEach(inject(function ($rootScope, $compile) {
      compileTabbedForm($rootScope, $compile, true);
    }));

    it('only compiles the contents of the active tab', function () {
      expect(byId('nameId').length).toBe(1);
      expect(byId('eyeColourId').length).toBe(0);
    });

    it('compiles a tab when it is first selected, and keeps it', function () {
      selectTab(1);
      expect(byId('eyeColourId').length).toBe(1);
      expect(byId('eyeColourId')[0].value).toBe('Blue');
      selectTab(0);
      expect(byId('nameId').length).toBe(1);
      expect(byId('eyeColourId').length).toBe(1);
    });

    it('applies late conversions, broadcasts fngTabRendered and calls updateQueryForTab only once the tab has been compiled', inject(function ($rootScope, $timeout) {
      $timeout.flush(); // the initial selection of the first tab
      var seen = [];
      scope.updateQueryForTab = function (tab) {
        seen.push('update ' + tab + ' ' + byId('eyeColourId').length);
      };
      scope.applyLateConversions = function () {
        seen.push('conversions ' + byId('eyeColourId').length);
      };
      $rootScope.$on('fngTabRendered', function (event, tab) {
        seen.push('rendered ' + tab + ' ' + byId('eyeColourId').length);
      });
      selectTab(1);
      expect(seen).toEqual([]);
      $timeout.flush();
      expect(seen).toEqual(['conversions 1', 'rendered Second 1', 'update Second 1']);
      selectTab(0);
      selectTab(1);
      $timeout.verifyNoPendingTasks();
      expect(seen).toEqual(['conversions 1', 'rendered Second 1', 'update Second 1', 'update First 1', 'update Second 1']);
    }));

    it('compiles every tab with the same scope, as it does when all tabs are compiled up front', function () {
      selectTab(1);
      var firstScope = angular.element(byId('nameId')[0]).scope();
      var secondScope = angular.element(byId('eyeColourId')[0]).scope();
      expect(secondScope).toBe(firstScope);
    });

    it('leaves the form pristine when a tab is compiled', function () {
      selectTab(1);
      expect(scope.myForm.$pristine).toBe(true);
    });
  });

  describe('when sharedData.lazyTabs is not set', function () {
    beforeEach(inject(function ($rootScope, $compile) {
      compileTabbedForm($rootScope, $compile, false);
    }));

    it('compiles every tab', function () {
      expect(byId('nameId').length).toBe(1);
      expect(byId('eyeColourId').length).toBe(1);
      expect(scope.fngTabRendered).toBeUndefined();
    });
  });
});
