'use strict';

describe('Reports', function () {

  beforeEach(function() {
    jasmine.addMatchers({
      toInclude: function () {
        return {
          compare: function (actual, expected) {
            var result = {};

            result.pass = actual.indexOf(expected) !== -1;

            if (result.pass) {
              result.message = 'Expected ' + expected + ' is in the text';
            }
            else {
              result.message = 'Expected ' + expected + ' to be in the text';
            }

            return result;
          }
        };
      }
    });
  });

  var width = 1024;
  var height = 768;
  browser.driver.manage().window().setSize(width, height);

  it('should do simple pipeline reports', function () {
    browser.get('/#/analyse/g_conditional_field?r=%5B%7B%22$group%22:%7B%22_id%22:%22$sex%22,%22count%22:%7B%22$sum%22:1%7D%7D%7D,%7B%22$sort%22:%7B%22_id%22:1%7D%7D%5D');
    expect(element.all(by.css('.ui-grid-cell-contents')).getText()).toEqual([ 'Id', 'Count', 'F', '11' , 'M', '6']);
  });

  it('should do reports with options from the command line', function () {
    browser.get('/#/analyse/g_conditional_field?r={"pipeline":[{"$group":{"_id":"$sex","count":{"$sum":1}}},{"$sort":{"_id":1}}],"title":"Breakdown By Sex"' +
      ',"columnDefs":[{"field":"_id","displayName":"Sex"},{"field":"count","displayName":"No of Applicants"}]}');
    expect(element.all(by.css('.ui-grid-cell-contents')).getText()).toEqual([ 'Sex', 'No of Applicants', 'F', '11', 'M', '6' ]);
  });

  it('should generate a default report', function () {
    browser.get('/#/analyse/b_enhanced_schema');
    var content = element.all(by.css('.ui-grid-cell-contents')).getText();
    expect(element.all(by.css('.ui-grid-cell-contents')).getText()).toInclude('Date Of Birth');
    expect(element.all(by.css('.ui-grid-cell-contents')).getText()).toInclude('519a6075b320153869b155e0');
    expect(element.all(by.css('.ui-grid-cell-contents')).getText()).toInclude('519a6075b440153869b155e0');
    element.all(by.css('.ui-grid-cell-contents')).last().click();
    expect(browser.getCurrentUrl()).toMatch('\/b_enhanced_schema\/(519a6075b440153869b155e0|519a6075b320153869b155e0)\/edit');
  });

  it('should run a standard report', function(){
    browser.get('/#/analyse/g_conditional_field/breakdownbysex');
    expect($('h1').getText()).toMatch('Numbers of Applicants By Sex');
    expect(element.all(by.css('.ui-grid-cell-contents')).getText()).toEqual([ 'Sex', 'No of Applicants', 'Female', '11', 'Male', '6' ]);
  })
});
