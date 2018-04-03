'use strict';

describe('Find functions', function () {

  var width = 1024;
  var height = 768;
  browser.driver.manage().window().setSize(width, height);

  it('should find only the allowed records', function () {
    browser.get('/#/b_enhanced_schema');
    var list = element.all(by.css('.list-item'));
    expect(list.count()).toBe(2);
    expect($('.list-body').getText()).toMatch(/IsAccepted/);
    expect($('.list-body').getText()).not.toMatch(/NotAccepted/);
  });

  it('should support filters', function () {
    browser.get('/#/a_unadorned_schema?f=%7B%22eyeColour%22:%22Blue%22%7D');
    var list = element.all(by.css('.list-item'));
    expect(list.count()).toBe(1);
    expect($('a .list-item').getText()).toMatch(/TestPerson1/);
    expect($('a .list-item').getText()).not.toMatch(/TestPerson2/);
  });

});
