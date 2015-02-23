'use strict';

describe('validation', function () {
  var elm, scope, ctrl, $httpBackend;

  // load the form code
  beforeEach(angular.mock.module('formsAngular'));

  describe('pattern matching', function () {

    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location, $compile) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/api/schema/collection').respond({
        'postcode': {
          'enumValues': [], 'regExp': null, 'path': 'address.postcode', 'instance': 'String', 'validators': [
            [null, 'Path `{PATH}` is invalid ({VALUE}).', 'regexp']
          ], 'setters': [], 'getters': [], 'options': {
            'match': '(GIR 0AA)|([A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][ABD-HJLNP-UW-Z]{2})',
            'form': {'label': 'Postcode', 'size': 'small', 'help': 'Enter your UK postcode (for example TN2 1AA)'}
          }, '_index': null, '$conditionalHandlers': {}
        }
      });
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
      $httpBackend.whenGET('/api/schema/collection').respond({
        'weight': {
          'path': 'weight',
          'instance': 'Number',
          'validators': [
            [null, 'Path `{PATH}` ({VALUE}) is less than minimum allowed value (5).', 'min'],
            [null, 'Path `{PATH}` ({VALUE}) is more than maximum allowed value (300).', 'max']
          ],
          'setters': [],
          'getters': [],
          'options': {'min': 5, 'max': 300, 'form': {'label': 'Approx Weight (lbs)', 'step': 5}},
          '_index': null,
          '$conditionalHandlers': {}
        }
      });
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

  describe('BS3 Validation Styling', function () {

    describe('simple required input', function () {

      beforeEach(inject(function (_$httpBackend_, $rootScope, $compile, $location, $controller, cssFrameworkService) {
        cssFrameworkService.setFrameworkForDemoWebsite('bs3');
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/schema/collection').respond({
          'surname': {
            'enumValues': [],
            'regExp': null,
            'path': 'surname',
            'instance': 'String',
            'validators': [[null, 'Path `{PATH}` is required.', 'required']],
            'setters': [],
            'getters': [],
            'options': {'index': true, 'required': true, 'list': {}},
            '_index': true,
            'isRequired': true,
            '$conditionalHandlers': {}
          }
        });
        elm = angular.element('<div><form-input formStyle="horizontalCompact" schema="formSchema"></form-input></div>');
        scope = $rootScope.$new();
        scope.topLevelFormName = 'baseForm';
        $location.$$path = '/collection/new';
        ctrl = $controller('BaseCtrl', {$scope: scope});
        $httpBackend.flush();
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('has class has-error', function () {
        var group = elm.find('label').parent();
        expect(group).toHaveClass('has-error');
        expect(group).toHaveClass('form-group');
      });

    });

    describe('nested required input', function () {

      beforeEach(inject(function (_$httpBackend_, $rootScope, $compile, $location, $controller, cssFrameworkService) {
        cssFrameworkService.setFrameworkForDemoWebsite('bs3');
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/schema/collection').respond({
            'surname': {
              'path': 'surname',
              'instance': 'String',
              'validators': [[null, 'Path `{PATH}` is required.', 'required']],
              'options': {'index': true, 'required': true, 'list': {}},
              '_index': true,
              'isRequired': true
            },
            'forename': {
              'path': 'forename',
              'instance': 'String',
              'options': {'index': true, 'list': true},
              '_index': true
            },
            'exams': {
              'schema': {
                'subject': {
                  'path': 'subject',
                  'instance': 'String',
                  'validators': [[null, 'Path `{PATH}` is required.', 'required']],
                  'options': {'required': true},
                  'isRequired': true
                },
                'examDate': {
                  'path': 'examDate',
                  'instance': 'Date',
                  'validators': [[null, 'Path `{PATH}` is required.', 'required']],
                  'options': {'required': true},
                  '_index': null,
                  'isRequired': true
                },
                'score': {
                  'path': 'score',
                  'instance': 'Number'
                },
                'result': {
                  'enumValues': ['distinction', 'merit', 'pass', 'fail'],
                  'regExp': null,
                  'path': 'result',
                  'instance': 'String',
                  'validators': [[null, '`{VALUE}` is not a valid enum value for path `{PATH}`.', 'enum']],
                  'setters': [],
                  'getters': [],
                  'options': {'enum': ['distinction', 'merit', 'pass', 'fail']},
                  '_index': null,
                  '$conditionalHandlers': {}
                },
                'retakeDate': {
                  'path': 'retakeDate',
                  'instance': 'Date',
                  'validators': [],
                  'setters': [],
                  'getters': [],
                  'options': {'form': {'showWhen': {'lhs': '$exams.result', 'comp': 'eq', 'rhs': 'fail'}}},
                  '_index': null,
                  '$conditionalHandlers': {}
                }
              }
            },
            '_id': {
              'path': '_id',
              'instance': 'ObjectID',
              'validators': [],
              'setters': [null],
              'getters': [],
              'options': {'auto': true},
              '_index': null,
              '$conditionalHandlers': {}
            }
          });
        $httpBackend.whenGET('/api/collection/123').respond({surname: 'Smith', exams: [{result: 'Pass'}]});
        elm = angular.element('<div><form-input formStyle="horizontalCompact" schema="formSchema"></form-input></div>');
        scope = $rootScope.$new();
        $location.$$path = '/collection/123/edit';
        ctrl = $controller('BaseCtrl', {$scope: scope});
        $httpBackend.flush();
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('has class has-error in subschema', function () {
        var examsSection = angular.element(elm.find('form').children())[2];
        var body = angular.element(angular.element(examsSection).children())[1];
        var exam = angular.element(angular.element(body).children())[0];
        var date = angular.element(angular.element(angular.element(exam).children())[2]);
        expect(date).toHaveClass('has-error');
        expect(date).toHaveClass('form-group');
      });

    });

    describe('nested subkey required input', function () {

      beforeEach(inject(function (_$httpBackend_, $rootScope, $compile, $location, $controller, cssFrameworkService) {
        cssFrameworkService.setFrameworkForDemoWebsite('bs3');
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/schema/collection').respond({
          'surname': {
            'path': 'surname',
            'instance': 'String',
            'validators': [[null, 'Path `{PATH}` is required.', 'required']],
            'options': {'index': true, 'required': true, 'list': {}},
            '_index': true,
            'isRequired': true
          },
          'forename': {
            'path': 'forename',
            'instance': 'String',
            'options': {'index': true, 'list': true},
            '_index': true
          },
          'exams': {
            'schema': {
              'subject': {
                'path': 'subject',
                'instance': 'String',
                'validators': [[null, 'Path `{PATH}` is required.', 'required']],
                'options': {'required': true},
                'isRequired': true
              },
              'examDate': {
                'path': 'examDate',
                'instance': 'Date',
                'validators': [[null, 'Path `{PATH}` is required.', 'required']],
                'options': {'required': true},
                'isRequired': true
              },
              'score': {
                'path': 'score',
                'instance': 'Number'
              },
              'result': {
                'enumValues': ['distinction', 'merit', 'pass', 'fail'],
                'path': 'result',
                'instance': 'String',
                'validators': [[null, '`{VALUE}` is not a valid enum value for path `{PATH}`.', 'enum']],
                'options': {'enum': ['distinction', 'merit', 'pass', 'fail']}
              },
              'retakeDate': {
                'path': 'retakeDate',
                'instance': 'Date',
                'options': {'form': {'showWhen': {'lhs': '$exams.result', 'comp': 'eq', 'rhs': 'fail'}}}
              }
            },
            'options': {
              'form': {
                'subkey': {
                  'keyList': {'subject': 'English'},
                  'containerType': 'well',
                  'title': 'English Exam'
                }
              }
            }
          }
        });
        $httpBackend.whenGET('/api/collection/123').respond({surname: 'Smith', exams: [{result: 'Pass'}]});
        elm = angular.element('<div><form-input formStyle="horizontalCompact" schema="formSchema"></form-input></div>');
        scope = $rootScope.$new();
        $location.$$path = '/collection/123/edit';
        ctrl = $controller('BaseCtrl', {$scope: scope});
        $httpBackend.flush();
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('has class has-error in subschema', function () {
        var examsSection = angular.element(elm.find('form').children())[2];
        var body = angular.element(angular.element(examsSection).children())[0];
        var date = angular.element(angular.element(angular.element(body).children())[1]);
        expect(date).toHaveClass('has-error');
        expect(date).toHaveClass('form-group');
      });

    });


  });


});

