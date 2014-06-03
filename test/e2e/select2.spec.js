'use strict';

describe('Select 2', function () {

  var width = 1024;
  var height = 768;
  var browser = protractor.getInstance();
  browser.driver.manage().window().setSize(width, height);  
  
  it('should handle enums', function () {
    browser.get('/#!/b_using_options/519a6075b320153869b155e0/edit');
    expect($('#s2id_f_eyeColour').getText()).toMatch(/Brown/);
  });

  it('should handle lookups with collection read', function () {
    browser.get('/#!/e_referencing_another_collection/51d1b2ca8c8683571c000005/edit');
    setTimeout(function () {
      expect($('#s2id_f_teacher').getText()).toMatch(/IsAccepted/);
//            element('#s2id_f_teacher').click();
//            setTimeout(function(){
//                expect(element('#select2-drop ul li:last').text()).toMatch(/Jones/);
//                element('#select2-drop ul li:last').click();
//                expect(element('#s2id_f_teacher').text()).toMatch(/Jones/);
//            },1);
    }, 0);
  });

  it('should handle lookups using Ajax', function () {
    browser.get('/#!/f_nested_schema/51c583d5b5c51226db418f16/edit');
    expect($('#s2id_autogen1 > a > span.select2-chosen').getText()).toMatch(/IsAccepted/);
  });

});

