describe('Links', function () {

    beforeEach(function () {
        angular.mock.module('formsAngular');
    });

    describe('simple subkey', function () {

        var $httpBackend, scope, ctrl, elm,
            subkeySchema = {
                "surname":{"enumValues":[],"regExp":null,"path":"surname","instance":"String","validators":[],"setters":[],"getters":[],"options":{"index":true,"list":{}},"_index":true,"$conditionalHandlers":{}},
                "forename":{"enumValues":[],"regExp":null,"path":"forename","instance":"String","validators":[],"setters":[],"getters":[],"options":{"index":true,"list":true},"_index":true,"$conditionalHandlers":{}},
                "exams":{
                    "schema":{
                        "subject":{"enumValues":[],"regExp":null,"path":"subject","instance":"String","validators":[],"setters":[],"getters":[],"options":{},"_index":null,"$conditionalHandlers":{}},
                        "score":{"path":"score","instance":"Number","validators":[],"setters":[],"getters":[],"options":{},"_index":null,"$conditionalHandlers":{}},
                        "examDate":{"path":"examDate","instance":"Date","validators":[],"setters":[],"getters":[],"options":{},"_index":null,"$conditionalHandlers":{}}
                    },
                    "options":{
                        "form":{
                            "formStyle":"inline",
                            "subkey":{
                                "keyList":[{"subject":"English"}],
                                "container":"fieldset",
                                "title":"English Exam"
                            }
                        }
                    }
                }
            };

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        ddescribe('existing data with selected data present in first position',function() {

            beforeEach(inject(function (_$httpBackend_, $rootScope, $location, $controller, $compile) {
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('api/schema/f_nested_schema/English').respond(subkeySchema);
                $httpBackend.whenGET('api/f_nested_schema/51c583d5b5c51226db418f16').respond({
                    "_id":"51c583d5b5c51226db418f16",
                    "surname":"Smith",
                    "forename":"Anne",
                    "exams":[
                        {
                            "subject":"English",
                            "examDate":"2013-05-12T23:00:00.000Z",
                            "score":83,
                            "result":"pass"
                        },
                        {
                            "subject":"Maths",
                            "examDate":"2013-05-11T23:00:00.000Z",
                            "score":97,
                            "result":"distinction"
                        }
                    ]
                });
                $location.$$path = '/f_nested_schema/English/51c583d5b5c51226db418f16/edit';
                elm = angular.element(
                    '<form name="myForm" class="form-horizontal compact">' +
                        '<form-input schema="formSchema"></form-input>' +
                        '</form>');
                scope = $rootScope.$new();
                ctrl = $controller("BaseCtrl", {$scope: scope});
                $httpBackend.flush();
                $compile(elm)(scope);
                scope.$digest();
            }));

            it('generates correct fields', function () {
                // correct number of fields - excluding subkey
                var input = elm.find('input');
                expect(input.length).toBe(4);

                var label = angular.element(elm.find('label')[0]);
                expect(label.text()).toBe('Surname');
                var label = angular.element(elm.find('label')[1]);
                expect(label.text()).toBe('Forename');
                var label = angular.element(elm.find('label')[2]);
                expect(label.text()).toBe('Score');
                var label = angular.element(elm.find('label')[3]);
                expect(label.text()).toBe('Exam Date');

                // correct ids
                // correct models
                // correct values
            });

        });

    });

});


