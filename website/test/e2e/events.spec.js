'use strict';

describe('Events', function () {

  var width = 1024;
  var height = 768;
  browser.driver.manage().window().setSize(width, height);

  it('should get an event from form input', function () {
    // this tests the event handling on form input change
    browser.get('/#/b_enhanced_schema/519a6075b320153869b155e0/edit');
    browser.waitForAngular();
    expect($('#cg_f_accepted').getCssValue('background-color')).toEqual('rgba(144, 238, 144, 1)');
  });

});
