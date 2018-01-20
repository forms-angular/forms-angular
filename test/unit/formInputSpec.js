'use strict';

describe('formInput', function () {
  var elm, scope;

  // load the form code
  beforeEach(angular.mock.module('formsAngular'));

  describe('simple text input', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input formStyle="horizontalCompact" schema="formSchema"></form-input></div>');
      scope = $rootScope;
      scope.formSchema = {name: 'desc', id: 'descId', label: 'Description', type: 'text'};
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have a label', function () {
      var label = elm.find('label');
      expect(label.text()).toBe('Description');
      expect(label.attr('for')).toBe('descId');
      expect(label).toHaveClass('control-label');
    });

    it('should have input', function () {
      var input = elm.find('input');
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('descId');
      expect(input.attr('type')).toBe('text');
    });

    it('should connect the input to the form', function () {
      expect(scope.myForm.descId.$pristine).toBe(true);
    });

  });

  describe('generate inputs from schema', function () {

    beforeEach(inject(function ($rootScope, $compile) {

      elm = angular.element('<div><form-input schema="formSchema"></form-input></div>');
      scope = $rootScope;
      scope.formSchema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {name: 'eyecolour', id: '2', label: 'Colour of Eyes', type: 'text'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have 2 inputs', function () {
      var input = elm.find('input');
      expect(input.length).toBe(2);

      input = angular.element(elm.find('input')[0]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('_1');
      expect(input.attr('autofocus')).toBe('');
      expect(input.attr('type')).toBe('text');

      input = angular.element(elm.find('input')[1]);
      expect(input.attr('id')).toBe('_2');
      expect(input.attr('type')).toBe('text');
      expect(input.attr('autofocus')).toBe(undefined);
    });

    it('should have 2 labels', function () {
      var label = elm.find('label');
      expect(label.length).toBe(2);

      label = angular.element(elm.find('label')[0]);
      expect((label).text()).toBe('Name');
      expect(label.attr('for')).toBe('_1');

      label = angular.element(elm.find('label')[1]);
      expect(label.text()).toBe('Colour of Eyes');
      expect(label.attr('for')).toBe('_2');
    });

  });

  describe('handles sub schemas', function () {

    describe('default behaviour', function () {
      beforeEach(inject(function ($rootScope, $compile) {
        elm = angular.element('<div><form-input schema="formSchema"></form-input></div>');
        scope = $rootScope;
        scope.formSchema = [
          {'name': 'surname', 'id': 'f_surname', 'label': 'Surname', 'type': 'text'},
          {'name': 'forename', 'id': 'f_forename', 'label': 'Forename', 'type': 'text'},
          {'name': 'exams', 'id': 'f_exams', 'label': 'Exams', 'schema': [
            {'name': 'exams.subject', 'id': 'f_exams.subject', 'label': 'Subject', 'type': 'text'},
            {'name': 'exams.score', 'id': 'f_exams.score', 'label': 'Score', 'type': 'number'}
          ]}
        ];

        scope.record = {'surname': 'Smith', 'forename': 'Anne', 'exams': [
          {'subject': 'English', 'score': 83},
          {'subject': 'Maths', 'score': 97}
        ]};
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('has Exams section', function () {
        var thisElm = angular.element(elm.find('div')[7]);
        expect(thisElm).toHaveClass('schema-head');
        expect(thisElm.text()).toBe('Exams');

        thisElm = angular.element(elm.find('div')[26]);
        expect(thisElm).toHaveClass('schema-foot');

        thisElm = thisElm.find('button');
        expect((thisElm).text()).toMatch(/Add/);

        thisElm = elm.find('div');
        expect(thisElm).toHaveClassCount('sub-doc', 2);

        thisElm = angular.element(elm.find('div')[8]);
        expect(thisElm.attr('id')).toBe('f_examsList_0');
        thisElm = angular.element(elm.find('div')[17]);
        expect(thisElm.attr('id')).toBe('f_examsList_1');

        thisElm = elm.find('input');
        expect(thisElm).toHaveTypeCount('number', 2);

        thisElm = angular.element(elm.find('button')[0]);
        expect(thisElm.text()).toMatch(/Remove/);
      });
    });

    describe('Inhibit add and remove', function () {
      beforeEach(inject(function ($rootScope, $compile) {
        elm = angular.element('<div><form-input schema="formSchema"></form-input></div>');
        scope = $rootScope;
        scope.formSchema = [
          {'name': 'surname', 'id': 'f_surname', 'label': 'Surname', 'type': 'text'},
          {'name': 'forename', 'id': 'f_forename', 'label': 'Forename', 'type': 'text'},
          {'name': 'exams', 'id': 'f_exams', 'label': 'Exams', 'noAdd': true, 'noRemove': true, 'schema': [
            {'name': 'exams.subject', 'id': 'f_exams.subject', 'label': 'Subject', 'type': 'text'},
            {'name': 'exams.score', 'id': 'f_exams.score', 'label': 'Score', 'type': 'number'}
          ]}
        ];
        scope.record = {'surname': 'Smith', 'forename': 'Anne', 'exams': [
          {'subject': 'English', 'score': 83},
          {'subject': 'Maths', 'score': 97}
        ]};
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('has amended Exams section head', function () {
        var thisElm = elm.find('div');
        expect(thisElm).toHaveClassCount('schema-head', 1);
        thisElm = angular.element(elm.find('div')[7]);
        expect(thisElm.text()).toBe('Exams');
      });

      it('has amended Exams section foot', function () {
        var thisElm = elm.find('.schema-foot');
        expect(thisElm.length).toBe(0);
      });

      it('has amended Exams section buttons', function () {
        var thisElm = elm.find('button');
        expect(thisElm.length).toBe(0);
      });

      it('has amended Exams section subdoc', function () {
        var thisElm = elm.find('div');
        expect(thisElm).toHaveClassCount('sub-doc', 2);
      });

    });

  });

  describe('does not generate label element when label is blank', function () {

    beforeEach(inject(function ($rootScope, $compile) {

      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {name: 'nickname', type: 'text'},
        {name: 'hairColour', label: null, type: 'text'},
        {name: 'eyecolour', id: '2', label: '', type: 'text'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have 3 inputs', function () {
      var input = elm.find('input');
      expect(input.length).toBe(4);

      input = angular.element(elm.find('input')[0]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('_1');
      expect(input.attr('type')).toBe('text');

      input = angular.element(elm.find('input')[3]);
      expect(input.attr('id')).toBe('_2');
      expect(input.attr('type')).toBe('text');
    });

    it('should have 2 visible labels', function () {
      var label = elm.find('label');
      expect(label.length).toBe(4);

      label = angular.element(elm.find('label')[0]);
      expect((label).text()).toBe('Name');
      expect(label.attr('for')).toBe('_1');

      label = angular.element(elm.find('label')[1]);
      expect((label).text()).toBe('Nickname');
      expect(label.attr('for')).toBe('f_nickname');

      label = angular.element(elm.find('label')[2]);
      expect((label).text()).toBe('');
      expect(label.attr('for')).toBe('f_hairColour');

      label = angular.element(elm.find('label')[3]);
      expect((label).text()).toBe('');
      expect(label.attr('for')).toBe('_2');

    });

  });

  describe('generates "required" attribute when appropriate', function () {

    beforeEach(inject(function ($rootScope, $compile) {

      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text', required: true},
        {name: 'eyecolour', id: '2', label: '', type: 'text'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have correct inputs', function () {
      var input = elm.find('input');
      expect(input.length).toBe(2);

      input = angular.element(elm.find('input')[0]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-invalid');
      expect(input.attr('id')).toBe('_1');
      expect(input.attr('required')).toBe('required');
      expect(input.attr('type')).toBe('text');

      input = angular.element(elm.find('input')[1]);
      expect(input.attr('id')).toBe('_2');
      expect(input.attr('required')).toBe(undefined);
      expect(input.attr('type')).toBe('text');
    });

  });

  describe('generates help elements', function () {

    beforeEach(inject(function ($rootScope, $compile) {

      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text', help: 'This is some help'},
        {name: 'eyecolour', id: '2', label: '', type: 'text', helpInline: 'This is some inline help'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have correct help blocks', function () {
      var help = elm.find('span');
      expect(help.length).toBe(2);

      help = angular.element(elm.find('span')[0]);
      expect(help).toHaveClass('help-block');
      expect(help.text()).toBe('This is some help');

      help = angular.element(elm.find('span')[1]);
      // expect(help).toHaveClass('help-inline');   No such thing in BS3
      expect(help.text()).toBe('This is some inline help');
    });

  });

  describe('generates textarea inputs', function () {

    beforeEach(inject(function ($rootScope, $compile) {

      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {name: 'description', id: '2', label: 'Desc', type: 'textarea', rows: 10}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have correct textarea', function () {
      var input = elm.find('input');
      expect(input.length).toBe(1);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('_1');
      expect(input.attr('type')).toBe('text');
      input = elm.find('textarea');
      expect(input.length).toBe(1);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('_2');
      expect(input.attr('rows')).toBe('10');
    });

  });

  describe('generates readonly inputs', function () {

    beforeEach(inject(function ($rootScope, $compile) {

      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fEyeColourOptions = ['Blue', 'Brown', 'Green', 'Hazel'];
      scope.fSexOptions = ['Male', 'Female'];
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text', readonly: true},
        {name: 'description', id: '2', label: 'Desc', type: 'textarea', rows: 10, readonly: true},
        {name: 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'select', 'options': 'fEyeColourOptions', readonly: true},
        {name: 'accepted', 'helpInline': 'Did we take them?','type': 'checkbox', readonly: true, 'id': 'f_accepted', 'label': 'Accepted'},
        {name: 'sex', type: 'radio', 'inlineRadio': true, 'options': 'fSexOptions', 'id': 'f_sex', 'label': 'Sex', readonly: true}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('text and textarea', function () {
      var input = angular.element(elm.find('input')[0]);
      expect(input.attr('readonly')).toBe('readonly');
      input = elm.find('textarea');
      expect(input.attr('readonly')).toBe('readonly');
    });

    it('select', function () {
      var input = angular.element(elm.find('select')[0]);
      expect(input.attr('disabled')).toBe('disabled');
    });

    it('checkbox', function () {
      var input = angular.element(elm.find('input')[2]);
      expect(input.attr('disabled')).toBe('disabled');
    });

    it('radio button', function () {
      var input = angular.element(elm.find('input')[3]);
      expect(input.attr('disabled')).toBe('disabled');
    });

  });

  describe('generates required inputs', function () {

    beforeEach(inject(function ($rootScope, $compile) {

      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fEyeColourOptions = ['Blue', 'Brown', 'Green', 'Hazel'];
      scope.fSexOptions = ['Male', 'Female'];
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text', required: true},
        {name: 'description', id: '2', label: 'Desc', type: 'textarea', rows: 10, required: true},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'select', 'options': 'fEyeColourOptions', required: true},
        {name: 'accepted', 'helpInline': 'Did we take them?','type': 'checkbox', required: true, 'id': 'f_accepted', 'label': 'Accepted'},
        {name: 'sex', type: 'radio', 'inlineRadio': true, 'options': 'fSexOptions', 'id': 'f_sex', 'label': 'Sex', required: true}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('text and textarea', function () {
      var input = angular.element(elm.find('input')[0]);
      expect(input.attr('required')).toBe('required');
      input = elm.find('textarea');
      expect(input.attr('required')).toBe('required');
    });

    it('select', function () {
      var input = angular.element(elm.find('select')[0]);
      expect(input.attr('required')).toBe('required');
    });

    it('checkbox', function () {
      var input = angular.element(elm.find('input')[2]);
      expect(input.attr('required')).toBe('required');
    });

    it('radio button', function () {
      var input = angular.element(elm.find('input')[3]);
      expect(input.attr('required')).toBe('required');
    });


  });

  describe('generates password inputs', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.schema = [
        {name: 'password', id: '1', label: 'Name', type: 'password'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('creates password field', function () {
      var input = elm.find('input');
      expect(input.attr('type')).toBe('password');
    });

  });

  describe('generates selects for enumerated lists stored in scope', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fEyeColourOptions = ['Blue', 'Brown', 'Green', 'Hazel'];
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'select', 'options': 'fEyeColourOptions'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have combobox', function () {
      var input = elm.find('select');
      expect(input.length).toBe(1);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('f_eyeColour');
      input = elm.find('option');
      expect(input.length).toBe(5);

      input = angular.element(elm.find('option')[0]);
      expect(input.attr('value')).toBe('');
      expect(input.text()).toBe('');

      input = angular.element(elm.find('option')[4]);
      expect(input.attr('value')).toBe('Hazel');
      expect(input.text()).toBe('Hazel');
    });

  });

  describe('generates selects for enumerated lists with specified labels', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fEyeColourOptions = {values:['bl','br','gr','ha'], labels:['Blue', 'Brown', 'Green', 'Hazel']};
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'select', 'options': 'fEyeColourOptions'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have combobox', function () {
      var input = elm.find('select');
      expect(input.length).toBe(1);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('f_eyeColour');
      input = elm.find('option');
      expect(input.length).toBe(5);

      input = angular.element(elm.find('option')[0]);
      expect(input.attr('value')).toBe('');
      expect(input.text()).toBe('');

      input = angular.element(elm.find('option')[4]);
      expect(input.attr('value')).toBe('ha');
      expect(input.text()).toMatch('Hazel');
    });

  });

  describe('generates selects for enumerated lists with no specified labels', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fEyeColourOptions = {values:['bl','br','gr','ha']};
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'select', 'options': 'fEyeColourOptions'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have combobox', function () {
      var input = elm.find('select');
      expect(input.length).toBe(1);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('f_eyeColour');
      input = elm.find('option');
      expect(input.length).toBe(5);

      input = angular.element(elm.find('option')[0]);
      expect(input.attr('value')).toBe('');
      expect(input.text()).toBe('');

      input = angular.element(elm.find('option')[4]);
      expect(input.attr('value')).toBe('ha');
      expect(input.text()).toMatch('ha');
    });

  });

  describe('generates selects for passed enumerated lists', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'select', 'options': ['Blue', 'Brown', 'Green', 'Hazel']}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have combobox', function () {
      var input = elm.find('select');
      expect(input.length).toBe(1);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('f_eyeColour');
      input = elm.find('option');
      expect(input.length).toBe(5);

      input = angular.element(elm.find('option')[0]);
      expect(input.attr('value')).toBe('');
      expect(input.text()).toBe('');

      input = angular.element(elm.find('option')[4]);
      expect(input.attr('value')).toBe('Hazel');
      expect(input.text()).toBe('Hazel');
    });

  });


  describe('generates selects for reference lookups', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fEyeColourOptions = ['Blue', 'Brown', 'Green', 'Hazel'];
      scope.fEyeColourIds = ['1234', '5678', '90ab', 'cdef'];
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'select', 'options': 'fEyeColourOptions', 'ids': 'fEyeColourIds'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have combobox', function () {
      var input = elm.find('select');
      expect(input.length).toBe(1);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('f_eyeColour');
      input = elm.find('option');
      expect(input.length).toBe(5);

      input = angular.element(elm.find('option')[0]);
      expect(input.attr('value')).toBe('');
      expect(input.text()).toBe('');

      input = angular.element(elm.find('option')[4]);
      expect(input.text()).toBe('Hazel');
    });

  });

  describe('generates radio buttons for enumerated lists stored in scope', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fEyeColourOptions = ['Blue', 'Brown', 'Green', 'Hazel'];
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'radio', 'options': 'fEyeColourOptions'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have radio buttons', function () {
      var input = elm.find('input');
      expect(input.length).toBe(5);

      input = angular.element(elm.find('input')[4]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('3-f_eyeColour');
      expect(input.attr('value')).toBe('Hazel');
      expect(input.parent().text()).toMatch('Hazel');
    });

  });

  describe('generates radio buttons for enumerated lists stored in scope with specified labels', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fEyeColourOptions = {values:['bl','br','gr','ha'], labels:['Blue', 'Brown', 'Green', 'Hazel']};
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'radio', 'options': 'fEyeColourOptions'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have radio buttons', function () {
      var input = elm.find('input');
      expect(input.length).toBe(5);

      input = angular.element(elm.find('input')[4]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('3-f_eyeColour');
      expect(input.attr('value')).toBe('ha');
      expect(input.parent().text()).toMatch('Hazel');
    });

  });

  describe('generates radio buttons for enumerated lists stored in scope with no specified labels', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fEyeColourOptions = {values:['bl','br','gr','ha']};
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'radio', 'options': 'fEyeColourOptions'}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have radio buttons', function () {
      var input = elm.find('input');
      expect(input.length).toBe(5);

      input = angular.element(elm.find('input')[4]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('3-f_eyeColour');
      expect(input.attr('value')).toBe('ha');
      expect(input.parent().text()).toMatch('ha');
    });

  });

  describe('generates radio buttons for passed enumerated lists', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.schema = [
        {name: 'name', id: '1', label: 'Name', type: 'text'},
        {'name': 'eyeColour', 'id': 'f_eyeColour', 'label': 'Eye Colour', 'type': 'radio', 'options': ['Blue', 'Brown', 'Green', 'Hazel']}
      ];
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have radio buttons', function () {
      var input = elm.find('input');
      expect(input.length).toBe(5);

      input = angular.element(elm.find('input')[4]);
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input.attr('id')).toBe('3-f_eyeColour');
      expect(input.attr('value')).toBe('Hazel');
    });

  });

  describe('supports radio buttons in sub schemas', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="schema"></form-input></div>');
      scope = $rootScope;
      scope.fResultOptions = ['Fail', 'Pass', 'Merit', 'Distinction'];
      scope.schema = [
        {'name': 'surname', 'type': 'text', 'add': 'autofocus ', 'id': 'f_surname', 'label': 'Surname'},
        {'name': 'forename', 'type': 'text', 'id': 'f_forename', 'label': 'Forename'},
        {'name': 'exams',
          'schema': [
            {'name': 'exams.subject', 'type': 'text', 'id': 'f_exams_subject', 'label': 'Subject'},
            {'type': 'radio', 'inlineRadio': true, 'name': 'exams.result', 'options': 'fResultOptions', 'id': 'f_exams_result', 'label': 'Result'}
          ], 'type': 'text', 'id': 'f_exams', 'label': 'Exams'
        }
        ];
      scope.record = {surname: 'Smith', forename: 'Alan', exams: [{subject: 'English', result: 'pass'}, {subject: 'Maths', result: 'fail'}]};
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('modifies name and model attributes', function () {
      var input = elm.find('input');
      expect(input.length).toBe(12);

      input = angular.element(elm.find('input')[11]);

      expect(input.attr('name')).toBe('1-exams-result');
      expect(input.attr('ng-model')).toBe('record.exams[$parent.$index].result');
    });

  });

  describe('displays error messages', function () {

    beforeEach(
      inject(function ($rootScope, $compile) {
        elm = angular.element(
            '<div ng-show="errorMessage" class="row-fluid">' +
            '<div class="span6 offset3 alert alert-error">' +
            '<button type="button" class="close" ng-click="dismissError()">&times;</button>' +
            '<h4>{{alertTitle}}</h4>' +
            '<span class="errMsg">{{errorMessage}}</span>' +
            '</div>' +
            '</div>' +
            '<div class="row-fluid">' +
            '<form-input ng-repeat="field in formSchema" info="{{field}}"></form-input>' +
            '</div>' +
            '</div>');
        scope = $rootScope;
        scope.schema = [
          {name: 'email', id: '1', label: 'Email', type: 'text', directive: 'email-field'}
        ];
        scope.errorMessage = 'Test error';
        scope.alertTitle = 'Error!';
        $compile(elm)(scope);
        scope.$digest();
      }));

    it('displays appropriately', function () {
      var h4 = elm.find('h4');
      expect(h4.text()).toBe('Error!');
      var alert = elm.find('span');
      expect(alert.text()).toBe('Test error');
    });
  });

  describe('supports bootstrap control sizing', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="formSchema"></form-input></div>');
      scope = $rootScope;
      scope.formSchema = {name: 'desc', id: 'desc_id', label: 'Description', size: 'small', type: 'text'};
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have input', function () {
      var input = elm.find('input');
      expect(input).toHaveClass('ng-pristine');
      expect(input).toHaveClass('ng-valid');
      expect(input).toHaveClass('input-sm');
      expect(input.attr('id')).toBe('desc_id');
      expect(input.attr('type')).toBe('text');
    });

  });

  describe('supports showWhen', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="formSchema"></form-input></div>');
      scope = $rootScope;
      scope.f_exams_resultOptions = ['fail','pass'];
      scope.formSchema = [
        {name: 'boolean', type: 'checkbox'},
        {name: 'desc', id: 'desc_id', label: 'Description', size: 'small', type: 'text', showWhen: {lhs: '$boolean', comp: 'eq', rhs: true}},
        {'formStyle': 'inline', 'name': 'exams', 'schema': [
          {showWhen: {lhs: '$boolean', comp: 'eq', rhs: true}, 'name': 'exams.subject', 'type': 'text', 'id': 'f_exams_subject', 'label': 'Subject'},
          {'name': 'exams.result', 'type': 'select', 'options': 'f_exams_resultOptions', 'id': 'f_exams_result', 'label': 'Result'},
          {
            'name': 'exams.retakeDate',
            'showWhen': {'lhs': '$exams.result', 'comp': 'eq', 'rhs': 'fail'},
            'type': 'text',
            'add': 'ui-date ui-date-format ',
            'id': 'f_exams_retakeDate',
            'label': 'Retake Date'
          }
        ]}
      ];
      scope.record = {boolean: true, name: 'any name', exams: [
        {subject: 'Maths'}
      ]};
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('on simple field', function () {
      var cg = angular.element(elm.find('div')[3]);
      expect(cg.attr('id')).toBe('cg_desc_id');
      expect(cg.attr('ng-show')).toBe('record.boolean===true');
    });

    it('on nested field', function () {
      var cg = angular.element(elm.find('div')[11]);
      expect(cg.attr('id')).toBe('cg_f_exams_subject');
      expect(cg.attr('ng-show')).toBe('record.boolean===true');
    });

    it('dependent on nested field', function () {
      var cg = angular.element(elm.find('div')[13]);
      expect(cg.attr('id')).toBe('cg_f_exams_retakeDate');
      expect(cg.attr('ng-show')).toBe('record.exams[$index].result===\'fail\'');
    });

  });

  describe('Issue 41', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input schema="formSchema"></form-input></div>');
      scope = $rootScope;
      scope.formSchema = [
        {
          'name': 'theThing',
          'type': 'text',
          'add': 'autofocus ',
          'id': 'f_theThing',
          'label': 'The Thing'
        },
        {
          'name': 'mentions',
          'schema': [
            {
              'name': 'mentions.someString',
              'type': 'text',
              'id': 'f_mentions_someString',
              'label': 'Some String'
            },
            {
              'name': 'mentions.grades.low',
              'type': 'number',
              'id': 'f_mentions_grades_low',
              'label': 'Low'
            },
            {
              'name': 'mentions.grades.high',
              'type': 'number',
              'id': 'f_mentions_grades_high',
              'label': 'High'
            }
          ],
          'type': 'text',
          'id': 'f_mentions',
          'label': 'Mentions'
        }
      ];
      scope.record = {theThing: 'a name', mentions: [ {someString: 'Maths', grades:{low:10, high:20}}, {someString: 'English', grades:{low:30, high:40}}] };
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should put the index in the correct place in the ng-model attribute', function () {
      var input = angular.element(elm.find('input')[1]);
      expect(input.attr('ng-model')).toBe('record.mentions[$index].someString');
      input = angular.element(elm.find('input')[2]);
      expect(input.attr('ng-model')).toBe('record.mentions[$index].grades.low');
    });

  });

  describe('Testing add all functionality, ', function () {

    describe('a text box', function () {

      beforeEach(inject(function ($rootScope, $compile) {
        elm = angular.element('<div><form-input schema="formSchema" add-all-field="bobby"></form-input></div>');
        scope = $rootScope;
        scope.formSchema = {
          name: 'desc',
          id: 'desc_id',
          label: 'Description',
          type: 'text'
        };
        $compile(elm)(scope);
        scope.$digest();
      }));

      it('should have an attribute of bobby', function () {
        var input = elm.find('input');
        expect(input.attr('bobby')).toBeDefined();
      });

      describe('a text box label', function () {

        beforeEach(inject(function ($rootScope, $compile) {
          elm = angular.element('<div><form-input schema="formSchema" add-all-label="bobby"></form-input></div>');
          scope = $rootScope;
          scope.formSchema = {
            name: 'desc',
            id: 'desc_id',
            label: 'Description',
            type: 'text'
          };
          $compile(elm)(scope);
          scope.$digest();
        }));

        it('should have an attribute of bobby', function () {
          var label = elm.find('label');
          expect(label.attr('bobby')).toBeDefined();

        });
      });

      describe('a control group', function () {
        beforeEach(inject(function ($rootScope, $compile) {
          elm = angular.element('<div><form-input schema="formSchema" add-all-group="bobby"></form-input></div>');
          scope = $rootScope;
          scope.formSchema = {
            name: 'desc',
            id: 'desc_id',
            label: 'Description',
            type: 'text'
          };
          $compile(elm)(scope);
          scope.$digest();
        }));

        it('should have an attribute of bobby', function () {
          var group = angular.element(elm.find('div')[0]);
          expect(group.attr('bobby')).toBeDefined();
        });
      });
    });
  });

  describe('arbitrary attributes get passed in', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input formStyle="horizontalCompact" schema="formSchema" test-me="A Test"></form-input></div>');
      scope = $rootScope;
      scope.formSchema = {name: 'desc', id: 'desc_id', label: 'Description', type: 'text'};
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should have the test-me attribute', function () {
      var form = elm.find('form');
      expect(form.attr('test-me')).toBe('A Test');
    });
  });

  describe('labels in inline forms (BS2)', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element('<div><form-input formStyle="inline" schema="formSchema"></form-input></div>');
      scope = $rootScope;
      scope.formSchema = {name: 'desc', id: 'descId', label: 'Description', type: 'text'};
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should not have a visible label', function () {
      var label = elm.find('label');
      expect(label.length).toBe(1);
      expect(label).toHaveClass('sr-only');
    });

  });

  describe('add arbitrary markup', function () {

    it('adds an attribute to a text input', function() {
      inject(function ($rootScope, $compile) {
        elm = angular.element('<div><form-input formStyle="inline" schema="formSchema"></form-input></div>');
        scope = $rootScope;
        scope.formSchema = {name: 'desc', id: 'descId', label: 'Description', type: 'text', add: 'thing'};
        $compile(elm)(scope);
        scope.$digest();
        var input = elm.find('input');
        expect(input.attr('thing')).toBe('');
        expect(input.attr('controlthing')).toBe(undefined);
      });
    });

    it('adds a class to text input without size using class', function() {
      inject(function ($rootScope, $compile) {
        elm = angular.element('<div><form-input formStyle="inline" schema="formSchema"></form-input></div>');
        scope = $rootScope;
        scope.formSchema = {name: 'desc', id: 'descId', label: 'Description', type: 'text',  class: 'some class'};
        $compile(elm)(scope);
        scope.$digest();
        var input = elm.find('input');
        expect(input).toHaveClass('some');
        expect(input).toHaveClass('class');
      });
    });

  });

});
