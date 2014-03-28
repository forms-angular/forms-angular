describe('Select.', function () {
    var elm, scope;

    // load the form code
    beforeEach(angular.mock.module('formsAngular'));

    describe('handles selects for reference lookups', function () {

        var scope, ctrl;

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond({
                    "textField": {"path": "textField", "instance": "String", "options": {"form": {"label": "Organisation Name"}, "list": true}, "_index": null},
                    "lookupField": {"path": "lookupField", "instance": "ObjectID", "options": {"ref": "person", "_index": null}},
                    "eyeColour":{"enumValues":["Blue","Brown","Green","Hazel"],"regExp":null,"path":"eyeColour","instance":"String","validators":[[null,"Path `{PATH}` is required.","required"],[null,"`{VALUE}` is not a valid enum value for path `{PATH}`.","enum"]],"setters":[],"getters":[],"options":{"required":true,"enum":["Blue","Brown","Green","Hazel"]},"_index":null,"isRequired":true,"$conditionalHandlers":{}}
            });
            $httpBackend.whenGET('/api/collection/3').respond({"textField": "This is some text", "lookupField": "3", "eyeColour": "Brown"});
            $httpBackend.whenGET('/api/schema/person').respond({
                "_id":{"path":"_id","instance":"ObjectID","validators":[],"setters":[null],"getters":[],"options":{"auto":true},"_index":null,"$conditionalHandlers":{}},
                "givenName":{"enumValues":[],"regExp":null,"path":"givenName","instance":"String","validators":[],"setters":[],"getters":[],"options":{"list":true,"index":true,"form":{"label":"Forename","pane":"Personal"}},"_index":true,"$conditionalHandlers":{}},
                "familyName":{"enumValues":[],"regExp":null,"path":"familyName","instance":"String","validators":[[null,"Path `{PATH}` is required.","required"]],"setters":[],"getters":[],"options":{"required":true,"index":true,"list":true,"form":{"label":"Surname","pane":"Personal"}},"_index":true,"isRequired":true,"$conditionalHandlers":{}},
                "title":{"enumValues":[],"regExp":null,"path":"title","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"pane":"Personal"}},"_index":null,"$conditionalHandlers":{}},
                "sex":{"enumValues":["F","M"],"regExp":null,"path":"sex","instance":"String","validators":[[null,"`{VALUE}` is not a valid enum value for path `{PATH}`.","enum"]],"setters":[],"getters":[],"options":{"enum":["F","M"],"form":{"pane":"Personal"}},"_index":null,"$conditionalHandlers":{}}});
            $httpBackend.whenGET('/api/person').respond([
                {"_id":"1", "givenName":"John", "familyName":"Smith", "title":"Mr" },
                {"_id":"2", "givenName":"Anne", "familyName":"Brown", "title":"Mrs" },
                {"_id":"3", "givenName":"Jenny", "familyName":"Rogers", "title":"Ms" }
            ]);

            $location.$$path = '/collection/3/edit';
            scope = $rootScope.$new();
            ctrl = $controller("BaseCtrl", {$scope: scope});

            elm = angular.element('<form name="myForm" class="form-horizontal compact"> ' +
                    '<form-input schema="formSchema"></form-input>' +
                    '</form>');

            $compile(elm)(scope);
            $httpBackend.flush();
            scope.$digest();
        }));

        it('has selects for enum and lookup', function () {
            expect(elm.find('select').length).toBe(2);
        });

        it('enum should convert to forms-angular format', function() {
            expect(scope.record.eyeColour).toBe("Brown");
        });

        it('enum field should have combobox', function () {
            var input = elm.find('select:last');
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('f_eyeColour');
            expect(input.val()).toBe("Brown");
            input = elm.find('#f_eyeColour option');
            expect(input.length).toBe(5);
            input = elm.find('#f_eyeColour option:first');
            expect(input.text()).toBe("");
            input = elm.find('#f_eyeColour option:last');
            expect(input.text()).toBe("Hazel");
        });

        it('lookup should convert to forms-angular format', function() {
            expect(scope.record.lookupField).toBe("Jenny Rogers");
        });

        it('lookup field should have combobox', function () {
            var input = elm.find('select:first');
            expect(input).toHaveClass('ng-pristine');
            expect(input).toHaveClass('ng-valid');
            expect(input.attr('id')).toBe('f_lookupField');
            expect(input.val()).toBe("Jenny Rogers");
            input = elm.find('#f_lookupField option');
            expect(input.length).toBe(4);
            input = elm.find('#f_lookupField option:first');
            expect(input.text()).toBe("");
            input = elm.find('#f_lookupField option:last');
            expect(input.text()).toBe("John Smith");
        });


    });

});

