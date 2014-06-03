'use strict';

describe('Navigation', function () {

  var width = 1024;
  var height = 768;
  var browser = protractor.getInstance();
  browser.driver.manage().window().setSize(width, height);
  
  var baseMenuCount = 7;

  it('should cope with a list with menu options', function () {
    browser.get('/#!/b_using_options');
    var list = element.all(by.css('.dropdown-option'));
    expect(list.count()).toBe(1 + baseMenuCount);
  });

  it('should cope with a list without menu options', function () {
    browser.get('/#!/d_array_example');
    var list = element.all(by.css('.dropdown-option'));
    expect(list.count()).toBe(0 + baseMenuCount);
  });

  it('should cope with an edit screen with menu options', function () {
    browser.get('/#!/b_using_options/519a6075b320153869b175e0/edit');
    var list = element.all(by.css('.dropdown-option'));
    expect(list.count()).toBe(2 + baseMenuCount);
  });

  it('should cope with an edit screen with menu options', function () {
    browser.get('/#!/a_unadorned_mongoose/519a6075b320153869b17599/edit');
    var list = element.all(by.css('.dropdown-option'));
    expect(list.count()).toBe(0 + baseMenuCount);
  });

});

