'use strict';

describe('formButton', function () {
  var elm, scope, ctrl, $httpBackend;

  beforeEach(function () {
      angular.mock.module('formsAngular');
      angular.mock.module('template/form-button-bs2.html');
    }
  );

  describe('form generation', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><div form-buttons></div></div>');

      scope = $rootScope;
      $compile(elm)(scope);
      scope.$digest();
    }));


    it('should have Save, Cancel, New and Delete buttons', function () {
      var buttons = elm.find('button');

      expect(buttons.length).toBe(4);
      expect(buttons.eq(0).text().trim()).toBe('Save');
      expect(buttons.eq(1).text().trim()).toBe('Cancel');
      expect(buttons.eq(2).text().trim()).toBe('New');
      expect(buttons.eq(3).text().trim()).toBe('Delete');
    });

  });

  describe('controller', function () {

    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location, $compile) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond({
        'name': {'instance': 'String'},
        'surname': {'instance': 'String' }
      });
      scope = $rootScope.$new();
      $location.$$path = '/collection/new';
      ctrl = $controller('BaseCtrl', {$scope: scope});

      elm = angular.element('<div><div form-buttons></div><form-input schema="formSchema"></form-input></div>');

      $compile(elm)(scope);
      scope.$digest();

      $httpBackend.flush();
    }));

    it('disables save button until a change is made', function () {
      expect(scope.isSaveDisabled()).toEqual(true);
    });

    it('disables cancel button until a change is made', function () {
      expect(scope.isCancelDisabled()).toEqual(true);
    });

    it('enables save button when a change is made', function () {
      var elem = angular.element(elm.find('input')[0]);
      elem.val('new name');
      elem.triggerHandler('change');
      expect(scope.isSaveDisabled()).toEqual(false);
    });

    it('enables cancel button when a change is made', function () {
      var elem = angular.element(elm.find('input')[0]);
      elem.val('new name');
      elem.triggerHandler('change');
      expect(scope.isCancelDisabled()).toEqual(false);
    });

  });

});
