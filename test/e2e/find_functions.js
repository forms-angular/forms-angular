'use strict';

describe('Find functions', function() {

    it('should find only the allowed records', function () {
        browser().navigateTo('/#/b_using_options');
        expect( repeater( '.well-small' ).count() ).toEqual(1);
        expect( element('a').text() ).toMatch(/IsAccepted/);
        expect( element('a').text() ).not().toMatch(/NotAccepted/);
    });

});
