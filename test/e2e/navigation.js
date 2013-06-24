'use strict';

describe('Navigation', function() {

    it('should cope with a list with menu options', function () {
        browser().navigateTo('/#/b_using_options');
        expect( repeater( '.dropdown-option' ).count() ).toEqual(1);
    });

    it('should cope with a list without menu options', function () {
        browser().navigateTo('/#/d_array_example');
        expect( repeater( '.dropdown-option' ).count() ).toEqual(0);
    });

    it('should cope with an edit screen with menu options', function () {
        browser().navigateTo('/#/b_using_options/519a6075b320153869b175e0/edit');
        expect( repeater( '.dropdown-option' ).count() ).toEqual(2);
    });


    it('should cope with an edit screen with menu options', function () {
        browser().navigateTo('/#/a_unadorned_mongoose/519a6075b320153869b17599/edit');
        expect( repeater( '.dropdown-option' ).count() ).toEqual(0);
    });

});

