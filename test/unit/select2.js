'use strict';

describe('select2', function () {

  var scope, ctrl, $httpBackend;

  // load the form code
  beforeEach(angular.mock.module('formsAngular'));

  describe('generates select2s for reference lookups', function () {

    beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond(
        {'surname': {'enumValues': [], 'regExp': null, 'path': 'surname', 'instance': 'String', 'validators': [
          [null, 'required']
        ], 'setters': [], 'getters': [], 'options': {'required': true}, '_index': null, 'isRequired': true},
          'eyeColour': {'enumValues': ['Blue', 'Brown', 'Green', 'Hazel'], 'regExp': null, 'path': 'eyeColour', 'instance': 'String', 'validators': [
            [null, 'enum']
          ], 'options': {
            'enum': ['Blue', 'Brown', 'Green', 'Hazel'],
            'required': false,
            'form': {'placeHolder': 'Select eye colour', 'select2': {}}
          }, '_index': null, 'isRequired': false, '$conditionalHandlers': {}}}
      );
      scope = $rootScope.$new();
      $location.$$path = '/collection/new';
      ctrl = $controller('BaseCtrl', {$scope: scope});
      $httpBackend.flush();
    }));

    it('creates correct formschema elements', function () {
      expect(scope.formSchema.length).toBe(2);
      expect(scope.formSchema[1].placeHolder).toBe('Select eye colour');
      expect(scope.formSchema[1].select2.s2query).toBe('select2eyeColour');
      expect(scope[scope.formSchema[1].select2.s2query].allowClear).toBe(true);
      expect(typeof scope[scope.formSchema[1].select2.s2query].initSelection).toBe('function');
      expect(typeof scope[scope.formSchema[1].select2.s2query].query).toBe('function');
      expect(scope.formSchema[1].type).toBe('select');
      expect(scope.formSchema[1].hasOwnProperty('required')).toBe(false);
    });
  });

  describe('generates correct values in record', function () {

    beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond(
        {'surname': {'enumValues': [], 'regExp': null, 'path': 'surname', 'instance': 'String', 'validators': [
          [null, 'required']
        ], 'setters': [], 'getters': [], 'options': {'required': true}, '_index': null, 'isRequired': true},
          'eyeColour': {'enumValues': ['Blue', 'Brown', 'Green', 'Hazel'], 'regExp': null, 'path': 'eyeColour', 'instance': 'String', 'validators': [
            [null, 'enum']
          ], 'options': {
            'enum': ['Blue', 'Brown', 'Green', 'Hazel'],
            'required': false,
            'form': {'placeHolder': 'Select eye colour', 'select2': {}}
          }, '_index': null, 'isRequired': false, '$conditionalHandlers': {}}}
      );
      $httpBackend.whenGET('/api/collection/3').respond(
        {'surname': 'Smith', 'eyeColour': 'Green'}
      );
      scope = $rootScope.$new();
      $location.$$path = '/collection/3/edit';
      ctrl = $controller('BaseCtrl', {$scope: scope});
      $httpBackend.flush();
    }));

    it('(text)', function () {
      expect(scope.record.eyeColour.text).toBe('Green');
    });

    it('(id)', function () {
      expect(scope.record.eyeColour.id).toBe(2);
    });
  });

// TODO - getting rid of this for now
// Intend to reintroduce when have done something to decouple schema and formSchema

//    describe('handles required fields appropriately', function () {
//
//        beforeEach(inject(function(_$httpBackend_, $rootScope, $location, $controller, $compile) {
//            $httpBackend = _$httpBackend_;
//            $httpBackend.whenGET('api/schema/collection').respond({ 'eyeColour':{'enumValues':['Blue','Brown','Green','Hazel'],'regExp':null,'path':'eyeColour','instance':'String',
//            'validators':[[null,'enum']],'setters':[],'getters':[],'options':{'enum':['Blue','Brown','Green','Hazel'],'required':false,'form':{'placeHolder':'Select eye colour','select2':{}}},
//            '_index':null,'isRequired':false,'$conditionalHandlers':{}}});
//            scope = $rootScope.$new();
//            $location.$$path = '/collection/new';
//            ctrl = $controller('BaseCtrl', {$scope: scope});
//            $httpBackend.flush();
//
//            elm = angular.element(
//                '<form name='myForm' class='form-horizontal compact'>' +
////                    '<form-input info='{{formSchema[0]}}'></form-input>' +
//                    '<form-input ng-repeat='field in formSchema' info='{{field}}'></form-input>'+
//
//                    '</form>');
//            $compile(elm)(scope);
//            scope.$digest();
//        }));
//
//        it('should have a label', function () {
//            var label = elm.find('label');
//            expect(label.text()).toBe('Eye Colour');
//            var cg = elm.find(the control group'label');
//            expect(label).toHaveClass(whatever the required class is 'control-label');
//        });
//    });

});


