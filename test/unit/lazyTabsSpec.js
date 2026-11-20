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
