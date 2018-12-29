'use strict';

describe('Base edit form', function () {

  var width = 1024;
  var height = 768;
  browser.driver.manage().window().setSize(width, height);

  it('should display a form without debug info', function () {
    browser.get('/#/b_enhanced_schema/new');
    expect($('div#cg_f_surname').getText()).toMatch(/Surname/);

    // check we haven't left the schema or record on display after debugging (assuming we used <pre>)
    expect(element.all(by.css('pre')).count()).toBe(0);
  });

  it('should display an error message if server validation fails', function () {
    browser.get('/#/b_enhanced_schema/new');
    var field = element(by.model('record.surname'));
    field.clear();
    field.sendKeys('Smith');
    element(by.model('record.accepted')).click();
    element(by.model('record.freeText')).sendKeys('this is a rude word');
    $('#saveButton').click();
    var alertTextPromise = element(by.css('.alert-error')).getText();
    expect(alertTextPromise).toMatch(/Error!/);
    expect(alertTextPromise).toMatch(/Wash your mouth!/);
    expect(alertTextPromise).not.toMatch(/eye/);
  });

  describe('should display deletion confirmation modal', function () {

    beforeEach(function () {
      browser.get('/#/a_unadorned_schema/666a6075b320153869b17599/edit');
    });

    it('should display deletion confirmation modal', function () {
      $('#deleteButton').click();
      browser.sleep(400);
      var list = element.all(by.css('.modal'));
      expect(list.count()).toBe(1);
      expect($('.modal .modal-footer').getText()).toMatch('No');
      expect($('.modal .modal-footer').getText()).toMatch('Yes');
      expect($('.modal').getText()).toMatch('Are you sure you want to delete this record?');
      expect($('.modal h3').getText()).toMatch('Delete Item');
      $('.modal-footer button.dlg-no').click();
      expect(browser.getCurrentUrl()).toMatch('/a_unadorned_schema/666a6075b320153869b17599/edit');
      // list = element.all(by.css('.modal'));
      // expect(list.count()).toBe(0);
    });

  });

  describe('Allows user to navigate away', function () {

    it('does not put up dialog if no changes', function () {
      browser.get('/#/a_unadorned_schema/666a6075b320153869b17599/edit');
      $('#newButton').click();
      expect(browser.getCurrentUrl()).toMatch('/a_unadorned_schema/new');
    });

  });

  describe('prompts user to save changes', function () {

    beforeEach(function () {
      browser.get('/#/b_enhanced_schema/519a6075b320153869b155e0/edit');
      browser.sleep(200);
      element(by.model('record.freeText')).sendKeys('This is a rude thing');
      $('#newButton').click();
      browser.sleep(1000);  //Really naff, but I tried for ages to do something better.  Apparently zones.js will sort it out eventually
    });

    it('supports cancelling navigation', function () {
      var list = element.all(by.css('.modal'));
      expect(list.count()).toBe(1);
      expect($('.modal').getText()).toMatch('changes');
      expect($('.modal .modal-footer').getText()).toMatch('Cancel');
      $('.modal-footer button.dlg-cancel').click();
      expect(browser.getCurrentUrl()).toMatch('/b_enhanced_schema/519a6075b320153869b155e0/edit');
      list = element.all(by.css('.modal'));
      expect(list.count()).toBe(0);
    });

    it('supports losing changes', function () {
      var list = element.all(by.css('.modal'));
      expect(list.count()).toBe(1);
      expect($('.modal').getText()).toMatch('changes');
      expect($('.modal .modal-footer').getText()).toMatch('Cancel');
      $('.modal-footer button.dlg-no').click();
      expect(browser.getCurrentUrl()).toMatch('/b_enhanced_schema/new');
    });

    it('supports saving changes', function () {
      var list = element.all(by.css('.modal'));
      expect(list.count()).toBe(1);
      expect($('.modal').getText()).toMatch('changes');
      expect($('.modal .modal-footer').getText()).toMatch('Cancel');
      var yesBtn = $('.modal-footer button.dlg-yes');
      yesBtn.click();
      expect($('.alert-error').getText()).toMatch(/your mouth/);
      var freeTextField = element(by.model('record.freeText'));
      freeTextField.clear();
      freeTextField.sendKeys('This is a polite thing');
      $('#newButton').click();
      browser.sleep(500);
      list = element.all(by.css('.modal'));
      expect(list.count()).toBe(1);
      yesBtn = $('.modal-footer button.dlg-yes');
      yesBtn.click();
      expect(browser.getCurrentUrl()).toMatch('/b_enhanced_schema/new');
      browser.get('/#/b_enhanced_schema/519a6075b320153869b155e0/edit');
      expect($('#f_freeText').getAttribute('value')).toMatch(/polite thing/);
    });
  });

  describe('form button changes', function () {

    it('enables cancel button after a change', function () {
      browser.get('/#/b_enhanced_schema/new');
      var freeTextField = element(by.model('record.surname'));
      freeTextField.clear();
      freeTextField.sendKeys('Smith');
      var surnameInput = $('#f_surname');
      expect(surnameInput.getAttribute('value')).toMatch(/Smith/);
      $('#cancelButton').click();
      expect(surnameInput.getAttribute('value')).not.toMatch(/Smith/);
    });

    it('enables cancel button after deleting an array element (** requires server restart)', function () {
      browser.get('/#/d_array_example/51a6182aea4ea77715000005/edit');
      var list = element.all(by.css('.fng-array'));
      expect(list.count()).toBe(1);
      $('#remove_f_specialSubjects_0').click();
      list = element.all(by.css('.fng-array'));
      expect(list.count()).toBe(0);
      $('#saveButton').click();
      browser.get('/#/d_array_example/51a6182aea4ea77715000005/edit');
      list = element.all(by.css('.fng-array'));
      expect(list.count()).toBe(0);
    });

  });

  describe('tab sets', function () {

    it('shows multiple tabs when appropriate', function () {
      browser.get('/#/i_tabbed_form/new');
      var list = element.all(by.css('.nav-tabs li a'));
      expect(list.count()).toBe(2);
    });

  });

});

