'use strict';

describe('Forms app demo', function () {

  var width = 1024;
  var height = 768;
  var browser = protractor.getInstance();
  browser.driver.manage().window().setSize(width, height);

  it('should automatically redirect to index when location hash/fragment is empty', function () {
    browser.get('/');
    expect(browser.getCurrentUrl()).toMatch('\/index');
  });

});
