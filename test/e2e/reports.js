'use strict';

describe('Reports', function() {

    it('should do simple pipeline reports', function () {
        browser().navigateTo('/#/analyse/g_conditional_fields?r=%5B%7B%22$group%22:%7B%22_id%22:%22$sex%22,%22count%22:%7B%22$sum%22:1%7D%7D%7D%5D');
        expect(element('.col1').text()).toMatch(/count/);
        expect(element('.col1').text()).toMatch(/11/);
    });

    it('should do reports with options from the command line', function() {
        browser().navigateTo('/#/analyse/g_conditional_fields?r=%7B%22pipeline%22:%5B%7B%22$group%22:%7B%22_id%22:%22$sex%22,%22count%22:%7B%22$sum%22:1%7D%7D%7D%5D,%22title%22:%22Breakdown%20By%20Sex%22,%22columnDefs%22:%5B%7B%22field%22:%22_id%22,%22displayName%22:%22Sex%22%7D,%7B%22field%22:%22count%22,%22displayName%22:%22No%20of%20Applicants%22%7D%5D%7D');
        expect(element('.col1').text()).toMatch(/No of Applicants/);
        expect(element('.col1').text()).toMatch(/11/);
    });

    it('should do report schemas', function() {
        browser().navigateTo('/#/analyse/g_conditional_fields/totals');
        expect()
    })
});
