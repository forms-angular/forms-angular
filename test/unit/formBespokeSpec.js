describe('formBespokeInput', function () {
    var elm, scope;

    // load the form code
    beforeEach(function(){
        angular.mock.module('formsAngular');
        angular.mock.module('myDemoApp');
    });

    describe('supports override directives for fields', function () {

        beforeEach(
            inject(function ($rootScope, $controller, $compile) {
                elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input schema="schema"></form-input>' +
                '</form>');
            scope = $rootScope;
            scope.schema = [
                {name: "email", id: "1", label: "Email", type: "text", directive: "email-field"},
                {name: "name", id: "2", label: "Name", type: "text"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('field should have prefix', function () {
            var input = elm.find('input');
            expect(input.length).toBe(2);
            input = elm.find('input:first');
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('1');
            expect(input.attr('type')).toBe('email');
            var prepend = elm.find('div.input-prepend');
            expect(prepend.length).toBe(1);
            expect(prepend.text()).toBe('@');
        });

    });

});

