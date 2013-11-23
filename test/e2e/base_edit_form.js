'use strict';

describe('Base edit form', function() {

    it('should display a form', function () {
        browser().navigateTo('/#/b_using_options/new');
        expect( element('div#cg_f_surname').text() ).
            toMatch( /Surname/ );
    });

    it('should display an error message if server validation fails', function() {
        browser().navigateTo('/#/b_using_options/new');
        input('record.surname').enter('Smith');
        input('record.accepted').check();
        input('record.freeText').enter('this is a rude word');
        element('#saveButton').click();
        expect( element('.alert-error').text()).toMatch(/Error!/);
        expect( element('.alert-error').text()).toMatch(/Wash your mouth!/);
        expect( element('.alert-error').text()).not().toMatch(/eye/);
    });

    describe('should display deletion confirmation modal', function() {

        beforeEach(function () {

            browser().navigateTo('/#/a_unadorned_mongoose/666a6075b320153869b17599/edit');
        })

        it('should display deletion confirmation modal', function() {
            
            element('#deleteButton').click();
            expect( element('.modal').count() ).toEqual(1);
        });

    });

    describe('Allows user to navigate away',function() {

        it('does not put up dialog if no changes',function() {
            browser().navigateTo('/#/a_unadorned_mongoose/666a6075b320153869b17599/edit');
            element('#newButton').click();
            expect(browser().location().url()).toMatch("/a_unadorned_mongoose/new");
        });

    });

    describe('prompts user to save changes',function() {

        beforeEach(function() {
            browser().navigateTo('/#/b_using_options/519a6075b320153869b155e0/edit');
            input('record.freeText').enter('This is a rude thing');
            element('#newButton').click();
        });

        it('supports cancelling navigation', function() {
            expect( element('.modal').count() ).toEqual(1);
            element('.modal-footer button.dlg-cancel').click();
            expect(browser().location().url()).toMatch("/b_using_options/519a6075b320153869b155e0/edit");
            expect( element('.modal').count() ).toEqual(0);
        });

        it('supports losing changes', function() {
            element('.modal-footer button.dlg-no').click();
            expect(browser().location().url()).toMatch("/b_using_options/new");
            expect( element('.modal').count() ).toEqual(0);
        });

        it('supports saving changes', function() {
            element('.modal-footer button.dlg-yes').click();
            expect( element('.alert-error').text()).toMatch(/your mouth/);
            expect( element('.modal').count() ).toEqual(0);
            input('record.freeText').enter('This is a polite thing ' + new Date().getTime());  // to ensure that it is a change
            element('#newButton').click();
            expect( element('.modal').count() ).toEqual(1);
            element('.modal-footer button.dlg-yes').click();
            expect(browser().location().url()).toMatch("/b_using_options/new");
            browser().navigateTo('/#/b_using_options/519a6075b320153869b155e0/edit');
            expect(element('#f_freeText').val()).toMatch(/polite thing/);
        });
    });

    describe('form button changes',function() {

        it('enables cancel button after a change', function() {
            browser().navigateTo('/#/b_using_options/new');
            input('record.surname').enter('Smith');
            expect( element('#f_surname').val() ).toMatch( /Smith/ );
            element('#cancelButton').click();
            expect( element('#f_surname').val() ).not().toMatch( /Smith/ );
        });

    });

});

