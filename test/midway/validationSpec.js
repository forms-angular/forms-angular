'use strict';

describe('validation', function () {
  var elm, scope, ctrl, $httpBackend;

  // load the form code
  beforeEach(angular.mock.module('formsAngular'));

  describe('pattern matching', function () {

    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location, $compile) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond({'postcode': {'enumValues': [], 'regExp': null, 'path': 'address.postcode', 'instance': 'String', 'validators': [
        [null, 'Path `{PATH}` is invalid ({VALUE}).', 'regexp']
      ], 'setters': [], 'getters': [], 'options': {
        'match': '(GIR 0AA)|([A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][ABD-HJLNP-UW-Z]{2})',
        'form': {'label': 'Postcode', 'size': 'small', 'help': 'Enter your UK postcode (for example TN2 1AA)'}
      }, '_index': null, '$conditionalHandlers': {}}});
      $httpBackend.whenGET('/api/collection/123').respond({postcode: '1234'});
      elm = angular.element('<div><form-input schema="formSchema"></form-input></div>');
      scope = $rootScope.$new();
      $location.$$path = '/collection/123/edit';
      ctrl = $controller('BaseCtrl', {$scope: scope});
      $httpBackend.flush();
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('generates the appropriate HTML', function () {
      var el = elm.find('input');
      expect(el.attr('pattern')).toMatch(/GIR 0AA/);
    });

  });

  describe('number validation', function () {

    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location, $compile) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond({'weight': {'path': 'weight', 'instance': 'Number', 'validators': [
        [null, 'Path `{PATH}` ({VALUE}) is less than minimum allowed value (5).', 'min'],
        [null, 'Path `{PATH}` ({VALUE}) is more than maximum allowed value (300).', 'max']
      ], 'setters': [], 'getters': [], 'options': {'min': 5, 'max': 300, 'form': {'label': 'Approx Weight (lbs)', 'step': 5}}, '_index': null, '$conditionalHandlers': {}}});
      $httpBackend.whenGET('/api/collection/123').respond({weight: 700});
      elm = angular.element('<div><form-input schema="formSchema"></form-input></div>');
      scope = $rootScope.$new();
      $location.$$path = '/collection/123/edit';
      ctrl = $controller('BaseCtrl', {$scope: scope});
      $httpBackend.flush();
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('supports min', function () {
      var el = elm.find('input');
      expect(el.attr('min')).toBe('5');
    });

    it('supports max', function () {
      var el = elm.find('input');
      expect(el.attr('max')).toBe('300');
    });

    it('supports step', function () {
      var el = elm.find('input');
      expect(el.attr('step')).toBe('5');
    });

  });

});

