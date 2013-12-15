// Tests for the friends directive

describe('directive with form', function () {
    var elm, scope, ctrl, $httpBackend,
        schema = {
            "surname":{"enumValues":[],"regExp":null,"path":"surname","instance":"String","validators":[[null,"Path `{PATH}` is required.","required"]],"setters":[],"getters":[],"options":{"required":true,"list":{}},"_index":null,"isRequired":true,"$conditionalHandlers":{}},
            "forename":{"enumValues":[],"regExp":null,"path":"forename","instance":"String","validators":[],"setters":[],"getters":[],"options":{"list":true},"_index":null,"$conditionalHandlers":{}},
            "friendList":{"schema":{"friend":{"path":"friend","instance":"ObjectID","validators":[],"setters":[],"getters":[],"options":{"ref":"a_unadorned_mongoose","form":{"select2":{"fngAjax":true}}},"_index":null,"$conditionalHandlers":{}},"type":{"enumValues":["best friend","partner","colleague","acquaintance","other"],"regExp":null,"path":"type","instance":"String","validators":[[null,"`{VALUE}` is not a valid enum value for path `{PATH}`.","enum"]],"setters":[],"getters":[],"options":{"enum":["best friend","partner","colleague","acquaintance","other"]},"_index":null,"$conditionalHandlers":{}}},"options":{"form":{"directive":"friends"}}},
            "_id":{"path":"_id","instance":"ObjectID","validators":[],"setters":[null],"getters":[],"options":{"auto":true},"_index":null,"$conditionalHandlers":{}}},
        oneFriend = {"_id":"123","surname":"Fitzgerald","forename":"Patrick","friendList":[{"friend":"666a6075b320153869b17599","type":"colleague"}]};

    // load the form code
    beforeEach(function() {
        angular.mock.module('formsAngular');
        angular.mock.module('myDemoApp');
        angular.mock.module('friends');
        angular.mock.module('app/demo/template/friends.html');
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('basic friends form', function () {

        beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location, $compile) {
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('api/schema/collection').respond(schema);
            $httpBackend.whenGET('api/collection/123').respond(oneFriend);
            elm = angular.element('<div><div form-buttons></div><form-input schema="formSchema"></form-input></div>');
            scope = $rootScope.$new();
            $location.$$path = '/collection/123/edit';
            ctrl = $controller("BaseCtrl", {$scope: scope});
            $httpBackend.flush();
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('disables save button until a change is made', function () {
            expect(scope.isSaveDisabled()).toEqual(true);
        });

        it('disables cancel button until a change is made', function () {
            expect(scope.isCancelDisabled()).toEqual(true);
        });

        it('enables save button when a change is made', function () {
            var elem = angular.element(elm.find('input:first')[0]);
            elem.val('Voronin');
            elem.change();
            expect(scope.isSaveDisabled()).toEqual(false);
        });

        it('enables cancel button when a change is made', function () {
            var elem = angular.element(elm.find('input:first')[0]);
            elem.val('Voronin');
            elem.change();
            expect(scope.isCancelDisabled()).toEqual(false);
        });

        it('shows the friend type', function() {
            var elem = angular.element(elm.find('.friends:first')[0]);
            expect(elem.text()).toMatch(/colleague/);
        });


        it('shows the friend name', function() {
            $httpBackend.whenGET('api/a_unadorned_mongoose/666a6075b320153869b17599').respond({"_id":"666a6075b320153869b17599","surname":"TestPerson2","forename":"Andrew","weight":142,"eyeColour":"Brown","accepted":true});
            var friend = scope.record.friendList[0];
            scope.frdShowDetails(friend);
            $httpBackend.flush();
            var elem = angular.element(elm.find('.friends-head')[0]);
            expect(elem.text()).toMatch(/Andrew/);
            expect(elem.text()).toMatch(/TestPerson2/);
        });

    });

});

