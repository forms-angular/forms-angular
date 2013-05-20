'use strict';

describe("Unit: Testing Services", function() {

    beforeEach(angular.mock.module('formsAngular'));

    it('should contain a working $locationParse service', inject(function($locationParse) {

        var parsedObject = $locationParse('/b_using_options/5194c43185810b1e947cd8c2/edit');
        expect(parsedObject.modelName).toBe("b_using_options");
        expect(parsedObject.id).toBe("5194c43185810b1e947cd8c2");
        expect(parsedObject.newRecord).toBe(false);
        expect(parsedObject.formName).toBe(undefined);

        parsedObject = $locationParse('/mymodel/myform/new');
        expect(parsedObject.modelName).toBe("mymodel");
        expect(parsedObject.id).toBe(undefined);
        expect(parsedObject.newRecord).toBe(true);
        expect(parsedObject.formName).toBe("myform");

    }));

});
