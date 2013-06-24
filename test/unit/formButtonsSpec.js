describe('formButton', function() {
    var elm, scope;

    // load the tabs code
    beforeEach(angular.mock.module('formsAngular'));

    beforeEach(inject(function($rootScope, $compile) {
        elm = angular.element('<div><div form-buttons></div></div>');

        scope = $rootScope;
        $compile(elm)(scope);
        scope.$digest();
    }));


    it('should have Save, Cancel, New and Delete buttons', function() {
        var buttons = elm.find('button');

        expect(buttons.length).toBe(4);
        expect(buttons.eq(0).text().trim()).toBe('Save');
        expect(buttons.eq(1).text().trim()).toBe('Cancel');
        expect(buttons.eq(2).text().trim()).toBe('New');
        expect(buttons.eq(3).text().trim()).toBe('Delete');
    });


});
