'use strict';

describe('Forms app demo', function () {

  var width = 1024;
  var height = 768;
  browser.driver.manage().window().setSize(width, height);

  it('should automatically redirect to index when location hash/fragment is empty', function () {
    browser.get('/');
    expect(browser.getCurrentUrl()).toMatch('\/#\/');
    expect($('h3').getText()).toMatch('Probably the most opinionated framework in the world');
  });

});
