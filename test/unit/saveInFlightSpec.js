'use strict';

// $scope.save() is called from code as well as the Save button (whose ng-disabled covers the button only), so
// save() must itself ignore a call made while a save is already under way.
describe('Save in-flight guard', function () {

  var $httpBackend, $timeout, scope;
  var schema = {'name': {'path': 'name', 'instance': 'String', 'options': {'form': {'label': 'Name'}, 'list': true}, '_index': null}};

  beforeEach(function () {
    angular.mock.module('formsAngular');
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  function setUp(path) {
    inject(function (_$httpBackend_, _$timeout_, $rootScope, $controller, $location) {
      $httpBackend = _$httpBackend_;
      $timeout = _$timeout_;
      $httpBackend.whenGET('/api/schema/collection').respond(schema);
      $location.$$path = path;
      scope = $rootScope.$new();
      $controller('BaseCtrl', {$scope: scope});
    });
  }

  it('sends one POST when a new record is saved twice before the reply', function () {
    setUp('/collection/new');
    $httpBackend.flush();
    expect(scope.phase).toBe('ready');
    scope.record = {name: 'John'};
    $httpBackend.expectPOST('/api/collection/new').respond(200, {_id: '1234567890abcdef12345678', name: 'John'});
    scope.save();
    expect(scope.phase).toBe('saving');
    expect(scope.isSaveDisabled()).toBe(true);
    scope.save();
    $httpBackend.flush();   // a second POST would fail verifyNoOutstandingExpectation / be unexpected
  });

  it('sends one update request when an existing record is saved twice before the reply', function () {
    setUp('/collection/1234567890abcdef12345678/edit');
    $httpBackend.whenGET('/api/collection/1234567890abcdef12345678').respond({_id: '1234567890abcdef12345678', name: 'John'});
    $httpBackend.flush();
    expect(scope.phase).toBe('ready');
    scope.record.name = 'Alan';
    $httpBackend.expectPOST('/api/collection/1234567890abcdef12345678').respond(200, {_id: '1234567890abcdef12345678', name: 'Alan'});
    scope.save();
    scope.save();
    $httpBackend.flush();
  });

  it('ignores a second save while an async onBeforeCreate is still running', function () {
    setUp('/collection/new');
    $httpBackend.flush();
    var pending = [];
    scope.dataEventFunctions.onBeforeCreate = function (data, cb) {
      pending.push(cb);
    };
    scope.record = {name: 'John'};
    scope.save();
    scope.save();
    expect(pending.length).toBe(1);
    $httpBackend.expectPOST('/api/collection/new').respond(200, {_id: '1234567890abcdef12345678', name: 'John'});
    pending[0]();
    $httpBackend.flush();
  });

  it('allows another save once onBeforeCreate has refused the first', function () {
    setUp('/collection/new');
    $httpBackend.flush();
    var refuse = true;
    scope.dataEventFunctions.onBeforeCreate = function (data, cb) {
      cb(refuse ? '_update_handled_' : undefined);
    };
    scope.record = {name: 'John'};
    scope.save();
    expect(scope.phase).toBe('ready');
    refuse = false;
    $httpBackend.expectPOST('/api/collection/new').respond(200, {_id: '1234567890abcdef12345678', name: 'John'});
    scope.save();
    $httpBackend.flush();
  });

  it('allows another save once the server has rejected the first', function () {
    setUp('/collection/new');
    $httpBackend.flush();
    scope.record = {name: 'John'};
    $httpBackend.expectPOST('/api/collection/new').respond(400, {message: 'Bad'});
    scope.save();
    $httpBackend.flush();
    $timeout.flush();
    expect(scope.phase).toBe('ready');
    $httpBackend.expectPOST('/api/collection/new').respond(200, {_id: '1234567890abcdef12345678', name: 'John'});
    scope.save();
    $httpBackend.flush();
  });

  it('still saves from code before the form reaches "ready"', function () {
    setUp('/collection/new');
    expect(scope.phase).not.toBe('ready');
    scope.record = {name: 'John'};
    $httpBackend.whenPOST('/api/collection/new').respond(200, 'SUCCESS');
    scope.save();
    $httpBackend.flush();
  });

});
