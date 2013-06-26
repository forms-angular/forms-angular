'use strict';

describe('Base list', function() {

    it('should list all the records', function () {
        browser().navigateTo('/#/a_unadorned_mongoose');
        expect(element('a').text()).toMatch( /TestPerson1/ );
    });

    it('should support the listOrder option', function() {
        browser().navigateTo('/#/g_conditional_fields');
        expect(repeater('.list-well').count()).toBeGreaterThan(8);
        expect(element('.list-well>.span6:first-child').text()).not().toMatch('Smith05 Smith06 Smith97 Smith08');
    });

});

