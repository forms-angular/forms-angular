'use strict';

describe('Location parsing', function () {

  beforeEach(angular.mock.module('formsAngular'));

  describe('$locationParse', function () {
    it('should parse model/id/edit', inject(function ($locationParse) {
      var parsedObject = $locationParse('/b_using_options/5194c43185810b1e947cd8c2/edit');
      expect(parsedObject.modelName).toBe('b_using_options');
      expect(parsedObject.id).toBe('5194c43185810b1e947cd8c2');
      expect(parsedObject.newRecord).toBe(false);
      expect(parsedObject.formName).toBe(undefined);
    }));

    it('should parse model/new', inject(function ($locationParse) {
      var parsedObject = $locationParse('/mymodel/new');
      expect(parsedObject.modelName).toBe('mymodel');
      expect(parsedObject.id).toBe(undefined);
      expect(parsedObject.newRecord).toBe(true);
      expect(parsedObject.formName).toBe(undefined);
    }));

    it('should parse model', inject(function ($locationParse) {
      var parsedObject = $locationParse('/mymodel');
      expect(parsedObject.modelName).toBe('mymodel');
      expect(parsedObject.id).toBe(undefined);
      expect(parsedObject.newRecord).toBe(false);
      expect(parsedObject.formName).toBe(undefined);
    }));

    it('should parse model/form/id/edit', inject(function ($locationParse) {
      var parsedObject = $locationParse('/b_using_options/myform/5194c43185810b1e947cd8c2/edit');
      expect(parsedObject.modelName).toBe('b_using_options');
      expect(parsedObject.id).toBe('5194c43185810b1e947cd8c2');
      expect(parsedObject.newRecord).toBe(false);
      expect(parsedObject.formName).toBe('myform');
    }));

    it('should parse model/form/new', inject(function ($locationParse) {
      var parsedObject = $locationParse('/mymodel/myform/new');
      expect(parsedObject.modelName).toBe('mymodel');
      expect(parsedObject.id).toBe(undefined);
      expect(parsedObject.newRecord).toBe(true);
      expect(parsedObject.formName).toBe('myform');
    }));

    it('should parse model/form', inject(function ($locationParse) {
      var parsedObject = $locationParse('/mymodel/myform');
      expect(parsedObject.modelName).toBe('mymodel');
      expect(parsedObject.id).toBe(undefined);
      expect(parsedObject.newRecord).toBe(false);
      expect(parsedObject.formName).toBe('myform');
    }));

  });

});
