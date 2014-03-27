'use strict';

describe('Events', function() {

    it('should get an event from form input', function () {
        // this tests the event handling between form-input directive and that it works with a select2 control
        browser().navigateTo('/#!/b_using_options/519a6075b320153869b175e0/edit');
        expect( element( '#cg_f_eyeColour' ).css('background-color')).toEqual("rgb(109, 219, 79)");
    });

});