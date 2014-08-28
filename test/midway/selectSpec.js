'use strict';

describe('Select.', function () {

  // load the form code
  beforeEach(angular.mock.module('formsAngular'));

  describe('handles selects for reference lookups', function () {

    var scope, ctrl;
    var elm, $httpBackend;

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond({
        'textField': {'path': 'textField', 'instance': 'String', 'options': {'form': {'label': 'Organisation Name'}, 'list': true}},
        'lookupField': {'path': 'lookupField', 'instance': 'ObjectID', 'options': {'ref': 'person'}},
        'eyeColour': {'enumValues': ['Blue', 'Brown', 'Green', 'Hazel'], 'path': 'eyeColour', 'instance': 'String', 'validators': [
          [null, 'Path `{PATH}` is required.', 'required'],
          [null, '`{VALUE}` is not a valid enum value for path `{PATH}`.', 'enum']
        ], 'options': {'required': true, 'enum': ['Blue', 'Brown', 'Green', 'Hazel']}, 'isRequired': true}
      });
      $httpBackend.whenGET('/api/collection/3').respond({'textField': 'This is some text', 'lookupField': '3', 'eyeColour': 'Brown'});
      $httpBackend.whenGET('/api/schema/person').respond({
        '_id': {'path': '_id', 'instance': 'ObjectID', 'setters': [null], 'options': {'auto': true}},
        'givenName': {'path': 'givenName', 'instance': 'String', 'options': {'list': true, 'index': true, 'form': {'label': 'Forename', 'pane': 'Personal'}}, '_index': true},
        'familyName': {'path': 'familyName', 'instance': 'String', 'validators': [
          [null, 'Path `{PATH}` is required.', 'required']
        ], 'options': {'required': true, 'index': true, 'list': true, 'form': {'label': 'Surname', 'pane': 'Personal'}}, '_index': true, 'isRequired': true},
        'title': {'path': 'title', 'instance': 'String', 'options': {'form': {'pane': 'Personal'}}},
        'sex': {'enumValues': ['F', 'M'], 'path': 'sex', 'instance': 'String', 'validators': [
          [null, '`{VALUE}` is not a valid enum value for path `{PATH}`.', 'enum']
        ], 'options': {'enum': ['F', 'M'], 'form': {'pane': 'Personal'}}}
      });
      $httpBackend.whenGET('/api/person').respond([
        {'_id': '1', 'givenName': 'John', 'familyName': 'Smith', 'title': 'Mr' },
        {'_id': '2', 'givenName': 'Anne', 'familyName': 'Brown', 'title': 'Mrs' },
        {'_id': '3', 'givenName': 'Jenny', 'familyName': 'Rogers', 'title': 'Ms' }
      ]);

      $location.$$path = '/collection/3/edit';
      scope = $rootScope.$new();
      ctrl = $controller('BaseCtrl', {$scope: scope});

      elm = angular.element('<form name="myForm" class="form-horizontal compact"> ' +
        '<form-input schema="formSchema"></form-input>' +
        '</form>');

      $compile(elm)(scope);
      $httpBackend.flush();
      scope.$digest();
    }));

    it('has selects for enum and lookup', function () {
      expect(elm.find('select').length).toBe(2);
    });

    it('enum should convert to forms-angular format', function () {
      expect(scope.record.eyeColour).toBe('Brown');
    });

    it('enum field should have combobox', function () {
      var input = angular.element(elm.find('select')[1]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('f_eyeColour');
      expect(input.val()).toBe('Brown');

      input = input.find('option');
      expect(input.length).toBe(5);

      var option = angular.element(input[0]);
      expect(option.text()).toBe('');

      option = angular.element(input[4]);
      expect(option.text()).toBe('Hazel');
    });

    it('lookup should convert to forms-angular format', function () {
      expect(scope.record.lookupField).toBe('Jenny Rogers');
    });

    it('lookup field should have combobox', function () {
      var input = angular.element(elm.find('select')[0]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('f_lookupField');
      expect(input.val()).toBe('Jenny Rogers');

      input = input.find('option');
      expect(input.length).toBe(4);

      var option = angular.element(input[0]);
      expect(option.text()).toBe('');

      option = angular.element(input[3]);
      expect(option.text()).toBe('John Smith');
    });


  });

  describe('handles selects for nested reference lookups (issue #37)', function () {

    var scope, ctrl;
    var elm, $httpBackend;

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/Component').respond({name: {path: 'name', instance: 'String'}, weight: {path: 'weight', instance: 'Number'},
        _id: {path: '_id', instance: 'ObjectID', options: {auto: true}, _index: null}});
      $httpBackend.whenGET('/api/schema/Car').respond({'name': {'path': 'name', 'instance': 'String'}, 'ComponentDescriptions': {'schema': {
        'quantity': {'path': 'quantity', 'instance': 'Number', 'options': {}, '_index': null, '$conditionalHandlers': {}},
        'component': {'path': 'component', 'instance': 'ObjectID', 'options': {'ref': 'Component'}, '_index': null, '$conditionalHandlers': {}},
        '_id': {'path': '_id', 'instance': 'ObjectID', 'validators': [], 'setters': [null], 'getters': [], 'options': {'auto': true}, '_index': null, '$conditionalHandlers': {}}
      }, 'options': {'form': {'formStyle': 'inline'}}}, '_id': {'path': '_id', 'instance': 'ObjectID', 'options': {'auto': true}, '_index': null, '$conditionalHandlers': {}}});
      $httpBackend.whenGET('/api/Car/3').respond({name: '2O + W', _id: '3', ComponentDescriptions: [{component: '12', quantity: 2}, {quantity: 1, component: '45'}]});
      $httpBackend.whenGET('/api/Component').respond([{name: 'Widget', weight: 2, _id: '45'}, {name: 'Thingummy', weight: 5, _id: '99' }, {name: 'Ooojamaflip', weight: 8, _id: '12'}]);
      $location.$$path = '/Car/3/edit';
      scope = $rootScope.$new();
      ctrl = $controller('BaseCtrl', {$scope: scope});

      elm = angular.element('<form name="myForm" class="form-horizontal compact"> ' +
        '<form-input schema="formSchema"></form-input>' +
        '</form>');

      $compile(elm)(scope);
      $httpBackend.flush();
      scope.$digest();
    }));

    it('should contain two lookups', function () {
      var input = angular.element(elm.find('select'));
      expect(input.length).toBe(2);
    });

    it('should have converted values', function () {
      var input = angular.element(elm.find('select')[0]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.val()).toBe('Ooojamaflip');

      input = angular.element(elm.find('select')[1]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.val()).toBe('Widget');
    });

  });

});

