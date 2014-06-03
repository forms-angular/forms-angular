'use strict';

describe('Conditionals', function () {

  var width = 1024;
  var height = 768;
  var browser = protractor.getInstance();
  browser.driver.manage().window().setSize(width, height);

  it('should not show hidden fields', function () {
    browser.get('/#!/g_conditional_fields/51c583d5b9991226db418f00/edit');
    var items = element.all(by.css('.hasDatepicker')).map(function (elm) {
      return (elm.isDisplayed());
    });
    expect(items).toEqual([false]);
    element(by.model('record.accepted')).click();
    expect($('.hasDatepicker').isDisplayed()).toBe(true);
    expect($('#cg_f_loggedInBribeBook').isDisplayed()).toBe(true);
    var bribeField = element(by.model('record.bribeAmount'));
    bribeField.clear();
    bribeField.sendKeys('2000');
    expect($('#cg_f_loggedInBribeBook').isDisplayed()).toBe(false);
  });

  it('should not show hidden fields in sub schemas', function () {
    browser.get('/#!/f_nested_schema/51c583d5b5c51226db418f17/edit');
    var items = element.all(by.css('.hasDatepicker')).map(function (elm) {
      return (elm.isDisplayed());
    });
    expect(items).toEqual([true, false, true, true, true, false]);
  });

});

