'use strict';

describe('Find functions', function () {

  var width = 1024;
  var height = 768;
  var browser = protractor.getInstance();
  browser.driver.manage().window().setSize(width, height);

  it('should find only the allowed records', function () {
    browser.get('/#!/b_using_options');
    var list = element.all(by.css('.list-item'));
    expect(list.count()).toBe(2);
    expect($('.list-body').getText()).toMatch(/IsAccepted/);
    expect($('.list-body').getText()).toNotMatch(/NotAccepted/);
  });

  it('should support filters', function () {
    browser.get('/#!/a_unadorned_mongoose?f=%7B%22eyeColour%22:%22Blue%22%7D');
    var list = element.all(by.css('.list-item'));
    expect(list.count()).toBe(1);
    expect($('a .list-item').getText()).toMatch(/TestPerson1/);
    expect($('a .list-item').getText()).toNotMatch(/TestPerson2/);
  });

});
