'use strict';

describe('Events', function () {

  var width = 1024;
  var height = 768;
  var browser = protractor.getInstance();
  browser.driver.manage().window().setSize(width, height);

  it('should get an event from form input', function () {
    // this tests the event handling between form-input directive and that it works with a select2 control
    browser.get('/#!/b_using_options/519a6075b320153869b175e0/edit');
    expect($('#cg_f_eyeColour').getCssValue('background-color')).toEqual('rgb(109, 219, 79, 1)');
  });

});