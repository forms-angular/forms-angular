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
                $httpBackend.whenGET('/api/report/collection?r={"pipeline":[{"$project":{"name":1}}]}').respond({schema:{}, report:[{"_id":"F","count":11},{"_id":"M","count":6}]});

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
                $httpBackend.whenGET('/api/report/collection?r={"pipeline":[{"$project":{"name":1}}]}').respond({schema:{}, report:[{"_id":"F","count":11},{"_id":"M","count":6}]});

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
                $httpBackend.whenGET('/api/report/collection/myReport').respond({schema:{}, report:[{"_id":"F","count":11},{"_id":"M","count":6}]});
                routeParams = {model:'collection',reportSchemaName:'myReport'};
                scope = $rootScope.$new();
                ctrl = $controller("AnalysisCtrl", {$scope: scope, $routeParams: routeParams});
                $httpBackend.flush();
                expect(scope.report.length).toBe(2);
            });
        });

    });
});

//describe('Schema requests', function () {
//
//    it('should request a schema', function () {
//        inject(function (_$httpBackend_, $rootScope, $controller, $location) {
//            $httpBackend = _$httpBackend_;
//            $httpBackend.whenGET('api/schema/collection').respond({"name": {"enumValues": [], "regExp": null, "path": "name", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Organisation Name"}, "list": true}, "_index": null}});
//            $location.$$path = '/collection/new';
//            scope = $rootScope.$new();
//            ctrl = $controller("BaseCtrl", {$scope: scope});
//            $httpBackend.flush();
//        });
//        expect(scope.formSchema.length).toBe(1);
//    });
//
//    describe('formInput', function () {
//        var elm, scope;
//
//        // load the form code
//        beforeEach(angular.mock.module('formsAngular'));
//
//        describe('simple text input', function () {
//
//            beforeEach(inject(function ($rootScope, $compile) {
//                elm = angular.element(
//                    '<form name="myForm" class="form-horizontal compact">' +
//                        '<form-input schema="formSchema"></form-input>' +
//                        '</form>');
//
//                scope = $rootScope;
//                scope.formSchema = {name: "desc", id: "desc_id", label: "Description", type: "text"};
//                $compile(elm)(scope);
//                scope.$digest();
//            }));
//
//            it('should have a label', function () {
//                var label = elm.find('label');
//                expect(label.text()).toBe('Description');
//                expect(label.attr('for')).toBe('desc_id');
//                expect(label).toHaveClass('control-label');
//            });
//
//            it('should have input', function () {
//                var input = elm.find('input');
//                expect(input).toHaveClass('ng-pristine');
//                expect(input).toHaveClass('ng-valid');
//                expect(input.attr('id')).toBe('desc_id');
//                expect(input.attr('type')).toBe('text');
//            });
//
//        });
