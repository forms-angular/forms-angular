'use strict';

describe('Subkeys', function () {

  var input;

  beforeEach(function () {
    angular.mock.module('formsAngular');
  });

  describe('simple subkey', function () {

    var $httpBackend, scope, ctrl, elm,
      subkeySchema = {
        'surname': {'path': 'surname', 'instance': 'String', 'options': {'index': true, 'list': {}}, '_index': true, '$conditionalHandlers': {}},
        'forename': {'path': 'forename', 'instance': 'String', 'options': {'index': true, 'list': true}, '_index': true, '$conditionalHandlers': {}},
        'exams': {
          'schema': {
            'subject': {'path': 'subject', 'instance': 'String', 'options': {}, '_index': null, '$conditionalHandlers': {}},
            'score': {'path': 'score', 'instance': 'Number', 'options': {}, '_index': null, '$conditionalHandlers': {}}
          },
          'options': {
            'form': {
              'formStyle': 'inline',
              'subkey': {
                'keyList': {'subject': 'English'},
                'container': 'fieldset',
                'title': 'English Exam'
              }
            }
          }
        }
      };

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('existing data with selected data present in first position', function () {

      beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/schema/f_nested_schema/English').respond(subkeySchema);
        $httpBackend.whenGET('/api/f_nested_schema/51c583d5b5c51226db418f16').respond({
          '_id': '51c583d5b5c51226db418f16',
          'surname': 'Smith',
          'forename': 'Anne',
          'exams': [
            {
              'subject': 'English',
              'score': 83
            },
            {
              'subject': 'French',
              'score': 34
            },
            {
              'subject': 'Maths',
              'score': 97
            }
          ]
        });
        $location.$$path = '/f_nested_schema/English/51c583d5b5c51226db418f16/edit';
        elm = angular.element(
            '<form name="myForm" class="form-horizontal compact">' +
            '<form-input schema="formSchema"></form-input>' +
            '</form>');
        scope = $rootScope.$new();
        $compile(elm)(scope);
        scope.$digest();
        ctrl = $controller('BaseCtrl', {$scope: scope});
        $httpBackend.flush();
      }));

      it('generates correct fields', function () {
        // correct number of fields - excluding subkey
        input = elm.find('input');
        expect(input.length).toBe(3);

        var label = angular.element(elm.find('label')[0]);
        expect(label.text()).toBe('Surname');
        label = angular.element(elm.find('label')[1]);
        expect(label.text()).toBe('Forename');
        label = angular.element(elm.find('label')[2]);
        expect(label.text()).toBe('Score');

        input = angular.element(elm.find('input')[2]);
        expect(input.val()).toBe('83');
      });

    });

    describe('existing data with selected data present in different position', function () {

      beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/schema/f_nested_schema/English').respond(subkeySchema);
        $httpBackend.whenGET('/api/f_nested_schema/51c583d5b5c51226db418f16').respond({
          '_id': '51c583d5b5c51226db418f16',
          'surname': 'Smith',
          'forename': 'Anne',
          'exams': [
            {
              'subject': 'French',
              'examDate': '2013-03-11T23:00:00.000Z',
              'score': 34,
              'result': 'fail'
            },
            {
              'subject': 'English',
              'examDate': '2013-05-12T23:00:00.000Z',
              'score': 83,
              'result': 'pass'
            },
            {
              'subject': 'Maths',
              'examDate': '2013-05-11T23:00:00.000Z',
              'score': 97,
              'result': 'distinction'
            }
          ]
        });
        $location.$$path = '/f_nested_schema/English/51c583d5b5c51226db418f16/edit';
        elm = angular.element(
            '<form name="myForm" class="form-horizontal compact">' +
            '<form-input schema="formSchema"></form-input>' +
            '</form>');
        scope = $rootScope.$new();
        ctrl = $controller('BaseCtrl', {$scope: scope});
        $httpBackend.flush();
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('gets correct array element', function () {
        input = angular.element(elm.find('input')[2]);
        expect(input.val()).toBe('83');
      });

    });

    describe('existing data without required subschema', function () {

      beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/schema/f_nested_schema/English').respond(subkeySchema);
        $httpBackend.whenGET('/api/f_nested_schema/51c583d5b5c51226db418f16').respond({
          '_id': '51c583d5b5c51226db418f16',
          'surname': 'Smith',
          'forename': 'Anne',
          'exams': [
            {
              'subject': 'French',
              'examDate': '2013-03-11T23:00:00.000Z',
              'score': 34,
              'result': 'fail'
            },
            {
              'subject': 'Maths',
              'examDate': '2013-05-11T23:00:00.000Z',
              'score': 97,
              'result': 'distinction'
            }
          ]
        });
        $location.$$path = '/f_nested_schema/English/51c583d5b5c51226db418f16/edit';
        elm = angular.element(
            '<form name="myForm" class="form-horizontal compact">' +
            '<form-input schema="formSchema"></form-input>' +
            '</form>');
        scope = $rootScope.$new();
        ctrl = $controller('BaseCtrl', {$scope: scope});
        $httpBackend.flush();
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('creates a new array element', function () {
        expect(scope.record.exams.length).toBe(3);
        expect(scope.record.exams[2].subject).toBe('English');
      });

    });

    describe('existing data without any subschema', function () {

      beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/schema/f_nested_schema/English').respond(subkeySchema);
        $httpBackend.whenGET('/api/f_nested_schema/51c583d5b5c51226db418f16').respond({
          '_id': '51c583d5b5c51226db418f16',
          'surname': 'Smith',
          'forename': 'Anne'
        });
        $location.$$path = '/f_nested_schema/English/51c583d5b5c51226db418f16/edit';
        elm = angular.element(
            '<form name="myForm" class="form-horizontal compact">' +
            '<form-input schema="formSchema"></form-input>' +
            '</form>');
        scope = $rootScope.$new();
        ctrl = $controller('BaseCtrl', {$scope: scope});
        $httpBackend.flush();
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('creates a new array element', function () {
        expect(scope.record.exams.length).toBe(1);
        expect(scope.record.exams[0].subject).toBe('English');
      });

    });

    describe('new data', function () {

      beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/schema/f_nested_schema/English').respond(subkeySchema);
        $location.$$path = '/f_nested_schema/English/new';
        elm = angular.element(
            '<form name="myForm" class="form-horizontal compact">' +
            '<form-input schema="formSchema"></form-input>' +
            '</form>');
        scope = $rootScope.$new();
        ctrl = $controller('BaseCtrl', {$scope: scope});
        $httpBackend.flush();
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('creates a new array element', function () {
        expect(scope.record.exams.length).toBe(1);
        expect(scope.record.exams[0].subject).toBe('English');
      });

    });

  });

  describe('two subkeys', function () {

    var $httpBackend, scope, ctrl, elm,
      subkeySchema = {
        'surname': {'path': 'surname', 'instance': 'String', 'options': {'index': true, 'list': {}}, '_index': true, '$conditionalHandlers': {}},
        'forename': {'path': 'forename', 'instance': 'String', 'options': {'index': true, 'list': true}, '_index': true, '$conditionalHandlers': {}},
        'exams': {
          'schema': {
            'subject': {'path': 'subject', 'instance': 'String', 'options': {}, '_index': null, '$conditionalHandlers': {}},
            'score': {'path': 'score', 'instance': 'Number', 'options': {}, '_index': null, '$conditionalHandlers': {}}
          },
          'options': {
            'form': {
              'formStyle': 'inline',
              'subkey': [
                {
                  'keyList': {'subject': 'English'},
                  'container': 'fieldset',
                  'title': 'English Exam'
                },
                {
                  'keyList': {'subject': 'Maths'},
                  'container': 'fieldset',
                  'title': 'Maths Exam'
                }
              ]
            }
          }
        }
      };

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('existing data with selected data', function () {

      beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/schema/f_nested_schema/English').respond(subkeySchema);
        $httpBackend.whenGET('/api/f_nested_schema/51c583d5b5c51226db418f16').respond({
          '_id': '51c583d5b5c51226db418f16',
          'surname': 'Smith',
          'forename': 'Anne',
          'exams': [
            {
              'subject': 'English',
              'score': 83
            },
            {
              'subject': 'French',
              'score': 34
            },
            {
              'subject': 'Maths',
              'score': 97
            }
          ]
        });
        $location.$$path = '/f_nested_schema/English/51c583d5b5c51226db418f16/edit';
        elm = angular.element(
            '<form name="myForm" class="form-horizontal compact">' +
            '<form-input schema="formSchema"></form-input>' +
            '</form>');
        scope = $rootScope.$new();
        $compile(elm)(scope);
        scope.$digest();
        ctrl = $controller('BaseCtrl', {$scope: scope});
        $httpBackend.flush();
      }));

      it('generates correct fields', function () {
        // correct number of fields - excluding subkey
        var input = elm.find('input');
        expect(input.length).toBe(4);

        var label = angular.element(elm.find('label')[0]);
        expect(label.text()).toBe('Surname');
        label = angular.element(elm.find('label')[1]);
        expect(label.text()).toBe('Forename');
        label = angular.element(elm.find('label')[2]);
        expect(label.text()).toBe('Score');
        label = angular.element(elm.find('label')[3]);
        expect(label.text()).toBe('Score');

        input = angular.element(elm.find('input')[2]);
        expect(input.val()).toBe('83');
        input = angular.element(elm.find('input')[3]);
        expect(input.val()).toBe('97');
      });

    });

  });

});


