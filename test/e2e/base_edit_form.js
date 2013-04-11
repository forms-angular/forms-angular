'use strict';

describe('Base edit form', function() {

    it('should display a form', function () {
        browser().navigateTo('/#/b_using_options/new');
        expect( element('div#cg_f_surname').text() ).
            toMatch( /Surname/ );
    });

});

