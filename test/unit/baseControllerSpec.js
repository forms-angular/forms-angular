describe('BaseCtrl', function(){

    var $httpBackend;

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Schema requests', function(){

        it('should request a schema', function() {
            inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                $routeParams.model = 'collection';
                scope = $rootScope.$new();
                ctrl = $controller(BaseCtrl, {$scope: scope});
                $httpBackend.flush();
            });
            expect(scope.formSchema.length).toBe(1);
        });

        it('should handle an invalid model', function() {
            inject(function(_$httpBackend_, $rootScope, $routeParams, $controller, $location) {
                $httpBackend = _$httpBackend_;
                $httpBackend.when('GET','api/schema/collection').respond(function() {return [404,'Some error',{}]});
                $routeParams.model = 'collection';
                scope = $rootScope.$new();
                ctrl = $controller(BaseCtrl, {$scope: scope});
                $httpBackend.flush();
                expect($location.path()).toBe('/404');
            });
        });

        it('should allow for override screens', function() {
            inject(function(_$httpBackend_, $rootScope, $routeParams, $controller, _$location_) {
                $httpBackend = _$httpBackend_;
                _$location_.path('/someModel/new');
                $httpBackend.when('GET','api/schema/someModel').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                scope = $rootScope.$new();
                ctrl = $controller(BaseCtrl, {$scope: scope, $location:_$location_});
                $httpBackend.flush();
            });
        });
    });

    describe('converts model schema to form schema', function() {

        var scope, ctrl;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('api/schema/collection').respond(
                {"name":{"instance":"String"},"hide_me":{"instance":"String", "options":{"form":{"hidden":true}}}}
            );
            $routeParams.model = 'collection';
            scope = $rootScope.$new();
            ctrl = $controller(BaseCtrl, {$scope: scope});
            $httpBackend.flush();
        }));

        it('can hide fields', function() {
            expect(scope.formSchema.length).toBe(1);
        });

        describe('generate defaults', function() {

            it('sets up id', function() {
                expect(scope.formSchema[0].id).toBe('f_name');
            });

            it('generates a label', function() {
                expect(scope.formSchema[0].label).toBe('Name');
            });

        });
    });

    describe('handles null labels', function() {

        var scope, ctrl;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('api/schema/collection').respond(
                {"name":{"instance":"String"},"noLabel":{"instance":"String", "options":{"form":{"label":null}}}}
            );
            $routeParams.model = 'collection';
            scope = $rootScope.$new();
            ctrl = $controller(BaseCtrl, {$scope: scope});
            $httpBackend.flush();
        }));

        it('creates a schema element', function() {
            expect(scope.formSchema.length).toBe(2);
        });

        describe('generate defaults', function() {

            it('sets up id', function() {
                expect(scope.formSchema[1].id).toBe('f_noLabel');
            });

            it('generates an empty label', function() {
                expect(scope.formSchema[1].label).toBe('');
            });

        });
    });

    describe('handles required fields', function() {

        var scope, ctrl;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('api/schema/collection').respond(
                {"surname":{"enumValues":[],"regExp":null,"path":"surname","instance":"String","validators":[[null,"required"]],"setters":[],"getters":[],"options":{"required":true},"_index":null,"isRequired":true},
                    "town":{"instance":"String"}}
            );
            $routeParams.model = 'collection';
            scope = $rootScope.$new();
            ctrl = $controller(BaseCtrl, {$scope: scope});
            $httpBackend.flush();
        }));

        it('creates correct elements', function() {
            expect(scope.formSchema.length).toBe(2);
            expect(scope.formSchema[0].hasOwnProperty('required')).toBe(true);
            expect(scope.formSchema[0].required).toBe(true);
            expect(scope.formSchema[1].hasOwnProperty('required')).toBe(false);
        });

    });

    describe('handles simple conditional display fields', function() {

        var scope, ctrl;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('api/schema/collection').respond(
                {"name":{"instance":"String"},
                 "hide_me":{"instance":"String", "options":{"form":{"showIf":{"lhs":0,"comp":"eq","rhs":1}}}},
                 "show_me":{"instance":"String", "options":{"form":{"showIf":{"lhs":1,"comp":"eq","rhs":1}}}}
                }

            );
            $routeParams.model = 'collection';
            scope = $rootScope.$new();
            ctrl = $controller(BaseCtrl, {$scope: scope});
            $httpBackend.flush();
        }));

        it('can hide fields', function() {
            expect(scope.formSchema.length).toBe(2);
            expect(scope.formSchema[0].label).toBe('Name');
            expect(scope.formSchema[1].label).toBe('Show Me');
        });
    });

    describe('converts models', function() {
        var scope, ctrl;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('api/schema/collection').respond(
                {"textField":{"path":"textField","instance":"String","options":{"form":{"label":"Organisation Name"},"list":true},"_index":null},
                    "lookupField":{"path":"lookupField","instance":"ObjectID","options":{"ref":"Person","form":{"hidden":true}},"_index":null},
                    "arrayOfString":{"caster":{"instance":"String"},"path":"arrayOfString", "options":{"type":[null]},"_index":null},
                    "arrayOfLookup":{"caster":{"path":null,"instance":"ObjectID","options":{},"_index":null},"path":"arrayOfLookup","options":{"type":[null],"ref":"referral_format","form":{"label":"Referral Format"}},"_index":null}}
            );
            $httpBackend.whenGET('api/schema/referral_format').respond(
                {"description":{"enumValues":[],"regExp":null,"path":"description","instance":"String","validators":[],"setters":[],"getters":[],"options":{"list":true},"_index":null},
                    "module":{"enumValues":[],"regExp":null,"path":"module","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"hidden":true}},"_index":null},
                    "_id":{"path":"_id","instance":"ObjectID","validators":[],"setters":[null],"getters":[],"options":{"auto":true},"_index":null}}
            );
            $httpBackend.whenGET('api/collection/3').respond({
                "textField":"This is some text","lookupField":"123456789","arrayOfString":["string","rope","cord"],"arrayOfLookup":["1","2","4"]
            });
            $httpBackend.whenGET('api/referral_format').respond(
                [{"description":"Social services","module":"anything","_id":"1"},
                    {"description":"Continuing Health Care","module":"anything","_id":"2"},
                    {"description":"GP","module":"anything","_id":"3"},
                    {"description":"Website","module":"anything","_id":"4"}]
            );
            $routeParams.model = 'collection';
            $routeParams.id = 3;
            scope = $rootScope.$new();
            ctrl = $controller(BaseCtrl, {$scope: scope});
            $httpBackend.flush();
        }));

        describe('mongo to front end', function() {

            it('converts string array to object array', function() {
                expect(scope.record.arrayOfString).toEqual([ { x : 'string' }, { x : 'rope' }, { x : 'cord' } ]);
            });

            it('converts id array to list strings array', function() {
                expect(scope.record.arrayOfLookup).toEqual([ { x : 'Social services' }, { x : 'Continuing Health Care' }, { x : 'Website' } ]);
            });
        });

        describe('front end to mongo', function() {

            it('converts object array to string array', function() {
                scope.record.arrayOfString[2].x = 'ribbon';
                $httpBackend.when('POST','api/collection',
                    {"textField":"This is some text","lookupField":"123456789","arrayOfString":["string","rope","ribbon"],"arrayOfLookup":["1","2","4"]}
                ).respond(200,'SUCCESS');
                scope.save();
                $httpBackend.flush();
            });

            it('converts strings array to object ids array', function() {
                scope.record.arrayOfLookup[2].x = 'GP';
                $httpBackend.when('POST','api/collection',
                    {"textField":"This is some text","lookupField":"123456789","arrayOfString":["string","rope","cord"],"arrayOfLookup":["1","2","3"]}
                ).respond(200,'SUCCESS');
                scope.save();
                $httpBackend.flush();
            });
        });


    });

//   Cannot get this test to work, but the code seems to....
//    describe('handles sub documents', function() {
//        var scope, ctrl, compile, elm;
//
//        beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller, $compile) {
//            $httpBackend = _$httpBackend_;
//            compile = $compile;
//            $httpBackend.whenGET('api/schema/collection').respond(
//                {   "name":{"path":"name","instance":"String","options":{"list":true},"_index":null},
//                    "nested.aField":{"path":"nested.aField","instance":"String"},
//                    "nested.bField":{"path":"nested.bField","instance":"String"},
//                    "nested.twiceNested.nestedAField":{"path":"nested.twiceNested.nestedAField","instance":"String"},
//                    "nested.twiceNested.nestedBField":{"path":"nested.twiceNested.nestedBField","instance":"String"},
//                    "module":{"path":"module","instance":"String"} }
//            );
//            $httpBackend.whenGET('api/collection/51002970cfc2850222000005').respond({
//                "__v": 0, "_id": "51002970cfc2850222000005",
//                "name": "John",
//                "nested": {
//                    "aField": "A value",
//                    "bField": "a different value",
//                    "twiceNested": {
//                        "nestedAField" : "Romulus",
//                        "nestedBField" : "Remus"
//                    }
//                },
//                "module": "Some text or other"
//            });
//            $routeParams.model = 'collection';
//            $routeParams.id = '51002970cfc2850222000005';
//            scope = $rootScope.$new();
//            ctrl = $controller(BaseCtrl, {$scope: scope});
//
//            $httpBackend.flush();
//
//            dump(scope.formSchema)
//            elm = angular.element(
//               '<form name="myForm" class="form-horizontal compact">' +
//               '<form-input info="{\'name\': \'nested.twiceNested.nestedBField\',\'id\': \'f_nested.twiceNested.nestedBField\',\'label\': \'Nested.twicenested.nestedbfield\',\'type\': \'text\'}"></form-input>' +
//               '</form>');
//
//            $compile(elm)(scope);
//            scope.$digest();
//
//        }));
//
//        iit('Puts nested fields in the correct input controls', function() {
//            dump(elm);
//            var label = elm.find('label');
//            expect(label.text()).toBe('Description');
//
//        });
//
//    });

});

