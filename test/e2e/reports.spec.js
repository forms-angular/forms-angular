'use strict';

describe('Reports', function () {

  var width = 1024;
  var height = 768;
  var browser = protractor.getInstance();
  browser.driver.manage().window().setSize(width, height);
  
  it('should do simple pipeline reports', function () {
    browser.get('/#!/analyse/g_conditional_fields?r=%5B%7B%22$group%22:%7B%22_id%22:%22$sex%22,%22count%22:%7B%22$sum%22:1%7D%7D%7D%5D');
    expect($('.ngHeaderText.ng-binding.colt1').getText()).toMatch(/count/);
    expect($('.ngCell.col1.colt1 > div:nth-child(2) > div > span').getText()).toMatch(/11/);
  });

  it('should do reports with options from the command line', function () {
    browser.get('/#!/analyse/g_conditional_fields?r={"pipeline":[{"$group":{"_id":"$sex","count":{"$sum":1}}}],"title":"Breakdown By Sex"' +
      ',"columnDefs":[{"field":"_id","displayName":"Sex"},{"field":"count","displayName":"No of Applicants"}]}');
    expect($('.ngHeaderText.ng-binding.colt1').getText()).toMatch(/No of Applicants/);
    expect($('.ngCell.col1.colt1 > div:nth-child(2) > div > span').getText()).toMatch(/11/);
  });

  it('should generate a default report', function () {
    browser.get('/#!/analyse/b_using_options');
    var list = element.all(by.css('.ngRow'));
    expect(list.count()).toBe(2);

    $('div.ngCell.col0.colt0 > div:nth-child(2) > div > span').click();
    expect(browser.getCurrentUrl()).toMatch('/b_using_options/519a6075b320153869b155e0/edit');
  });
});
