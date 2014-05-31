'use strict';

var fs = require('fs');

function writeScreenShot(data, filename) {
  var stream = fs.createWriteStream(filename);

  stream.write(new Buffer(data, 'base64'));
  stream.end();
}

describe('Base edit form', function () {

  var browser = protractor.getInstance();

  it('should display a form', function () {
    browser.get('/#!/b_using_options/new');
    expect($('div#cg_f_surname').getText()).toMatch(/Surname/);
  });

  it('should display an error message if server validation fails', function () {
    browser.get('/#!/b_using_options/new');
    element(by.model('record.surname')).sendKeys('Smith');
    element(by.model('record.accepted')).click();
    element(by.model('record.freeText')).sendKeys('this is a rude word');
    $('#saveButton').click();
    expect($('.alert-error').getText()).toMatch(/Error!/);
    expect($('.alert-error').getText()).toMatch(/Wash your mouth!/);
    expect($('.alert-error').getText()).toNotMatch(/eye/);
  });

  describe('should display deletion confirmation modal', function () {

    beforeEach(function () {
      browser.get('/#!/a_unadorned_mongoose/666a6075b320153869b17599/edit');
    });

    it('should display deletion confirmation modal', function () {
      $('#deleteButton').click();
      var list = element.all(by.css('.modal'));
      expect(list.count()).toBe(1);
      expect($('.modal h3').getText()).toMatch('Delete Item');
    });

  });

  describe('Allows user to navigate away', function () {

    it('does not put up dialog if no changes', function () {
      browser.get('/#!/a_unadorned_mongoose/666a6075b320153869b17599/edit');
      $('#newButton').click();
      expect(browser.getCurrentUrl()).toMatch('/a_unadorned_mongoose/new');
    });

  });

  describe('prompts user to save changes', function () {

    beforeEach(function () {
      browser.get('/#!/b_using_options/519a6075b320153869b155e0/edit');
      element(by.model('record.freeText')).sendKeys('This is a rude thing');
      $('#newButton').click();
    });

    it('supports cancelling navigation', function () {
      var list = element.all(by.css('.modal'));
      expect(list.count()).toBe(1);
      $('.modal-footer button.dlg-cancel').click();
      expect(browser.getCurrentUrl()).toMatch('/b_using_options/519a6075b320153869b155e0/edit');
      list = element.all(by.css('.modal'));
      expect(list.count()).toBe(0);
    });

    it('supports losing changes', function () {
      $('.modal-footer button.dlg-no').click();
      expect(browser.getCurrentUrl()).toMatch('/b_using_options/new');
      var list = element.all(by.css('.modal'));
      expect(list.count()).toBe(0);
    });

    it('supports saving changes', function () {
      $('.modal-footer button.dlg-yes').click();
      expect($('.alert-error').getText()).toMatch(/your mouth/);
      var list = element.all(by.css('.modal'));
      expect(list.count()).toBe(0);
      var freeTextField = element(by.model('record.freeText'));
      freeTextField.clear();
      freeTextField.sendKeys('This is a polite thing ' + new Date().getTime());  // to ensure that it is a change
      $('#newButton').click();
      list = element.all(by.css('.modal'));
      expect(list.count()).toBe(1);
      $('.modal-footer button.dlg-yes').click();
      expect(browser.getCurrentUrl()).toMatch('/b_using_options/new');
      browser.get('/#!/b_using_options/519a6075b320153869b155e0/edit');
      expect($('#f_freeText').getAttribute('value')).toMatch(/polite thing/);
    });
  });

  describe('form button changes', function () {

    it('enables cancel button after a change', function () {
      browser.get('/#!/b_using_options/new');
      var freeTextField = element(by.model('record.surname'));
      freeTextField.clear();
      freeTextField.sendKeys('Smith');
      expect($('#f_surname').getAttribute('value')).toMatch(/Smith/);
      $('#cancelButton').click();
      expect($('#f_surname').getAttribute('value')).toNotMatch(/Smith/);
    });

    it('enables cancel button after deleting an array element (** requires server restart)', function () {
      browser.get('/#!/d_array_example/51a6182aea4ea77715000005/edit');
      var list = element.all(by.css('.fng-array'));
      expect(list.count()).toBe(1);
      $('#remove_f_specialSubjects_0').click();
      list = element.all(by.css('.fng-array'));
      expect(list.count()).toBe(0);
      $('#saveButton').click();
      browser.get('/#!/d_array_example/51a6182aea4ea77715000005/edit');
      list = element.all(by.css('.fng-array'));
      expect(list.count()).toBe(0);
    });

  });

  ddescribe('tab sets', function () {

    it('shows multiple tabs when appropriate', function () {
      browser.get('/#!/i_tabbed_forms/new');
      var list = element.all(by.css('.tabbable li a'));
      expect(list.count()).toBe(2);
      $('.tabbable li a:first').click();
      $('a:contains("second")').click();
    });

  });

});

