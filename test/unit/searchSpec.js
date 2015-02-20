'use strict';

describe('search', function () {

  var scope, $httpBackend, $location, elm;

  beforeEach(function () {
      angular.mock.module('formsAngular');
      angular.mock.module('template/search-bs2.html');
    }
  );

  beforeEach(inject(function (_$httpBackend_, $rootScope, $compile, _$location_) {
    $httpBackend = _$httpBackend_;
    $location = _$location_;
    elm = angular.element('<div><global-search class="global-search"></global-search></div>');
    scope = $rootScope;
    $compile(elm)(scope);
    scope.$digest();
  }));

  describe('form generation', function () {

    it('should have a search form', function () {
      var form = elm.find('form');
      expect(form).toHaveClass('navbar-search');
    });

    it('should not have an error class in the search box when the form is created', function () {
      var div = angular.element(elm.find('div')[0]);
      expect(div.attr('id')).toBe('search-cg');
      expect(div.attr('class')).toBe('control-group');
    });

  });

  describe('results list', function () {

    it('displays one result when there is one', function () {
      $httpBackend.whenGET('/api/search?q=hello').respond({results: [
        {id: '1', resource: 'resource', resourceText: 'Resource', text: 'Hello 1'}
      ]});
      scope.searchTarget = 'hello';
      scope.$digest();
      $httpBackend.flush();
      var results = elm.find('span');
      expect(results.length).toBe(1);
    });

    it('displays two results when there are two', function () {
      $httpBackend.whenGET('/api/search?q=hello').respond({results: [
        {id: '1', resource: 'resource', resourceText: 'Resource', text: 'Hello 1'},
        {id: '2', resource: 'resource', resourceText: 'Resource', text: 'Hello 2'}
      ]});
      scope.searchTarget = 'hello';
      scope.$digest();
      $httpBackend.flush();
      var results = elm.find('span');
      expect(results.length).toBe(2);
      var div = angular.element(elm.find('div')[0]);
      expect(div.attr('class')).toBe('control-group');
    });

    it('should have an error class in the search box when the string is not found', function () {
      $httpBackend.whenGET('/api/search?q=hello').respond({results: []});
      scope.searchTarget = 'hello';
      scope.$digest();
      $httpBackend.flush();
      var results = elm.find('span');
      expect(results.length).toBe(0);
      var div = angular.element(elm.find('div')[0]);
      expect(div.attr('class')).toBe('control-group error has-error');
      scope.searchTarget = '';
      scope.$digest();
      expect(div.attr('class')).toBe('control-group');
    });

    it('formats results', function () {
      $httpBackend.whenGET('/api/search?q=hello').respond({'results': [
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f15', 'text': 'Brown, John', 'searchImportance': 99},
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f17', 'text': 'Brown, Jenny', 'searchImportance': 99}
      ], 'moreCount': 0});
      scope.searchTarget = 'hello';
      scope.$digest();
      $httpBackend.flush();
      var results = elm.find('span');
      expect(results.length).toBe(2);
      results = angular.element(elm.find('span')[0]);
      expect(results.text()).toMatch('Exams');
      expect(results.text()).toMatch('Brown, ');
      expect(results.text()).toMatch('John');
    });

    it('should focus on the first result returned', function () {
      $httpBackend.whenGET('/api/search?q=hello').respond({'results': [
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f15', 'text': 'Brown, John', 'searchImportance': 99},
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f17', 'text': 'Brown, Jenny', 'searchImportance': 99}
      ], 'moreCount': 0});
      scope.searchTarget = 'hello';
      scope.$digest();
      $httpBackend.flush();
      expect(scope.results.length).toBe(2);
      expect(scope.results[0].focussed).toBe(true);
      expect(scope.results[1].focussed).toBe(undefined);
      expect(scope.focus).toBe(0);
    });

    it('should focus on the next result when down arrow is pressed', function () {
      scope.results = [
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f15', 'text': 'Brown, John', 'searchImportance': 99, focussed: true},
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f17', 'text': 'Brown, Jenny', 'searchImportance': 99}
      ];
      scope.focus = 0;
      scope.handleKey({keyCode: 40});
      expect(scope.results[0].focussed).toBe(undefined);
      expect(scope.results[1].focussed).toBe(true);
      expect(scope.focus).toBe(1);
    });

    it('should not move focus when down arrow is pressed on last result', function () {
      scope.results = [
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f15', 'text': 'Brown, John', 'searchImportance': 99},
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f17', 'text': 'Brown, Jenny', 'searchImportance': 99, focussed: true}
      ];
      scope.focus = 1;
      scope.handleKey({keyCode: 40});
      expect(scope.results[0].focussed).toBe(undefined);
      expect(scope.results[1].focussed).toBe(true);
      expect(scope.focus).toBe(1);
    });

    it('should focus on the previous result when up arrow is pressed', function () {
      scope.results = [
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f15', 'text': 'Brown, John', 'searchImportance': 99},
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f17', 'text': 'Brown, Jenny', 'searchImportance': 99, focussed: true}
      ];
      scope.focus = 1;
      scope.handleKey({keyCode: 38});
      expect(scope.results[0].focussed).toBe(true);
      expect(scope.results[1].focussed).toBe(undefined);
      expect(scope.focus).toBe(0);
    });

    it('should not move focus when up arrow is pressed on top row', function () {
      scope.results = [
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f15', 'text': 'Brown, John', 'searchImportance': 99, focussed: true},
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f17', 'text': 'Brown, Jenny', 'searchImportance': 99}
      ];
      scope.focus = 0;
      scope.handleKey({keyCode: 38});
      expect(scope.results[0].focussed).toBe(true);
      expect(scope.results[1].focussed).toBe(undefined);
      expect(scope.focus).toBe(0);
    });

    it('should link to the selected result', function () {
      scope.results = [
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f15', 'text': 'Brown, John', 'searchImportance': 99, focussed: true},
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f17', 'text': 'Brown, Jenny', 'searchImportance': 99}
      ];
      scope.focus = 0;
      scope.handleKey({keyCode: 13});
      expect($location.path()).toBe('/f_nested_schema/51c583d5b5c51226db418f15/edit');
    });

    it('should clear the target and the reults when Esc is pressed', function () {
      $httpBackend.whenGET('/api/search?q=hello').respond({'results': [
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f15', 'text': 'Brown, John', 'searchImportance': 99},
        {'resource': 'f_nested_schema', 'resourceText': 'Exams', 'id': '51c583d5b5c51226db418f17', 'text': 'Brown, Jenny', 'searchImportance': 99}
      ], 'moreCount': 0});
      scope.searchTarget = 'hello';
      scope.$digest();
      scope.handleKey({keyCode: 27});
      expect(scope.focus).toBe(null);
      expect(scope.results).toEqual([]);
      expect(scope.searchTarget).toBe('');
    });

  });


});
