'use strict';

describe('Conditionals', function() {

    it('should not show hidden fields', function () {
        browser().navigateTo('/#!/g_conditional_fields/51c583d5b9991226db418f00/edit');
        expect( element('.hasDatepicker:visible').count() ).toBe(0);
        input('record.accepted').check();
        expect( element('.hasDatepicker:visible').count() ).toBe(1);
        expect( element('#cg_f_loggedInBribeBook:visible').count()).toBe(1);
        input('record.bribeAmount').enter(2000);
        expect( element('#cg_f_loggedInBribeBook:visible').count()).toBe(0);
    });

    it('should not show hidden fields in sub schemas', function () {
        browser().navigateTo('/#!/f_nested_schema/51c583d5b5c51226db418f17/edit');
        expect( element('.hasDatepicker:visible').count() ).toBe(4);
    });


});

