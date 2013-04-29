'use strict';

describe('Base edit form', function() {

    it('should display a form', function () {
        browser().navigateTo('/#/b_using_options/new');
        expect( element('div#cg_f_surname').text() ).
            toMatch( /Surname/ );
    });

    it('should display an error message if field level validation fails', function() {
        browser().navigateTo('/#/b_using_options/new');
        input('record.surname').enter('Smith');
        element('#saveButton').click();
        expect( element('.alert-error').text()).toMatch(/Accepted/);
        input('record.accepted').check();
        input('record.freeText').enter('this is a rude word');
        element('#saveButton').click();
        expect( element('.alert-error').text()).toMatch(/Wash your mouth!/)
    });

});

