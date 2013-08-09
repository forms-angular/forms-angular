describe('Data Events', function(){

    var $httpBackend;

    beforeEach(function() {
        angular.mock.module('formsAngular');
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Before', function() {

        describe('Create', function(){

            it('should request make a call before creating document', function() {
                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
                    $httpBackend = _$httpBackend_;
                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                    $location.$$path = '/collection/new';
                    var scope = $rootScope.$new();
                    var ctrl = $controller("BaseCtrl", {$scope: scope});

                    scope.dataEventFunctions.onBeforeCreate = function(data, cb) {
                        data.name = 'Alan';
                        cb();
                    };

                    scope.record = {name:"John"};
                    $httpBackend.when('POST','api/collection',{"name":"Alan"}).respond(200,'SUCCESS');  // check for changed name
                    scope.save();
                    $httpBackend.flush();
                });
            });

            it('should not create document if onBefore returns an error', function() {
                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
                    $httpBackend = _$httpBackend_;
                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                    $location.$$path = '/collection/new';
                    var scope = $rootScope.$new();
                    var ctrl = $controller("BaseCtrl", {$scope: scope});

                    scope.dataEventFunctions.onBeforeCreate = function(data, cb) {
                        data.name = 'Alan';
                        cb(new Error("Something wrong"));
                    };

                    scope.record = {name:"John"};
                    scope.save();
                    $httpBackend.flush();
                });
            });

        });

        describe('Read', function(){

            it('should call function', function() {
                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
                    $httpBackend = _$httpBackend_;
                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                    $httpBackend.whenGET('api/collection/125').respond({"name":"Alan"});
                    $location.$$path = '/collection/125/edit';
                    var scope = $rootScope.$new();
                    var ctrl = $controller("BaseCtrl", {$scope: scope});

                    scope.dataEventFunctions.onBeforeRead = function(id, cb) {
                        if (id === 123) {
                            cb(new Error("You have no access"));
                        } else {
                            cb();
                        }
                    }

                    $httpBackend.flush();
                    expect(scope.record.name).toEqual('Alan');
                });
            });

            it('should not return document if onBefore returns an error', function() {
                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
                    $httpBackend = _$httpBackend_;
                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                    $location.$$path = '/collection/125/edit';
                    var scope = $rootScope.$new();
                    var ctrl = $controller("BaseCtrl", {$scope: scope});

                    scope.dataEventFunctions.onBeforeRead = function(id, cb) {
                        if (id === '125') {
                            cb(new Error("You have no access"));
                        } else {
                            cb();
                        }
                    }

                    $httpBackend.flush();
                });
            });

        });

        describe('Update', function(){

            it('should make a call before updating document', function() {
                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
                    $httpBackend = _$httpBackend_;
                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                    $httpBackend.whenGET('api/collection/125').respond({"name":"Alan", "_id":"125"});
                    $location.$$path = '/collection/125/edit';
                    var scope = $rootScope.$new();
                    var ctrl = $controller("BaseCtrl", {$scope: scope});

                    scope.dataEventFunctions.onBeforeUpdate = function(data, old, cb) {
                        expect(data.name).toEqual('John');
                        expect(old.name).toEqual('Alan');
                        data.name = 'Berty';
                        cb();
                    }

                    $httpBackend.flush();
                    $httpBackend.when('POST','api/collection/125',{"name":"Berty", "_id":"125"}).respond(200,'SUCCESS');
                    scope.record.name = "John";
                    scope.save();
                    $httpBackend.flush();
                });
            });

            it('should not update document if onBefore returns an error', function() {
                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
                    $httpBackend = _$httpBackend_;
                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                    $httpBackend.whenGET('api/collection/125').respond({"name":"Alan", "_id":"125"});
                    $location.$$path = '/collection/125/edit';
                    var scope = $rootScope.$new();
                    var ctrl = $controller("BaseCtrl", {$scope: scope});

                    scope.dataEventFunctions.onBeforeUpdate = function(data, old, cb) {
                        cb(new Error("Fail!"));
                    }

                    $httpBackend.flush();
                    scope.record.name = "John";
                    scope.save();
                });
            });

        });

        // Leaving the delete ones until the dialog testing is done so I don't have to reinvent the wheel
//        describe('Delete', function(){
//
//            it('should request make a call before deleting document', function() {
//                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
//                    $httpBackend = _$httpBackend_;
//                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
//                    $httpBackend.whenGET('api/collection/125').respond({"name":"Alan", "_id":"125"});
//                    $location.$$path = '/collection/125/edit';
//                    var scope = $rootScope.$new();
//                    var ctrl = $controller("BaseCtrl", {$scope: scope});
//
//                    scope.dataEventFunctions.onBeforeDelete = function(data, old, cb) {
//                        expect(data.name).toEqual('John');
//                        expect(old.name).toEqual('Alan');
//                        cb();
//                    }
//
//                    $httpBackend.flush();
//                    $httpBackend.when('DELETE','api/collection/125').respond(200,'SUCCESS');
//                    scope.record.name = "John";
//                    scope.delete();
//                    $httpBackend.flush();
//                });
//            });
//
//            it('should not delete document if onBefore returns an error', function() {
//                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
//                    $httpBackend = _$httpBackend_;
//                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
//                    $location.$$path = '/collection/new';
//                    var scope = $rootScope.$new();
//                    var ctrl = $controller("BaseCtrl", {$scope: scope});
//
//                    scope.dataEventFunctions.onBeforeCreate = function(data, old, cb) {
//                        data.name = 'Alan';
//                        cb(new Error("Something wrong"));
//                    }
//
//                    scope.record = {name:"John"};
//                    scope.save();
//                    $httpBackend.flush();
//                });
//            });
//
//        });
    });

    describe('After', function() {

        describe('Create', function(){

            it('should request make a call after creating document', function() {
                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
                    $httpBackend = _$httpBackend_;
                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                    $httpBackend.when('POST','api/collection',{"name":"John"}).respond(200,{name:"Philip"});
                    $location.$$path = '/collection/new';
                    var scope = $rootScope.$new();
                    var ctrl = $controller("BaseCtrl", {$scope: scope});

                    scope.dataEventFunctions.onAfterCreate = function(data) {
                        expect(data.name).toEqual('Philip');
                    };

                    scope.record = {name:"John"};
                    scope.save();
                    $httpBackend.flush();
                });
            });

        });

        describe('Read', function(){

            it('should request make a call after reading document', function() {
                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
                    $httpBackend = _$httpBackend_;
                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                    $httpBackend.whenGET('api/collection/125').respond({"name":"Alan"});
                    $location.$$path = '/collection/125/edit';
                    var scope = $rootScope.$new();
                    var ctrl = $controller("BaseCtrl", {$scope: scope});

                    scope.dataEventFunctions.onAfterRead = function(data) {
                        expect(data.name).toEqual('Alan')
                    }

                    $httpBackend.flush();
                });
            });
        });

        describe('Update', function(){

            it('should request make a call after updating document', function() {
                inject(function(_$httpBackend_, $rootScope, $controller, $location) {
                    $httpBackend = _$httpBackend_;
                    $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
                    $httpBackend.whenGET('api/collection/125').respond({"name":"Alan", "_id":"125"});
                    $location.$$path = '/collection/125/edit';
                    var scope = $rootScope.$new();
                    var ctrl = $controller("BaseCtrl", {$scope: scope});

                    scope.dataEventFunctions.onAfterUpdate = function(data, old) {
                        expect(data.name).toEqual('Philip');
                        expect(old.name).toEqual('Alan');
                    }

                    $httpBackend.flush();
                    $httpBackend.when('POST','api/collection/125',{"name":"John", "_id":"125"}).respond(200,{"name":"Philip", "_id":"125"});
                    scope.record.name = "John";
                    scope.save();
                    $httpBackend.flush();
                });
            });
        });

//        // Leaving the delete ones until the dialog testing is done so I don't have to reinvent the wheel
//        describe('Delete', function(){
//
//            it('should request make a call after deleting document', function() {
//                //            inject(function(_$httpBackend_, $rootScope, $controller, $location) {
//                //                $httpBackend = _$httpBackend_;
//                //                $httpBackend.whenGET('api/schema/collection').respond({"name":{"enumValues":[],"regExp":null,"path":"name","instance":"String","validators":[],"setters":[],"getters":[],"options":{"form":{"label":"Organisation Name"},"list":true},"_index":null}});
//                //                $httpBackend.when('POST','api/collection',{"name":"Alan"}).respond(200,'SUCCESS');
//                //                $location.$$path = '/collection/new';
//                //                var scope = $rootScope.$new();
//                //                var ctrl = $controller("BaseCtrl", {$scope: scope});
//                //
//                //                scope.dataEventFunctions.onAfterCreate = function(data, old, cb) {
//                //                    data.name = 'Alan';
//                //                    cb();
//                //                }
//                //
//                //                scope.record = {name:"John"};
//                //                scope.save();
//                //                $httpBackend.flush();
//                //            });
//            });
//
//        });
    });

});

