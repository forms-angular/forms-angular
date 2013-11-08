ddescribe('Condition display', function() {

    var $httpBackend;

    beforeEach(function () {
        angular.mock.module('formsAngular');
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('fixed value', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('api/schema/collection').respond({
                    "name": {"instance": "String"},
                    "hide_me": {"instance": "String", "options": {"form": {"showIf": {"lhs": 0, "comp": "eq", "rhs": 1}}}},
                    "show_me": {"instance": "String", "options": {"form": {"showIf": {"lhs": 1, "comp": "eq", "rhs": 1}}}}
                });
            scope = $rootScope.$new();
            $location.$$path = '/collection/new';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('can hide fields', function () {
            expect(scope.formSchema.length).toBe(2);
            expect(scope.formSchema[0].label).toBe('Name');
            expect(scope.formSchema[1].label).toBe('Show Me');
        });
    });

    describe('shows simple variable value field', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location, $compile) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('api/schema/collection').respond({
                    "name": {"instance": "String"},
                    "change_me": {"instance": "String", "options": {"form": {"showIf": {"lhs": "$name", "comp": "ne", "rhs": "hide"}}}}
                });
            scope = $rootScope.$new();
            $location.$$path = '/collection/new';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact">' +
                    '<form-input schema="formSchema"></form-input>' +
                    '</form>');
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('can hide fields', function () {
            scope.record.name = 'hide';
            scope.$digest();
            dump(elm.find('#cg_f_change_me').length);
            dump(elm.find('#cg_f_change_me'));
            expect(elm.find('#cg_f_change_me')).toHaveClass('cond-hide');
        });

    });

});



//PhantomJS 1.6 (Linux) LOG: 'show'
//PhantomJS 1.6 (Linux) LOG: '1'
//PhantomJS 1.6 (Linux) LOG: '<div class="control-group ng-scope" id="cg_f_change_me">' +
//'                             <label for="f_change_me" class="control-label">Change Me</label><div class="controls"><input ng-model="record.change_me" id="f_change_me" name="f_change_me" type="text" class="ng-pristine ng-valid"></div></div>'
//PhantomJS 1.6 (Linux) LOG: 'hide'
