'use strict';

describe('Find functions', function() {

    it('should find only the allowed records', function () {
        browser().navigateTo('/#/b_using_options');
        expect( repeater( '.well-small' ).count() ).toEqual(1);
        expect( element('a').text() ).toMatch(/IsAccepted/);
        expect( element('a').text() ).not().toMatch(/NotAccepted/);
    });

    it('should support filters', function () {
        browser().navigateTo('/#/a_unadorned_mongoose?f=%7B%22eyeColour%22:%22Blue%22%7D');
        expect( repeater( '.well-small' ).count() ).toEqual(1);
        expect( element('a').text() ).toMatch(/TestPerson1/);
        expect( element('a').text() ).not().toMatch(/TestPerson2/);
    });

});
