'use strict';

describe('Base list', function() {

    it('should list all the records', function () {
        browser().navigateTo('/#!/a_unadorned_mongoose');
        expect(element('a').text()).toMatch( /TestPerson1/ );
    });

    it('should support the listOrder option', function() {
        browser().navigateTo('/#!/g_conditional_fields');
        expect(repeater('.list-item').count()).toBeGreaterThan(8);
        expect(element('.list-item>.span6:first-child').text()).not().toMatch('Smith05 Smith06 Smith97 Smith08');
    });

    it('should support the model name override', function() {
        browser().navigateTo('/#!/h_deep_nesting');
        expect(element('h1').text()).toMatch(/^Nesting /);
    });

    it('should support dropdown text override', function() {
        browser().navigateTo('/#!/b_using_options');
        expect(element('li.dropdown').text()).toMatch('Custom Dropdown');
    });

    // this test doesn't fail when it should...
    it('should revert to normal model descriptions', function() {
        browser().navigateTo('/#!/d_array_example');
        expect(element('h1').text()).toMatch('D Array Example');
    });

    it('should support the model name override with bespoke formschema', function() {
        browser().navigateTo('/#!/b_using_options/justnameandpostcode');
        expect(element('h1').text()).toMatch('Another override');
        expect(element('li.dropdown').text()).toMatch('Custom 2nd Level');
    });

});

