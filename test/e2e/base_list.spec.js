'use strict';

describe('Base list', function () {

  // ensure that menu options appear
  var width = 1024;
  var height = 768;
  var browser = protractor.getInstance();
  browser.driver.manage().window().setSize(width, height);

  it('should list all the records', function () {
    browser.get('/#!/a_unadorned_mongoose');
    expect($('a .list-item').getText()).toMatch(/TestPerson1/);
  });

  it('should support the listOrder option', function () {
    browser.get('/#!/g_conditional_fields');
    var list = element.all(by.css('.list-item'));
    expect(list.count()).toBeGreaterThan(8);
    expect($('.list-item>.span6:first-child').getText()).toNotMatch('Smith05 Smith06 Smith97 Smith08');
  });

  it('should support the model name override', function () {
    browser.get('/#!/h_deep_nesting');
    expect($('h1').getText()).toMatch(/^Nesting /);
  });

  it('should support dropdown text override', function () {
    browser.get('/#!/b_using_options');
    expect($('li.dropdown.model-controller-added').getText()).toMatch('Custom Dropdown');
  });

  it('should revert to normal model descriptions', function () {
    browser.get('/#!/d_array_example');
    expect($('h1').getText()).toMatch('D Array Example');
  });

  it('should support the model name override with bespoke formschema', function () {
    browser.get('/#!/b_using_options/justnameandpostcode');
    expect($('h1').getText()).toMatch('Another override');
    expect($('li.dropdown.model-controller-added').getText()).toMatch('Custom 2nd Level');
  });

});

