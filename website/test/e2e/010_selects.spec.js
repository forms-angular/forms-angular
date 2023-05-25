'use strict';

describe('Select', function () {

  var width = 1024;
  var height = 768;
  browser.driver.manage().window().setSize(width, height);

  it('should handle enums', function () {
    browser.get('/#/b_enhanced_schema/519a6075b320153869b155e0/edit');
    expect(element.all(by.css('.ui-select-container > .select2-choice > span.select2-chosen')).last().getText()).toMatch(/Brown/);
  });

  it('should handle lookups using Ajax', function () {
    browser.get('/#/f_nested_schema/51c583d5b5c51226db418f16/edit');
    expect(element.all(by.css('.select2-container a > span.select2-chosen')).get(1).getText()).toMatch(/IsAccepted/);
  });

  it('should do all the arrays in d as expected', function(){

    function addToArray(field, number) {
      var input;
      var addButton = element(by.id('add_f_' + field));
      if (!number) { number = 2; }
      for (var i = 0; i < number; i++)
        {
        addButton.click();
        input = element(by.id('f_' + field + '_' + i));
        input.clear();
        input.sendKeys(field + ' ' + i);
        }
    }

    function checkArray(field, number) {
      if (!number) { number = 2; }
      for (var i = 0; i < number; i++) {
        expect(element(by.id('f_' + field + '_' + i)).getAttribute('value')).toBe(field + ' ' + i);
      }
    }

    function checkValues() {
      checkArray('specialSubjects');
      checkArray('hobbies');
      checkArray('sports');
      expect(element(by.id('f_someOptions_0')).getAttribute('value')).toBe('Second');
      expect(element(by.id('f_someOptions_1')).getAttribute('value')).toBe('Third');
    }

    browser.get('/#/d_array_example/new');
    addToArray('specialSubjects');
    addToArray('hobbies');
    addToArray('sports');

    var addSelect = element(by.id('add_f_someOptions'));
    addSelect.click();
    expect(element(by.id('f_someOptions_0')).getAttribute('class')).toMatch('ng-pristine');
    // Next bit depends on https://github.com/angular/protractor/pull/1524
    element(by.cssContainingText('#f_someOptions_0 option', 'Second')).click();
    addSelect.click();
    expect(element(by.id('f_someOptions_1')).getAttribute('class')).toMatch('ng-pristine');
    element(by.cssContainingText('#f_someOptions_1 option', 'Third')).click();

    checkValues();

    // Save the record and check they all refresh OK
    element(by.css('#saveButton')).click();
    browser.sleep(400);
    browser.switchTo().alert().then(function (alert) {alert.accept(); });    // THis model has an onSave event
    expect(browser.getCurrentUrl()).toMatch(/d_array_example\/[0-9a-f]{24}\/edit/);
    checkValues();

  });

  it('should do all the arrays in e as expected', function(){

    function checkNonChangingValues() {
      expect(element(by.id('f_mentor')).getAttribute('value')).toBe('Anderson John');
      expect(element(by.id('f_leadMentor')).getAttribute('value')).toBe('Anderson John');
      expect(element(by.css('#f_teacher a')).getText()).toMatch('IsAccepted John');
      expect(element(by.id('f_assistants_0')).getAttribute('value')).toBe('TestPerson1');
      expect(element(by.id('f_assistants_1')).getAttribute('value')).toBe('TestPerson2');
      expect(element(by.id('f_assistants2_0')).getAttribute('value')).toBe('TestPerson1');
      expect(element(by.id('f_assistants2_1')).getAttribute('value')).toBe('TestPerson2');

    }

    function checkPreSavedValues() {
      checkNonChangingValues();
    }

    function checkPostSavedValues() {
      checkNonChangingValues();
    }

    function selectFngUiSelect(addSelect, field, selectText, fullText, selectAgain) {

      addSelect.click();
      expect(element(by.id(field)).getAttribute('class')).toMatch('ng-valid');

      if (selectAgain) {
        element(by.css('#' + field + ' a')).click();
      }
      var input = element(by.css('#'+field + ' .select2-search input'));
      input.sendKeys(selectText);
      input.sendKeys(protractor.Key.ENTER);
      expect(element(by.css('#'+field + ' a')).getText()).toMatch(fullText);
    }

    browser.get('/#/e_referencing_another_collection/new');

    expect(element(by.css('#f_teacher')).getAttribute('class')).not.toMatch('select2-allowclear');
    element(by.cssContainingText('#f_leadMentor option', 'Anderson John')).click();
    element(by.cssContainingText('#f_mentor option', 'Anderson John')).click();
    selectFngUiSelect(element(by.css('#f_teacher a')), 'f_teacher', 'Is', 'IsAccepted John', false);

    var addSelect = element(by.id('add_f_assistants'));
    addSelect.click();
    expect(element(by.id('f_assistants_0')).getAttribute('class')).toMatch('ng-pristine');
    element(by.cssContainingText('#f_assistants_0 option', 'TestPerson1')).click();
    addSelect.click();
    expect(element(by.id('f_assistants_1')).getAttribute('class')).toMatch('ng-pristine');
    element(by.cssContainingText('#f_assistants_1 option', 'TestPerson2')).click();

    addSelect = element(by.id('add_f_assistants2'));
    addSelect.click();
    expect(element(by.id('f_assistants2_0')).getAttribute('class')).toMatch('ng-pristine');
    element(by.cssContainingText('#f_assistants2_0 option', 'TestPerson1')).click();
    addSelect.click();
    expect(element(by.id('f_assistants2_1')).getAttribute('class')).toMatch('ng-pristine');
    element(by.cssContainingText('#f_assistants2_1 option', 'TestPerson2')).click();

    checkPreSavedValues();

    //// Save the record and check they all refresh OK
    element(by.css('#saveButton')).click();
    expect(browser.getCurrentUrl()).toMatch(/e_referencing_another_collection\/[0-9a-f]{24}\/edit/);
    checkPostSavedValues();

  });

});

