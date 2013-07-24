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
        expect( element('.alert-error').text()).not().toMatch(/eye/)
    });

});


    describe('should display deletion confirmation modal', function() {


        beforeEach(function () {




            browser().navigateTo('/#/a_unadorned_mongoose/666a6075b320153869b17599/edit');
            // input('record.surname').enter('Steve');
            // // select('record.eyeColour').option('Blue');
            // element('#saveButton').click();
        })

        it('should display deletion confirmation modal', function() {
            
            element('#deleteButton').click();
            expect( element('.modal').count() ).toEqual(1);


            // expect( element('input#f_surname').count() ).toEqual(1);
        });

    });

