describe('formInput', function() {
    var elm, scope;

    // load the form code
    beforeEach(module('formsAngular.form'));

    describe('simple text input', function() {

        beforeEach(inject(function($rootScope, $compile) {
            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact">' +
                    '<form-input info="{{schema}}"></form-input>' +
                '</form>');

            scope = $rootScope;
            scope.schema = {name: "desc",  id:"desc_id", label: "Description", type:"text"};
            $compile(elm)(scope);
            scope.$digest();
            console.log(elm);
        }));

        it('should have a label', function() {
            var label = elm.find('label');
            expect(label.text()).toBe('Description');
            expect(label.attr('for')).toBe('desc_id');
            expect(label).toHaveClass('control-label');
        });

        it('should have input', function() {
            var input = elm.find('input');
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('desc_id');
            expect(input.attr('type')).toBe('text');
        });

    });

    describe('generate inputs from schema', function() {

        beforeEach(inject(function($rootScope, $controller, $compile) {

            elm = angular.element(
                        '<form name="myForm" class="form-horizontal compact"> ' +
                            '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                        '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name",  id:"1", label: "Name", type:"text"},
                {name: "eyecolour",  id:"2", label: "Colour of Eyes", type:"text"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have 2 inputs', function() {
            var input = elm.find('input');
            expect(input.length).toBe(2);
            input = elm.find('input:first');
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('1');
            expect(input.attr('type')).toBe('text');
            input = elm.find('input:last');
            expect(input.attr('id')).toBe('2');
            expect(input.attr('type')).toBe('text');
        });

        it('should have 2 labels', function() {
            var label = elm.find('label');
            expect(label.length).toBe(2);
            label = elm.find('label:first');
            expect((label).text()).toBe('Name');
            expect(label.attr('for')).toBe('1');
            label = elm.find('label:last');
            expect(label.text()).toBe('Colour of Eyes');
            expect(label.attr('for')).toBe('2');
        });

    });

});

