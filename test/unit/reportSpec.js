'use strict';

describe('Reports', function () {

  var $httpBackend;

  beforeEach(function () {
    angular.mock.module('formsAngular');
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('url handling', function () {

    it('should support report schemas which are fetched from server', function () {
      inject(function (_$httpBackend_, $rootScope, $controller) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('/api/report/collection/myReport').respond({success: true, schema: {}, report: [
          {'_id': 'F', 'count': 11},
          {'_id': 'M', 'count': 6}
        ]});
        var routeParams = {model: 'collection', reportSchemaName: 'myReport'};
        var scope = $rootScope.$new();
        $controller('AnalysisCtrl', {$scope: scope, $routeParams: routeParams});
        $httpBackend.flush();
        expect(scope.report.length).toBe(2);
      });
    });

  });
});
