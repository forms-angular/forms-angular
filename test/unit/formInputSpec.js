describe('formInput', function () {
    var elm, scope;

    // load the form code
    beforeEach(angular.mock.module('formsAngular'));

    describe('simple text input', function () {

        beforeEach(inject(function ($rootScope, $compile) {
            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact">' +
                    '<form-input info="{{formSchema}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.formSchema = {name: "desc", id: "desc_id", label: "Description", type: "text"};
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have a label', function () {
            var label = elm.find('label');
            expect(label.text()).toBe('Description');
            expect(label.attr('for')).toBe('desc_id');
            expect(label).toHaveClass('control-label');
        });

        it('should have input', function () {
            var input = elm.find('input');
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('desc_id');
            expect(input.attr('type')).toBe('text');
        });

    });

    describe('generate inputs from schema', function () {

        beforeEach(inject(function ($rootScope, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in formSchema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.formSchema = [
                {name: "name", id: "1", label: "Name", type: "text"},
                {name: "eyecolour", id: "2", label: "Colour of Eyes", type: "text"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have 2 inputs', function () {
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

        it('should have 2 labels', function () {
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

    describe('handles sub schemas', function() {

        describe('default behaviour', function() {
            beforeEach(inject(function ($rootScope, $compile) {
                elm = angular.element(
                    '<form name="myForm" class="form-horizontal compact"> ' +
                        '<form-input ng-repeat="field in formSchema" info="{{field}}"></form-input>' +
                        '</form>');

                scope = $rootScope;
                scope.formSchema = [
                    {"name":"surname","id":"f_surname","label":"Surname","type":"text"},
                    {"name":"forename","id":"f_forename","label":"Forename","type":"text"},
                    {"name":"exams","id":"f_exams","label":"Exams","schema":[
                        {"name":"exams.subject","id":"f_exams.subject","label":"Subject","type":"text"},
                        {"name":"exams.score","id":"f_exams.score","label":"Score","type":"number"}
                        ]}
                ];

                scope.record = {"surname":"Smith","forename":"Anne","exams":[{"subject":"English","score":83},{"subject":"Maths","score":97}]};
                $compile(elm)(scope);
                scope.$digest();
            }));

            it('has Exams section', function() {
                var thisElm = elm.find('.schema-head');
                expect(thisElm.length).toBe(1);
                expect((thisElm).text()).toBe('Exams');

                thisElm = elm.find('.schema-foot');
                expect(thisElm.length).toBe(1);

                thisElm = elm.find('.schema-foot button');
                expect(thisElm.length).toBe(1);
                expect((thisElm).text()).toBe(' Add');

                thisElm = elm.find('.sub-doc')
                expect(thisElm.length).toBe(2);

                thisElm = elm.find('.sub-doc button:first');
                expect(thisElm.text()).toBe(' Remove');
            });
        });

        describe('Inhibit add and remove', function() {
            beforeEach(inject(function ($rootScope, $compile) {
                elm = angular.element(
                    '<form name="myForm" class="form-horizontal compact"> ' +
                        '<form-input ng-repeat="field in formSchema" info="{{field}}"></form-input>' +
                        '</form>');

                scope = $rootScope;
                scope.formSchema = [
                    {"name":"surname","id":"f_surname","label":"Surname","type":"text"},
                    {"name":"forename","id":"f_forename","label":"Forename","type":"text"},
                    {"name":"exams","id":"f_exams","label":"Exams", "noAdd":true, "noRemove":true, "schema":[
                        {"name":"exams.subject","id":"f_exams.subject","label":"Subject","type":"text"},
                        {"name":"exams.score","id":"f_exams.score","label":"Score","type":"number"}
                    ]}
                ];

                scope.record = {"surname":"Smith","forename":"Anne","exams":[{"subject":"English","score":83},{"subject":"Maths","score":97}]};
                $compile(elm)(scope);
                scope.$digest();
            }));

            it('has amended Exams section', function() {
                var thisElm = elm.find('.schema-head');
                expect(thisElm.length).toBe(1);
                expect((thisElm).text()).toBe('Exams');

                thisElm = elm.find('.schema-foot');
                expect(thisElm.length).toBe(1);

                thisElm = elm.find('.schema-foot button');
                expect(thisElm.length).toBe(0);

                thisElm = elm.find('.sub-doc')
                expect(thisElm.length).toBe(2);

                thisElm = elm.find('.sub-doc button:first');
                expect(thisElm.length).toBe(0);
            });
        });

    })

    describe('does not generate label element when label is blank', function () {

        beforeEach(inject(function ($rootScope, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name", id: "1", label: "Name", type: "text"},
                {name: "eyecolour", id: "2", label: "", type: "text"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have 2 inputs', function () {
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

        it('should have 1 label', function () {
            var label = elm.find('label');
            expect(label.length).toBe(1);
            expect((label).text()).toBe('Name');
            expect(label.attr('for')).toBe('1');
        });

    });

    describe('generates "required" attribute when appropriate', function () {

        beforeEach(inject(function ($rootScope, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name", id: "1", label: "Name", type: "text", required: true},
                {name: "eyecolour", id: "2", label: "", type: "text"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have correct inputs', function () {
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

    describe('generates help elements', function () {

        beforeEach(inject(function ($rootScope, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name", id: "1", label: "Name", type: "text", help: "This is some help"},
                {name: "eyecolour", id: "2", label: "", type: "text", helpInline: "This is some inline help"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have correct help blocks', function () {
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

    describe('generates textarea inputs', function () {

        beforeEach(inject(function ($rootScope, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name", id: "1", label: "Name", type: "text"},
                {name: "description", id: "2", label: "Desc", type: "textarea", rows: 10}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have correct textarea', function () {
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

    describe('generates readonly inputs', function () {

        beforeEach(inject(function ($rootScope, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.schema = [
                {name: "name", id: "1", label: "Name", type: "text", readonly: true},
                {name: "description", id: "2", label: "Desc", type: "textarea", rows: 10, readonly: true}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('text and textarea', function () {
            var input = elm.find('input:first');
            expect(input.attr('readonly')).toBe('readonly');
            input = elm.find('textarea');
            expect(input.attr('readonly')).toBe('readonly');
        });

    });

    describe('generates selects for enumerated lists', function () {

        beforeEach(inject(function ($rootScope, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.f_eyeColourOptions = ["Blue", "Brown", "Green", "Hazel"];
            scope.schema = [
                {name: "name", id: "1", label: "Name", type: "text"},
                {"name": "eyeColour", "id": "f_eyeColour", "label": "Eye Colour", "type": "select", "options": "f_eyeColourOptions"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have combobox', function () {
            var input = elm.find('select');
            expect(input.length).toBe(1);
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('f_eyeColour');
            input = elm.find('option');
            expect(input.length).toBe(5);
            input = elm.find('option:first');
            expect(input.attr('value')).toBe("");
            expect(input.text()).toBe("");
            input = elm.find('option:last');
            expect(input.attr('value')).toBe("Hazel");
            expect(input.text()).toBe("Hazel");
        });

    });

    describe('generates selects for reference lookups', function () {

        beforeEach(inject(function ($rootScope, $compile) {

            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input ng-repeat="field in schema" info="{{field}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.f_eyeColourOptions = ["Blue", "Brown", "Green", "Hazel"];
            scope.f_eyeColour_ids = ["1234", "5678", "90ab", "cdef"];
            scope.schema = [
                {name: "name", id: "1", label: "Name", type: "text"},
                {"name": "eyeColour", "id": "f_eyeColour", "label": "Eye Colour", "type": "select", "options": "f_eyeColourOptions", "ids": "f_eyeColour_ids"}
            ];
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have combobox', function () {
            var input = elm.find('select');
            expect(input.length).toBe(1);
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('f_eyeColour');
            input = elm.find('option');
            expect(input.length).toBe(5);
            input = elm.find('option:first');
            expect(input.attr('value')).toBe("");
            expect(input.text()).toBe("");
            input = elm.find('option:last');
            expect(input.text()).toBe("Hazel");
        });

    });

    describe('displays error messages', function () {

        beforeEach(
            inject(function ($rootScope, $compile) {
                elm = angular.element(
                    '<div ng-show="errorMessage" class="row-fluid">'+
                        '<div class="span6 offset3 alert alert-error">'+
                            '<button type="button" class="close" ng-click="dismissError()">&times;</button>'+
                            '<h4>{{alertTitle}}</h4>'+
                            '<span class="errMsg">{{errorMessage}}</span>'+
                        '</div>'+
                    '</div>'+
                        '<div class="row-fluid">'+
                           '<form-input ng-repeat="field in formSchema" info="{{field}}"></form-input>'+
                        '</div>'+
                    '</div>');
                scope = $rootScope;
                scope.schema = [
                    {name: "email", id: "1", label: "Email", type: "text", directive: "email-field"}
                ];
                scope.errorMessage = 'Test error';
                scope.alertTitle = 'Error!';
                $compile(elm)(scope);
                scope.$digest();
            }));

        it('displays appropriately', function () {
            var h4 = elm.find('h4');
            expect(h4.text()).toBe('Error!');
            var alert = elm.find('span.errMsg');
            expect(alert.text()).toBe('Test error');
        });
    });

    describe('supports bootstrap control sizing', function () {

        beforeEach(inject(function ($rootScope, $compile) {
            elm = angular.element(
                '<form name="myForm" class="form-horizontal compact">' +
                    '<form-input info="{{formSchema}}"></form-input>' +
                    '</form>');

            scope = $rootScope;
            scope.formSchema = {name: "desc", id: "desc_id", label: "Description", size: "small", type: "text"};
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should have input', function () {
            var input = elm.find('input');
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input).toHaveClass('input-small');
            expect(input.attr('id')).toBe('desc_id');
            expect(input.attr('type')).toBe('text');
        });

    });

});

