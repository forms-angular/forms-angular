'use strict';

describe('Global search capability', function() {

    it('should find a record', function () {
        browser().navigateTo('/');
        input('searchTarget').enter('IsAcce')
        expect( repeater( 'a.ng-binding' ).count() ).toEqual(1);
    });

    it('should find multiple records', function () {
        browser().navigateTo('/');
        input('searchTarget').enter('Test')
        expect( repeater( 'a.ng-binding' ).count() ).toEqual(2);
    });

    it('should not find records that dont meet find function', function () {
        browser().navigateTo('/');
        input('searchTarget').enter('Not')
        expect( repeater( 'a.ng-binding' ).count() ).toEqual(0);
    });

});
