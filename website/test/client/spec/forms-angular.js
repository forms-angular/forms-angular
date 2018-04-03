'use strict';

describe('Controller: BaseCtrl', function () {

  // load the controller's module
  beforeEach(function() {
    angular.mock.module('websiteApp');
  });

  var scope;
  var $httpBackend;
  var routingService = {
    parsePathFunc: function () {
      return function  () {
        return {modelName: 'collection', newRecord: true};
      };
    }
  };

  describe('forms-angular', function() {

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should request a schema', function () {
      inject(function (_$httpBackend_, $rootScope, $controller) {
        $httpBackend = _$httpBackend_;
        // TODO Figure out why the next line is suddenly required
        //$httpBackend.whenGET('partials/landing-page.html').respond('No idea why it suddenly needs this');
        $httpBackend.whenGET('/api/schema/collection').respond({
          'name': {'path': 'name', 'instance': 'String', 'options': {'form': {'label': 'Organisation Name'}, 'list': true}}
        });
        scope = $rootScope.$new();
        $controller('BaseCtrl', {$scope: scope, routingService: routingService});
        $httpBackend.flush();
      });
      expect(scope.formSchema.length).toBe(1);
    });

  });

});
