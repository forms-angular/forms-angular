'use strict';

describe('Links', function () {

  var $httpBackend;

  beforeEach(function () {
    angular.mock.module('formsAngular');
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('simple link', function () {
    var elm, scope, ctrl;

    beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond({
        'textField': {'path': 'textField', 'instance': 'String', 'options': {'form': {'label': 'Organisation Name'}, 'list': true}, '_index': null},
        'lookupField': {'path': 'lookupField', 'instance': 'ObjectID', 'options': {'ref': 'Person', form: {link: {linkOnly: true, text: 'My link text'}}}, '_index': null}
      });
      $httpBackend.whenGET('/api/collection/3').respond({'textField': 'This is some text', 'lookupField': 123456789});
      $location.$$path = '/collection/3/edit';
      scope = $rootScope.$new();
      ctrl = $controller('BaseCtrl', {$scope: scope});
      elm = angular.element(
        '<form name="myForm" class="form-horizontal compact">' +
        '<form-input schema="formSchema"></form-input>' +
        '</form>');
      $compile(elm)(scope);
      scope.$digest();
      $httpBackend.flush();
    }));

   it('generates correct schema', function () {
      expect(scope.formSchema[1].ref).toBe('Person');
      expect(scope.formSchema[1].type).toBe('link');
      expect(scope.formSchema[1].linkText).toBe('My link text');
      expect(scope.formSchema[1].link).toBe(undefined);
    });

    it('should have a link', function () {
      var anchor = elm.find('a');
      expect(anchor.attr('href')).toMatch('\/Person\/123456789\/edit$');
      expect(anchor.text()).toBe('My link text');
    });

  });

  describe('link to a form schema', function () {
    var elm, scope, ctrl;

    beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond({
        'textField': {'path': 'textField', 'instance': 'String', 'options': {'form': {'label': 'Organisation Name'}, 'list': true}, '_index': null},
        'lookupField': {'path': 'lookupField', 'instance': 'ObjectID', 'options': {'ref': 'Person', form: {link: {linkOnly: true, form: 'myschema', text: 'My link text'}}}, '_index': null}
      });
      $httpBackend.whenGET('/api/collection/3').respond({'textField': 'This is some text', 'lookupField': 123456789});
      $location.$$path = '/collection/3/edit';
      scope = $rootScope.$new();
      ctrl = $controller('BaseCtrl', {$scope: scope});
      elm = angular.element(
        '<form name="myForm" class="form-horizontal compact">' +
        '<form-input schema="formSchema"></form-input>' +
        '</form>');
      $compile(elm)(scope);
      scope.$digest();
      $httpBackend.flush();
    }));

    it('generates correct schema', function () {
      expect(scope.formSchema[1].ref).toBe('Person');
      expect(scope.formSchema[1].type).toBe('link');
      expect(scope.formSchema[1].form).toBe('myschema');
      expect(scope.formSchema[1].linkText).toBe('My link text');
      expect(scope.formSchema[1].link).toBe(undefined);
    });

    it('should have a link', function () {
      var anchor = elm.find('a');
      expect(anchor.attr('href')).toMatch('\/Person\/myschema\/123456789\/edit$');
      expect(anchor.text()).toBe('My link text');
    });

  });

});
