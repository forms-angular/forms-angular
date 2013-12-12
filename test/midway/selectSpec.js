describe('Select.', function () {
    var elm, scope;

    // load the form code
    beforeEach(angular.mock.module('formsAngular'));

    describe('handles selects for reference lookups', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('api/schema/collection').respond(
                {"textField": {"path": "textField", "instance": "String", "options": {"form": {"label": "Organisation Name"}, "list": true}, "_index": null},
                    "lookupField": {"path": "lookupField", "instance": "ObjectID", "options": {"ref": "person", "_index": null}},
                    "arrayOfString": {"caster": {"instance": "String"}, "path": "arrayOfString", "options": {"type": [null]}, "_index": null},
                    "arrayOfLookup": {"caster": {"path": null, "instance": "ObjectID", "options": {}, "_index": null}, "path": "arrayOfLookup", "options": {"type": [null], "ref": "referral_format", "form": {"label": "Referral Format"}}, "_index": null}}
            );
            $httpBackend.whenGET('api/schema/referral_format').respond(
                {"description": {"enumValues": [], "regExp": null, "path": "description", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"list": true}, "_index": null},
                    "module": {"enumValues": [], "regExp": null, "path": "module", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"hidden": true}}, "_index": null},
                    "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}}
            );
            $httpBackend.whenGET('api/referral_format').respond(
                [
                    {"description": "Social services", "module": "anything", "_id": "1"},
                    {"description": "Continuing Health Care", "module": "anything", "_id": "2"},
                    {"description": "GP", "module": "anything", "_id": "3"},
                    {"description": "Website", "module": "anything", "_id": "4"}
                ]
            );
            $httpBackend.whenGET('api/collection/3').respond({
                "textField": "This is some text", "lookupField": "3", "arrayOfString": ["string", "rope", "cord"], "arrayOfLookup": ["1", "2", "4"]
            });
            $httpBackend.whenGET('api/schema/person').respond({
                "_id":{"path":"_id","instance":"ObjectID","validators":[],"setters":[null],"getters":[],"options":{"auto":true},"_index":null,"$conditionalHandlers":{}},
                "givenName":{"enumValues":[],"regExp":null,"path":"givenName","instance":"String","validators":[],"setters":[],"getters":[],"options":{"list":true,"index":true,"form":{"label":"Forename","pane":"Personal"}},"_index":true,"$conditionalHandlers":{}},
                "familyName":{"enumValues":[],"regExp":null,"path":"familyName","instance":"String","validators":[[null,"Path `{PATH}` is required.","required"]],"setters":[],"getters":[],"options":{"required":true,"index":true,"list":true,"form":{"label":"Surname","pane":"Personal"}},"_index":true,"isRequired":true,"$conditionalHandlers":{}},
                "title":{"enumValues":[],"regExp":null,"path":"title","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"pane":"Personal"}},"_index":null,"$conditionalHandlers":{}},
                "sex":{"enumValues":["F","M"],"regExp":null,"path":"sex","instance":"String","validators":[[null,"`{VALUE}` is not a valid enum value for path `{PATH}`.","enum"]],"setters":[],"getters":[],"options":{"enum":["F","M"],"form":{"pane":"Personal"}},"_index":null,"$conditionalHandlers":{}}});
            $httpBackend.whenGET('api/person').respond([
                {"_id":"1", "givenName":"John", "familyName":"Smith", "title":"Mr" },
                {"_id":"2", "givenName":"Anne", "familyName":"Brown", "title":"Mrs" },
                {"_id":"3", "givenName":"Jenny", "familyName":"Rogers", "title":"Ms" },
            ]);

            $location.$$path = '/collection/3/edit';
            scope = $rootScope.$new();
            ctrl = $controller("BaseCtrl", {$scope: scope});

//            elm = angular.element('<form name="myForm" class="form-horizontal compact"> ' +
//                    '<form-input schema="schema"></form-input>' +
//                    '</form>');
//
//            scope.f_eyeColourOptions = ["Blue", "Brown", "Green", "Hazel"];
//            scope.f_eyeColour_ids = ["1234", "5678", "90ab", "cdef"];
//            scope.schema = [
//                {name: "name", id: "1", label: "Name", type: "text"},
//                {"name": "eyeColour", "id": "f_eyeColour", "label": "Eye Colour", "type": "select", "options": "f_eyeColourOptions", "ids": "f_eyeColour_ids"}
//            ];
//            $compile(elm)(scope);
            scope.$digest();


            $httpBackend.flush();
        }));

        it('should convert to forms-angular format', function() {
            expect(scope.record.lookupField.id).toBe('3');
            expect(scope.record.lookupField.text).toBe("Jenny Rogers");
        });

//        it('should have combobox', function () {
//            var input = elm.find('select');
//            expect(input.length).toBe(1);
//            expect(input).toHaveClass('ng-pristine');
//            expect(input).toHaveClass('ng-valid');
//            expect(input.attr('id')).toBe('f_eyeColour');
//            input = elm.find('option');
//            expect(input.length).toBe(5);
//            input = elm.find('option:first');
//            expect(input.attr('value')).toBe("");
//            expect(input.text()).toBe("");
//            input = elm.find('option:last');
//            expect(input.text()).toBe("Hazel");
//        });

    });

});

