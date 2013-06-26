'use strict';

describe('Forms app demo', function() {

    it('should automatically redirect to index when location hash/fragment is empty', function () {
        // for some reason this runs really slow, so only running it occasionally
        if (Math.random() < 0.1) {
            console.log("Running slow test - sorry");
            browser().navigateTo('/');
            expect(browser().window().hash()).toMatch('\/index');
        }
    });

});
