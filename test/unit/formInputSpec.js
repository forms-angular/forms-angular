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
            expect(input.attr('autofocus')).toBe('autofocus');
            expect(input.attr('type')).toBe('text');
            input = elm.find('input:last');
            expect(input.attr('id')).toBe('2');
            expect(input.attr('type')).toBe('text');
            expect(input.attr('autofocus')).toBe(undefined);
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

    describe('does not generate label element when label is blank', function() {

        beforeEach(inject(function($rootScope, $controller, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name",  id:"1", label: "Name", type:"text"},
                {name: "eyecolour",  id:"2", label: "", type:"text"}
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

        it('should have 1 label', function() {
            var label = elm.find('label');
            expect(label.length).toBe(1);
            expect((label).text()).toBe('Name');
            expect(label.attr('for')).toBe('1');
        });

    });

    describe('generates "required" attribute when appropriate', function() {

        beforeEach(inject(function($rootScope, $controller, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name",  id:"1", label: "Name", type:"text", required:true},
                {name: "eyecolour",  id:"2", label: "", type:"text"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have correct inputs', function() {
            var input = elm.find('input');
            expect(input.length).toBe(2);
            input = elm.find('input:first');
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-invalid');
            expect(input.attr('id')).toBe('1');
            expect(input.attr('required')).toBe("required");
            expect(input.attr('type')).toBe('text');
            input = elm.find('input:last');
            expect(input.attr('id')).toBe('2');
            expect(input.attr('required')).toBe(undefined);
            expect(input.attr('type')).toBe('text');
        });

    });

    describe('generates help elements', function() {

        beforeEach(inject(function($rootScope, $controller, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name",  id:"1", label: "Name", type:"text", help:"This is some help"},
                {name: "eyecolour",  id:"2", label: "", type:"text", helpInline:"This is some inline help"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have correct help blocks', function() {
            var help = elm.find('span');
            expect(help.length).toBe(2);
            help = elm.find('span:first');
            expect(help).toHaveClass('help-block');
            expect(help.text()).toBe('This is some help');
            help = elm.find('span:last');
            expect(help).toHaveClass('help-inline');
            expect(help.text()).toBe('This is some inline help');
        });

    });

    describe('generates textarea inputs', function() {

        beforeEach(inject(function($rootScope, $controller, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name",  id:"1", label: "Name", type:"text"},
                {name: "description",  id:"2", label: "Desc", type:"textarea", rows:10}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have correct textarea', function() {
            var input = elm.find('input');
            expect(input.length).toBe(1);
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('1');
            expect(input.attr('type')).toBe('text');
            input = elm.find('textarea');
            expect(input.length).toBe(1);
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('2');
            expect(input.attr('rows')).toBe('10');
        });

    });

    describe('generates selects for enumerated lists', function() {

        beforeEach(inject(function($rootScope, $controller, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.f_eyeColourOptions = ["Blue","Brown","Green","Hazel"];
            scope.schema = [
                {name: "name",  id:"1", label: "Name", type:"text"},
                {"name":"eyeColour","id":"f_eyeColour","label":"Eye Colour","type":"select","options":"f_eyeColourOptions"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have combobox', function() {
            var input = elm.find('select');
            expect(input.length).toBe(1);
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('f_eyeColour');
            input = elm.find('option');
            expect(input.length).toBe(5);
            input = elm.find('option:first');
            expect(input.attr('value')).toBe("? undefined:undefined ?");
            expect(input.text()).toBe("");
            input = elm.find('option:last');
            expect(input.attr('value')).toBe("Hazel");
            expect(input.text()).toBe("Hazel");
        });

    });


    describe('generates selects for reference lookups', function() {

        beforeEach(inject(function($rootScope, $controller, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.f_eyeColourOptions = ["Blue","Brown","Green","Hazel"];
            scope.f_eyeColour_ids = ["1234","5678","90ab","cdef"];
            scope.schema = [
                {name: "name",  id:"1", label: "Name", type:"text"},
                {"name":"eyeColour","id":"f_eyeColour","label":"Eye Colour","type":"select","options":"f_eyeColourOptions","ids":"f_eyeColour_ids"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have combobox', function() {
            var input = elm.find('select');
            expect(input.length).toBe(1);
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('f_eyeColour');
            input = elm.find('option');
            expect(input.length).toBe(5);
            input = elm.find('option:first');
            expect(input.attr('value')).toBe("? undefined:undefined ?");
            expect(input.text()).toBe("");
            input = elm.find('option:last');
            expect(input.text()).toBe("Hazel");
        });

    });

});

