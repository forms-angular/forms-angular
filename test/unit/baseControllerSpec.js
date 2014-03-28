describe('"BaseCtrl"', function () {

    var $httpBackend;

    beforeEach(function () {
        angular.mock.module('formsAngular');
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Schema requests', function () {

        it('should request a schema', function () {
            inject(function (_$httpBackend_, $rootScope, $controller, $location) {
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('/api/schema/collection').respond({"name": {"enumValues": [], "regExp": null, "path": "name", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Organisation Name"}, "list": true}, "_index": null}});
                $location.$$path = '/collection/new';
                scope = $rootScope.$new();
                ctrl = $controller("BaseCtrl", {$scope: scope});
                $httpBackend.flush();
            });
            expect(scope.formSchema.length).toBe(1);
        });

        it('should handle an invalid model', function () {
            inject(function (_$httpBackend_, $rootScope, $controller, $location) {
                $httpBackend = _$httpBackend_;
                $httpBackend.when('GET', '/api/schema/collection').respond(function () {
                    return [404, 'Some error', {}]
                });
                $location.$$path = '/collection/new';
                scope = $rootScope.$new();
                ctrl = $controller("BaseCtrl", {$scope: scope});
                $httpBackend.flush();
                expect($location.path()).toBe('/404');
            });
        });

        it('should allow for override screens', function () {
            inject(function (_$httpBackend_, $rootScope, $controller, _$location_) {
                $httpBackend = _$httpBackend_;
                _$location_.path('/someModel/new');
                $httpBackend.when('GET', '/api/schema/someModel').respond({"name": {"enumValues": [], "regExp": null, "path": "name", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Organisation Name"}, "list": true}, "_index": null}});
                scope = $rootScope.$new();
                ctrl = $controller("BaseCtrl", {$scope: scope, $location: _$location_});
                $httpBackend.flush();
            });
        });
    });

    describe('converts model schema to form schema', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(
                {"name": {"instance": "String"}, "hide_me": {"instance": "String", "options": {"form": {"hidden": true}}}}
            );
            $location.$$path = '/collection/new';
            scope = $rootScope.$new();
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('can hide fields', function () {
            expect(scope.formSchema.length).toBe(1);
        });

//        describe('generate defaults', function () {
        // Does this in form now, so you can have simplified formSchema
//
//            it('sets up id', function () {
//                expect(scope.formSchema[0].id).toBe('f_name');
//            });
//
//            it('generates a label', function () {
//                expect(scope.formSchema[0].label).toBe('Name');
//            });
//
//        });
    });

    describe('handles references', function () {
        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(
                {"textField": {"path": "textField", "instance": "String", "options": {"form": {"label": "Organisation Name"}, "list": true}, "_index": null},
                    "lookupField": {"path": "lookupField", "instance": "ObjectID", "options": {"ref": "Person", "form": {"hidden": true}}, "_index": null},
                    "arrayOfString": {"caster": {"instance": "String"}, "path": "arrayOfString", "options": {"type": [null]}, "_index": null},
                    "arrayOfLookup": {"caster": {"path": null, "instance": "ObjectID", "options": {}, "_index": null}, "path": "arrayOfLookup", "options": {"type": [null], "ref": "referral_format", "form": {"label": "Referral Format"}}, "_index": null}}
            );
            $httpBackend.whenGET('/api/schema/referral_format').respond(
                {"description": {"enumValues": [], "regExp": null, "path": "description", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"list": true}, "_index": null},
                    "module": {"enumValues": [], "regExp": null, "path": "module", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"hidden": true}}, "_index": null},
                    "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}}
            );
            $httpBackend.whenGET('/api/collection/3').respond({
                "textField": "This is some text", "lookupField": "123456789", "arrayOfString": ["string", "rope", "cord"], "arrayOfLookup": ["1", "2", "4"]
            });
            $httpBackend.whenGET('/api/referral_format').respond(
                [
                    {"description": "Social services", "module": "anything", "_id": "1"},
                    {"description": "Continuing Health Care", "module": "anything", "_id": "2"},
                    {"description": "GP", "module": "anything", "_id": "3"},
                    {"description": "Website", "module": "anything", "_id": "4"}
                ]
            );
            $location.$$path = '/collection/3/edit';
            scope = $rootScope.$new();
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('puts options list in schema', function () {
            expect(scope.formSchema[2].options).toBe('f_arrayOfLookupOptions');
        });

        it('populates options list', function () {
            expect(scope.f_arrayOfLookupOptions[0]).toBe('Continuing Health Care');
        });

        it('populates ids list', function () {
            expect(scope.f_arrayOfLookup_ids[0]).toBe('2');
        });

    });

// Now handled by the form
//    describe('handles null labels', function () {
//
//        var scope, ctrl;
//
//        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
//            $httpBackend = _$httpBackend_;
//            $httpBackend.whenGET('/api/schema/collection').respond(
//                {"name": {"instance": "String"}, "noLabel": {"instance": "String", "options": {"form": {"label": null}}}}
//            );
//            scope = $rootScope.$new();
//            $location.$$path = '/collection/new';
//            ctrl = $controller("BaseCtrl", {$scope: scope});
//            $httpBackend.flush();
//        }));
//
//        it('creates a schema element', function () {
//            expect(scope.formSchema.length).toBe(2);
//        });
//
//        describe('generate defaults', function () {
//
//            it('sets up id', function () {
//                expect(scope.formSchema[1].id).toBe('f_noLabel');
//            });
//
//            it('generates an empty label', function () {
//                expect(scope.formSchema[1].label).toBe('');
//            });
//
//        });
//    });

    describe('handles required fields', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(
                {"surname": {"enumValues": [], "regExp": null, "path": "surname", "instance": "String", "validators": [
                    [null, "required"]
                ], "setters": [], "getters": [], "options": {"required": true}, "_index": null, "isRequired": true},
                    "town": {"instance": "String"}}
            );
            scope = $rootScope.$new();
            $location.$$path = '/collection/new';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('creates correct elements', function () {
            expect(scope.formSchema.length).toBe(2);
            expect(scope.formSchema[0].hasOwnProperty('required')).toBe(true);
            expect(scope.formSchema[0].required).toBe(true);
            expect(scope.formSchema[1].hasOwnProperty('required')).toBe(false);
        });

    });

    describe('handles read only fields', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(
                {"surname": {"enumValues": [], "regExp": null, "path": "surname", "instance": "String", "setters": [], "getters": [], "options": {"readonly": true}, "_index": null},
                    "town": {"instance": "String"}}
            );
            scope = $rootScope.$new();
            $location.$$path = '/collection/new';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('creates correct elements', function () {
            expect(scope.formSchema.length).toBe(2);
            expect(scope.formSchema[0].hasOwnProperty('readonly')).toBe(true);
            expect(scope.formSchema[0].readonly).toBe(true);
        });

    });

    describe('handles password field when unspecified', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(


                {"password": {"enumValues": [], "regExp": null, "path": "password", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null, "$conditionalHandlers": {}}, "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null, "$conditionalHandlers": {}}}

            );
            scope = $rootScope.$new();
            $location.$$path = '/collection/new';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('creates correct elements', function () {
            expect(scope.formSchema.length).toBe(1);
            expect(scope.formSchema[0].hasOwnProperty('type')).toBe(true);
            expect(scope.formSchema[0].type).toBe('password');
        });

    });

    describe('handles password field when unspecified and unrelated form options exist', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(
                {"sysUserData.password": {"enumValues": [], "regExp": null, "path": "sysUserData.password", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "New Password", "hidden": false}, "default": ""}, "_index": null, "defaultValue": "", "$conditionalHandlers": {}}}
            );
            scope = $rootScope.$new();
            $location.$$path = '/collection/new';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('creates correct elements', function () {
            expect(scope.formSchema.length).toBe(1);
            expect(scope.formSchema[0].hasOwnProperty('type')).toBe(true);
            expect(scope.formSchema[0].type).toBe('password');
        });

    });

    describe('confirm override of password field', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(
                {"password": {"enumValues": [], "regExp": null, "path": "password", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"type": "text"}}, "_index": null, "$conditionalHandlers": {}}, "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null, "$conditionalHandlers": {}}}
            );
            scope = $rootScope.$new();
            $location.$$path = '/collection/new';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('creates correct elements', function () {
            expect(scope.formSchema.length).toBe(1);
            expect(scope.formSchema[0].hasOwnProperty('type')).toBe(true);
            expect(scope.formSchema[0].type).toBe('text');
        });

    });

    describe('confirm positive override of password field', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(
                {"forename": {"enumValues":[],"regExp":null,"path":"forename","instance":"String","validators":[],"setters":[],"getters":[],"options":{"list":true,"index":true,"form":{"type":"password"}},"_index":true,"$conditionalHandlers":{}}}
            );
            scope = $rootScope.$new();
            $location.$$path = '/collection/new';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('creates correct elements', function () {
            expect(scope.formSchema.length).toBe(1);
            expect(scope.formSchema[0].hasOwnProperty('type')).toBe(true);
            expect(scope.formSchema[0].type).toBe('password');
        });

    });

    describe('confirm positive override of password field and name', function () {

        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(


                {"secret": {"enumValues": [], "regExp": null, "path": "password", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"type": "password"}}, "_index": null, "$conditionalHandlers": {}}, "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null, "$conditionalHandlers": {}}}

            );
            scope = $rootScope.$new();
            $location.$$path = '/collection/new';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('creates correct elements', function () {
            expect(scope.formSchema.length).toBe(1);
            expect(scope.formSchema[0].hasOwnProperty('type')).toBe(true);
            expect(scope.formSchema[0].type).toBe('password');
        });

    });

    describe('converts models', function () {
        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/collection').respond(
                {
                    "textField": {"path": "textField", "instance": "String", "options": {"form": {"label": "Organisation Name"}, "list": true}, "_index": null},
                    "hiddenField": {"path": "lookupField", "instance": "ObjectID", "options": {"ref": "NotCalled", "form": {"hidden": true}}, "_index": null},
                    "lookupField": {"path": "lookupField", "instance": "ObjectID", "options": {"ref": "Person"}, "_index": null},
                    "arrayOfString": {"caster": {"instance": "String"}, "path": "arrayOfString", "options": {"type": [null]}, "_index": null},
                    "arrayOfLookup": {"caster": {"path": null, "instance": "ObjectID", "options": {}, "_index": null}, "path": "arrayOfLookup", "options": {"type": [null], "ref": "referral_format", "form": {"label": "Referral Format"}}, "_index": null},
                    "arrayOfEnum": {"caster": {"path": "arrayOfEnum", "instance": "String"}, "path": "arrayOfEnum", "options": {"type": [null], "enum": ["Football", "Hockey", "Cricket"]}, "_index": null, "$conditionalHandlers": {}},
                    "arrayOfEnumIn.SubDoc": {"caster": {"path": "arrayOfEnumIn.SubDoc", "instance": "String"}, "path": "arrayOfEnumIn.SubDoc", "options": {"type": [null], "enum": ["Ash", "Birch", "Chestnut"]}, "_index": null, "$conditionalHandlers": {}},
                    "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null, "$conditionalHandlers": {}}
                });
            $httpBackend.whenGET('/api/schema/referral_format').respond(
                {"description": {"enumValues": [], "regExp": null, "path": "description", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"list": true}, "_index": null},
                    "module": {"enumValues": [], "regExp": null, "path": "module", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"hidden": true}}, "_index": null},
                    "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}}
            );
            $httpBackend.whenGET('/api/schema/Person').respond(
                {"name": {"enumValues": [], "regExp": null, "path": "name", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"list": true}, "_index": null},
                    "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}}
            );
            $httpBackend.whenGET('/api/Person').respond([
                {"name": "John Smith", _id: 123456789},
                {"name": "Alan Jones", _id: 123389}
            ]);
            $httpBackend.whenGET('/api/collection/3').respond({
                "textField": "This is some text", "lookupField": 123456789, "hiddenField": "12312", "arrayOfString": ["string", "rope", "cord"], "arrayOfLookup": ["1", "2", "4"], "arrayOfEnum": ["Football", "Cricket"],
                "arrayOfEnumIn": {"SubDoc": ["Birch", "Chestnut"]}
            });
            $httpBackend.whenGET('/api/referral_format').respond(
                [
                    {"description": "Social services", "module": "anything", "_id": "1"},
                    {"description": "Continuing Health Care", "module": "anything", "_id": "2"},
                    {"description": "GP", "module": "anything", "_id": "3"},
                    {"description": "Website", "module": "anything", "_id": "4"}
                ]
            );
            $location.$$path = '/collection/3/edit';
            scope = $rootScope.$new();
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        describe('mongo to front end', function () {

            it('converts lookup id to lookup', function () {
                expect(scope.record.lookupField).toEqual('John Smith');
            });

            it('converts string array to object array', function () {
                expect(scope.record.arrayOfString).toEqual([
                    { x: 'string' },
                    { x: 'rope' },
                    { x: 'cord' }
                ]);
            });

            it('converts id array to list strings array', function () {
                expect(scope.record.arrayOfLookup).toEqual([
                    { x: 'Social services' },
                    { x: 'Continuing Health Care' },
                    { x: 'Website' }
                ]);
            });

            it('converts enum array to object array', function () {
                expect(scope.record.arrayOfEnum).toEqual([
                    { x: 'Football' },
                    { x: 'Cricket' }
                ]);
            });

            it('converts enum array in subdoc to object array', function () {
                expect(scope.record.arrayOfEnumIn.SubDoc).toEqual([
                    { x: 'Birch' },
                    { x: 'Chestnut' }
                ]);
            });

        });

        describe('front end to mongo', function () {

            it('converts object array to string array', function () {
                scope.record.arrayOfString[2].x = 'ribbon';
                $httpBackend.when('POST', '/api/collection/3',
                    {"textField": "This is some text", "lookupField": 123456789, "hiddenField": "12312", "arrayOfString": ["string", "rope", "ribbon"], "arrayOfLookup": ["1", "2", "4"], "arrayOfEnum": ["Football", "Cricket"],"arrayOfEnumIn": {"SubDoc": ["Birch", "Chestnut"]}}
                ).respond(200, 'SUCCESS');
                scope.save();
                $httpBackend.flush();
            });

            it('converts object array to enum array', function () {
                scope.record.arrayOfEnum[1].x = 'Hockey';
                $httpBackend.when('POST', '/api/collection/3',
                    {"textField": "This is some text", "lookupField": 123456789, "hiddenField": "12312", "arrayOfString": ["string", "rope", "cord"], "arrayOfLookup": ["1", "2", "4"], "arrayOfEnum": ["Football", "Hockey"], "arrayOfEnumIn": {"SubDoc": ["Birch", "Chestnut"]}}
                ).respond(200, 'SUCCESS');
                scope.save();
                $httpBackend.flush();
            });

            it('converts object array in subdoc to enum array', function () {
                scope.record.arrayOfEnumIn.SubDoc[1].x = 'Ash';
                $httpBackend.when('POST', '/api/collection/3',
                    {"textField": "This is some text", "lookupField": 123456789, "hiddenField": "12312", "arrayOfString": ["string", "rope", "cord"], "arrayOfLookup": ["1", "2", "4"], "arrayOfEnum": ["Football", "Cricket"], "arrayOfEnumIn": {"SubDoc": ["Birch", "Ash"]}}
                ).respond(200, 'SUCCESS');
                scope.save();
                $httpBackend.flush();
            });

        });

    });

    describe('handles complex models', function () {
        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location) {
            $httpBackend = _$httpBackend_;

            $httpBackend.whenGET('/api/schema/collection').respond({
                "surname": {"enumValues": [], "regExp": null, "path": "surname", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"list": {}}, "_index": null},
                "forename": {"enumValues": [], "regExp": null, "path": "forename", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"list": true}, "_index": null},
                "address.street": {"enumValues": [], "regExp": null, "path": "address.street", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null},
                "address.town": {"enumValues": [], "regExp": null, "path": "address.town", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null},
                "studies.courses": {"schema": {
                    "subject": {"enumValues": [], "regExp": null, "path": "subject", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null},
                    "grade": {"enumValues": [], "regExp": null, "path": "grade", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null},
                    "teachers": {"schema": {
                        "teacher": {"path": "teacher", "instance": "ObjectID", "validators": [], "setters": [], "getters": [], "options": {"ref": "teachers"}, "_index": null},
                        "room": {"path": "room", "instance": "Number", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null},
                        "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}}},
                    "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}}},
                "studies.exams": {"schema": {
                    "subject": {"enumValues": [], "regExp": null, "path": "subject", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null},
                    "examDate": {"path": "examDate", "instance": "Date", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null},
                    "score": {"path": "score", "instance": "Number", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null},
                    "result": {"enumValues": ["distinction", "merit", "pass", "fail"], "regExp": null, "path": "result", "instance": "String", "validators": [
                        [null, "enum"]
                    ], "setters": [], "getters": [], "options": {"enum": ["distinction", "merit", "pass", "fail"]}, "_index": null},
                    "grader": {"path": "grader", "instance": "ObjectID", "validators": [], "setters": [], "getters": [], "options": {"ref": "teachers"}, "_index": null},
                    "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}}},
                "assistants": {"caster": {"path": null, "instance": "ObjectID", "validators": [], "setters": [], "getters": [], "options": {"ref": "assistants"}, "_index": null}, "path": "assistants", "validators": [], "setters": [], "getters": [], "options": {"type": [
                    {"ref": "assistants"}
                ]}, "_index": null},
                "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}});
            $httpBackend.whenGET('/api/schema/teachers').respond({"surname": {"enumValues": [], "regExp": null, "path": "surname", "instance": "String", "validators": [
                [null, "required"]
            ], "setters": [], "getters": [], "options": {"required": true, "list": {}}, "_index": null, "isRequired": true}, "forename": {"enumValues": [], "regExp": null, "path": "forename", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"list": true}, "_index": null}, "address.line1": {"enumValues": [], "regExp": null, "path": "address.line1", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Address"}}, "_index": null}, "address.line2": {"enumValues": [], "regExp": null, "path": "address.line2", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": null}}, "_index": null}, "address.line3": {"enumValues": [], "regExp": null, "path": "address.line3", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": null}}, "_index": null}, "address.town": {"enumValues": [], "regExp": null, "path": "address.town", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Town"}}, "_index": null}, "address.postcode": {"enumValues": [], "regExp": null, "path": "address.postcode", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Postcode", "help": "Enter your postcode or zip code"}}, "_index": null}, "weight": {"path": "weight", "instance": "Number", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Weight (lbs)"}}, "_index": null}, "dateOfBirth": {"path": "dateOfBirth", "instance": "Date", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null}, "accepted": {"path": "accepted", "instance": "boolean", "validators": [], "setters": [], "getters": [], "options": {"form": {"helpInline": "Did we take them?"}}, "_index": null}, "interviewScore": {"path": "interviewScore", "instance": "Number", "validators": [], "setters": [], "getters": [], "options": {"form": {"hidden": true}, "list": {}}, "_index": null}, "freeText": {"enumValues": [], "regExp": null, "path": "freeText", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"type": "textarea", "rows": 5}}, "_index": null}, "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}});
            $httpBackend.whenGET('/api/schema/assistants').respond({"surname": {"enumValues": [], "regExp": null, "path": "surname", "instance": "String", "validators": [
                [null, "required"]
            ], "setters": [], "getters": [], "options": {"required": true, "list": {}}, "_index": null, "isRequired": true}, "forename": {"enumValues": [], "regExp": null, "path": "forename", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"list": true}, "_index": null}, "address.line1": {"enumValues": [], "regExp": null, "path": "address.line1", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Address"}}, "_index": null}, "address.line2": {"enumValues": [], "regExp": null, "path": "address.line2", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": null}}, "_index": null}, "address.line3": {"enumValues": [], "regExp": null, "path": "address.line3", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": null}}, "_index": null}, "address.town": {"enumValues": [], "regExp": null, "path": "address.town", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Town"}}, "_index": null}, "address.postcode": {"enumValues": [], "regExp": null, "path": "address.postcode", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Postcode", "help": "Enter your postcode or zip code"}}, "_index": null}, "weight": {"path": "weight", "instance": "Number", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Weight (lbs)"}}, "_index": null}, "dateOfBirth": {"path": "dateOfBirth", "instance": "Date", "validators": [], "setters": [], "getters": [], "options": {}, "_index": null}, "accepted": {"path": "accepted", "instance": "boolean", "validators": [], "setters": [], "getters": [], "options": {"form": {"helpInline": "Did we take them?"}}, "_index": null}, "interviewScore": {"path": "interviewScore", "instance": "Number", "validators": [], "setters": [], "getters": [], "options": {"form": {"hidden": true}, "list": {}}, "_index": null}, "freeText": {"enumValues": [], "regExp": null, "path": "freeText", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"type": "textarea", "rows": 5}}, "_index": null}, "_id": {"path": "_id", "instance": "ObjectID", "validators": [], "setters": [null], "getters": [], "options": {"auto": true}, "_index": null}});
            $httpBackend.whenGET('/api/collection/3').respond({"surname": "Thompson", "forename": "Chris", "address": {"street": "4 High Street", "town": "Bolton"},
                "studies": {
                    "courses": [
                        {"subject": "French", "grade": "A", "teachers": [
                            {"teacher": "Smithy", "room": 1},
                            {"teacher": "Jenks", "room": 3}
                        ]},
                        {"subject": "German", "grade": "B", "teachers": ["Smithy"]}
                    ],
                    "exams": [
                        {"subject": "French", "examDate": "2013-02-12T00:00:00.000Z", "score": 56, "result": "pass", "grader": "Smithy"},
                        {"subject": "English", "examDate": "2013-02-04T00:00:00.000Z", "score": 56, "result": "pass", "grader": "Smithy"}
                    ]}});
            $httpBackend.whenGET('/api/teachers').respond([
                {"_id": "Smithy", "forename": "John", "surname": "Smith" },
                { "surname": "Jenkins", "forename": "Nicky", "_id": "Jenks"}
            ]);
            $httpBackend.whenGET('/api/assistants').respond([
                {"_id": "ASmithy", "forename": "John", "surname": "AsstSmith" },
                { "surname": "AsstJenkins", "forename": "Nicky", "_id": "AJenks"}
            ]);
            scope = $rootScope.$new();
            $location.$$path = '/collection/3/edit';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        describe('reading lookups', function () {
            it('sets up options', function () {
                expect(scope.f_studies_exams_graderOptions).toEqual(['Jenkins Nicky', 'Smith John']);
                expect(scope.f_teachers_teacherOptions).toEqual(['Jenkins Nicky', 'Smith John']);
                expect(scope.f_assistantsOptions).toEqual(['AsstJenkins Nicky', 'AsstSmith John']);
            });
        });

    });

    describe('handles people in orgs with people', function () {
        var scope, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('/api/schema/person').respond({
                givenName: {
                    enumValues: [ ],
                    regExp: null,
                    path: "givenName",
                    instance: "String",
                    validators: [ ],
                    setters: [ ],
                    getters: [ ],
                    options: {
                        list: true,
                        form: {
                            label: "Forename"
                        }
                    },
                    _index: null
                },
                familyName: {
                    enumValues: [ ],
                    regExp: null,
                    path: "familyName",
                    instance: "String",
                    validators: [
                        [
                            null,
                            "required"
                        ]
                    ],
                    setters: [ ],
                    getters: [ ],
                    options: {
                        required: true,
                        list: true,
                        form: {
                            label: "Surname"
                        }
                    },
                    _index: null,
                    isRequired: true
                },
                "appData.accessToOrgs": {
                    "caster": {
                        "path": null,
                        "instance": "ObjectID",
                        "validators": [],
                        "setters": [],
                        "getters": [],
                        "options": {
                            "ref": "organisation",
                            "form": {
                                "hidden": true
                            }
                        },
                        "_index": null
                    },
                    "path": "appData.accessToOrgs",
                    "validators": [],
                    "setters": [],
                    "getters": [],
                    "options": {
                        "type": [
                            {
                                "ref": "organisation",
                                "form": {
                                    "hidden": true
                                }
                            }
                        ],
                        "form": {"label": "Organisations"}}, "_index": null},
                _id: {
                    path: "_id",
                    instance: "ObjectID",
                    validators: [ ],
                    setters: [
                        null
                    ],
                    getters: [ ],
                    options: {
                        auto: true
                    },
                    _index: null
                }
            });
            $httpBackend.whenGET('/api/schema/organisation').respond({
                name: {
                    enumValues: [ ],
                    regExp: null,
                    path: "name",
                    instance: "String",
                    validators: [ ],
                    setters: [ ],
                    getters: [ ],
                    options: {
                        form: {
                            label: "Organisation Name"
                        },
                        list: true
                    },
                    _index: null
                },
                accountContact: {
                    path: "accountContact",
                    instance: "ObjectID",
                    validators: [ ],
                    setters: [ ],
                    getters: [ ],
                    options: {
                        ref: "person",
                        form: {
                            hidden: true
                        }
                    },
                    _index: null
                }});
            $httpBackend.whenGET('/api/organisation').respond([
                {
                    _id: "5",
                    name: "Tesco"
                },
                {
                    _id: "6",
                    name: "Sainsbury"
                }

            ]);
            $location.$$path = '/person/new';
            scope = $rootScope.$new();
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
        }));

        it('handles circularity', function () {
            expect(scope.f_appData_accessToOrgsOptions).toEqual([ 'Sainsbury', 'Tesco' ]);
        });

        it('converts lookups in subDocs', function () {
            scope.record = {"familyName": "Chapman", "givenName": "Mark", "appData": {"accessToOrgs": [
                {"x": "Tesco"}
            ]}};
            $httpBackend.when('POST', '/api/person', {"familyName": "Chapman", "givenName": "Mark", "appData": {"accessToOrgs": ["5"]}}).respond(200, 'SUCCESS');
            scope.save();
            $httpBackend.flush();
        });

    });

    describe('error message handling', function () {

        it('generates an error message', function () {
            inject(function (_$httpBackend_, $rootScope, $routeParams, $controller, $location) {
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('/api/schema/collection').respond({"name": {"enumValues": [], "regExp": null, "path": "name", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Organisation Name"}, "list": true}, "_index": null}});
                $location.$$path = '/collection/new';
                scope = $rootScope.$new();
                ctrl = $controller("BaseCtrl", {$scope: scope});
                scope.record = {"familyName": "Chapman", "givenName": "Mark"};
                $httpBackend.when('POST', '/api/collection', {"familyName": "Chapman", "givenName": "Mark"}).respond(400, {message: "There is some kind of error", status: "err"});
                scope.save();
                $httpBackend.flush();
                expect(scope.alertTitle).toEqual('Error!');
                expect(scope.errorMessage).toEqual('There is some kind of error');
            });
        });

    });

    describe('extracts custom directives from schemas', function () {

        it('extracts custom directives from schemas', function () {
            inject(function (_$httpBackend_, $rootScope, $routeParams, $controller, $location) {
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('/api/schema/collection').respond({"email": {"enumValues": [], "regExp": null, "path": "email", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"directive": "email-field"}}, "_index": null, "$conditionalHandlers": {}}});
                $location.$$path = '/collection/new';
                scope = $rootScope.$new();
                ctrl = $controller("BaseCtrl", {$scope: scope});
                $httpBackend.flush();
            });

            expect(scope.formSchema[0].directive).toBe('email-field');
        });
    });

    describe('deletion confirmation modal', function () {

        var $scope, ctrl, provider, resolveCallback, deferred;

        beforeEach(function () {
            module(function ($modalProvider) {
                provider = $modalProvider;
            });
            inject(function (_$httpBackend_, $rootScope, $routeParams, $controller, $location, _$modal_, $q) {
                $modal = _$modal_;
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('/api/schema/collection').respond({"name": {"enumValues": [], "regExp": null, "path": "name", "instance": "String", "validators": [], "setters": [], "getters": [], "options": {"form": {"label": "Organisation Name"}, "list": true}, "_index": null}});
                $httpBackend.whenGET('/api/collection/125').respond({"name": "Alan"});
                $location.$$path = '/collection/125/edit';
                $scope = $rootScope.$new();
                ctrl = $controller("BaseCtrl", {
                    $scope: $scope,
                    $modal: $modal
                });

                deferred = $q.defer();
                var fakeModal = {result: deferred.promise};
                spyOn($modal, 'open').andReturn(fakeModal);

                $scope.record._id = 1;
            });
        });

        it('provider service should be injected', function () {
            $httpBackend.flush();
            expect(provider).toBeDefined();
        });

        it('modal service should be injected', function () {
            $httpBackend.flush();
            expect($modal).toBeDefined();
        });

        it('modal messageBox should be defined', function () {

            $scope.delete();
            $httpBackend.flush();
            expect($modal.open).toHaveBeenCalled();
        });

        it('should not delete when No is clicked', function () {
            $scope.delete();
            deferred.resolve(false);    // Same as clicking on Yes
            $httpBackend.flush();
        });

        it('send a delete request when yes is clicked', function () {
            $httpBackend.when('DELETE', '/api/collection/125').respond(200, 'SUCCESS');
            $httpBackend.expectDELETE('/api/collection/125');
            $scope.delete();
            deferred.resolve(true);    // Same as clicking on Yes
            $httpBackend.flush();
        });

    });

});

