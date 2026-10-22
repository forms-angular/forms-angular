'use strict';

describe('AddAllService', function () {

  beforeEach(module('formsAngular'));

  it('should collect options set on the scope and its ancestors', function () {
    inject(function ($rootScope, AddAllService) {
      var parent = $rootScope.$new();
      parent.addAllField = 'parentOpt';
      var child = parent.$new();
      var isolate = child.$new(true);
      isolate.addAllField = 'isolateOpt';
      var result = AddAllService.addAll(isolate, 'Field', 'extra', {});
      expect(result).toContain('isolateOpt');
      expect(result).toContain('parentOpt');
      expect(result).toContain('class="extra"');
    });
  });

  it('should return no options when none are set', function () {
    inject(function ($rootScope, AddAllService) {
      expect(AddAllService.addAll($rootScope.$new(), 'Label', undefined, {})).toEqual(' ');
    });
  });
});
