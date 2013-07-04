'use strict';

describe('Select 2', function() {

    it('should handle enums', function () {
        browser().navigateTo('/#/b_using_options/519a6075b320153869b155e0/edit');
        expect(element('#s2id_f_eyeColour').text()).toMatch(/Brown/);
    });

//    it('should handle lookups with collection read', function () {
//    });
//
//    it('should handle lookups using Ajax', function () {
//    });

});

