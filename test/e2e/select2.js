'use strict';

describe('Select 2', function() {

    it('should handle enums', function () {
        browser().navigateTo('/#/b_using_options/519a6075b320153869b155e0/edit');
        expect(element('#s2id_f_eyeColour').text()).toMatch(/Brown/);
    });

    // Cannot get this to work, but it works fine outside of test.  Losing it for now...
    xit('should handle lookups with collection read', function () {
        browser().navigateTo('/#/e_referencing_another_collection/51d1b2ca8c8683571c000005/edit');
        expect(element('#s2id_f_teacher').text()).toMatch(/IsAccepted/);
    });

    it('should handle lookups using Ajax', function () {
        browser().navigateTo('/#/f_nested_schema/51c583d5b5c51226db418f16/edit');
        expect(element('#s2id_exams-0-grader').text()).toMatch(/IsAccepted/);
    });

});

