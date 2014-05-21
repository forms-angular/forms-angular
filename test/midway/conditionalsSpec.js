'use strict';

describe('Condition display', function () {

  var $httpBackend;

  beforeEach(function () {
    angular.mock.module('formsAngular');
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('fixed value', function () {

    var scope, ctrl;

    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond({
        'name': {'instance': 'String'},
        'hide_me': {'instance': 'String', 'options': {'form': {'showIf': {'lhs': 0, 'comp': 'eq', 'rhs': 1}}}},
        'show_me': {'instance': 'String', 'options': {'form': {'showIf': {'lhs': 1, 'comp': 'eq', 'rhs': 1}}}}
      });
      scope = $rootScope.$new();
      $location.$$path = '/collection/new';
      ctrl = $controller('BaseCtrl', {$scope: scope});
      $httpBackend.flush();
    }));

    it('can hide fields', function () {
      expect(scope.formSchema.length).toBe(2);
      expect(scope.formSchema[0].name).toBe('name');
      expect(scope.formSchema[1].name).toBe('show_me');
    });
  });

  xdescribe('shows simple variable value field', function () {
// Can't get this to work - the element isn't there in updateDataDependentDisplay
    var scope, ctrl, elm;

    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location, $compile) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond({
        'name': {'instance': 'String'},
        'change_me': {'instance': 'String', 'options': {'form': {'showIf': {'lhs': '$name', 'comp': 'ne', 'rhs': 'hide'}}}}
      });
      scope = $rootScope.$new();
      $location.$$path = '/collection/new';
      ctrl = $controller('BaseCtrl', {$scope: scope});
      $httpBackend.flush();
      scope.record.name = 'hide';
      elm = angular.element(
          '<form name="myForm" class="form-horizontal compact">' +
          '<form-input schema="formSchema"></form-input>' +
          '</form>');
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('can hide fields', function () {
      expect(elm.find('#cg_f_change_me')).toHaveClass('cond-hide');
    });

  });

});

