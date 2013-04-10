'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function() {

    beforeEach(function () {
        browser().navigateTo('/');
    });

    it('should automatically redirect to index when location hash/fragment is empty', function () {
        console.log("Browser",browser());
        console.log("Location",browser().location());
        console.log("Url",browser().location().url());
//        expect(browser().location().url()).toBe("/index");
    });

//    it('should display error messages');
//    it('should support schema findFunctions');
//    it('should allow selections from a global search box')
});
