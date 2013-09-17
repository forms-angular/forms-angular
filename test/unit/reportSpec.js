describe('Reports', function() {

    var $httpBackend;

    beforeEach(function () {
        angular.mock.module('formsAngular');
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('url handling', function() {

        it('should support pipelines in report instructions in query', function() {
            inject(function (_$httpBackend_, $rootScope, $controller, $location, $routeParams) {
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('/api/report/collection?r={"pipeline":[{"$project":{"name":1}}]}').respond({success:true, schema:{}, report:[{"_id":"F","count":11},{"_id":"M","count":6}]});

                routeParams = {model:'collection',r: '{"pipeline":[{"$project":{"name":1}}]}'};
                scope = $rootScope.$new();
                ctrl = $controller("AnalysisCtrl", {$scope: scope, $routeParams: routeParams});
                $httpBackend.flush();
                expect(scope.report.length).toBe(2);
            });
        });

        it('should support report instructions which are only a pipeline', function() {
            inject(function (_$httpBackend_, $rootScope, $controller, $location, $routeParams) {
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('/api/report/collection?r={"pipeline":[{"$project":{"name":1}}]}').respond({success:true, schema:{}, report:[{"_id":"F","count":11},{"_id":"M","count":6}]});

                routeParams = {model:'collection',r: '[{"$project":{"name":1}}]'};
                scope = $rootScope.$new();
                ctrl = $controller("AnalysisCtrl", {$scope: scope, $routeParams: routeParams});
                $httpBackend.flush();
                expect(scope.report.length).toBe(2);
            });
        });

        it('should support report schemas which are fetched from server', function() {
            inject(function (_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('/api/report/collection/myReport').respond({success:true, schema:{}, report:[{"_id":"F","count":11},{"_id":"M","count":6}]});
                routeParams = {model:'collection',reportSchemaName:'myReport'};
                scope = $rootScope.$new();
                ctrl = $controller("AnalysisCtrl", {$scope: scope, $routeParams: routeParams});
                $httpBackend.flush();
                expect(scope.report.length).toBe(2);
            });
        });

    });
});
