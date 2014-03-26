'use strict';

describe('Select 2', function() {

    it('should handle enums', function () {
        browser().navigateTo('/#!/b_using_options/519a6075b320153869b155e0/edit');
        expect(element('#s2id_f_eyeColour').text()).toMatch(/Brown/);
    });

    it('should handle lookups with collection read', function () {
        browser().navigateTo('/#!/e_referencing_another_collection/51d1b2ca8c8683571c000005/edit');
        setTimeout(function(){
            expect(element('#s2id_f_teacher').text()).toMatch(/IsAccepted/);
//            element('#s2id_f_teacher').click();
//            setTimeout(function(){
//                expect(element('#select2-drop ul li:last').text()).toMatch(/Jones/);
//                element('#select2-drop ul li:last').click();
//                expect(element('#s2id_f_teacher').text()).toMatch(/Jones/);
//            },1);
        },0);
    });

    it('should handle lookups using Ajax', function () {
        browser().navigateTo('/#!/f_nested_schema/51c583d5b5c51226db418f16/edit');
        expect(element('#cg_f_exams_grader:first .select2-container').text()).toMatch(/IsAccepted/);
    });

});

