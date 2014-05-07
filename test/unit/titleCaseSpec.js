'use strict';

describe('titlecase', function () {

  beforeEach(module('formsAngular'));

  it('should put spaces before capitals', function () {
    inject(function ($filter) {
      expect($filter('titleCase')('HelloThere')).toBe('Hello There');
    });
  });

  it('should put not mess with something already in title case', function () {
    inject(function ($filter) {
      expect($filter('titleCase')('Hello There')).toBe('Hello There');
    });
  });

  it('should replace underscores with spaces', function () {
    inject(function ($filter) {
      expect($filter('titleCase')('hello_there')).toBe('Hello There');
    });
  });

});