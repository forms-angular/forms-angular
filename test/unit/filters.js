'use strict';

describe('filter', function () {

  beforeEach(angular.mock.module('formsAngular'));

  describe('title case', function () {

    it('should convert models with underscores appropriately',
      inject(function ($filter) {
          expect($filter('titleCase')('b_using_options', false)).toBe('B Using Options');
          expect($filter('titleCase')('b_using_options', true)).toBe('BUsingOptions');
        }
      )
    );
  });
});