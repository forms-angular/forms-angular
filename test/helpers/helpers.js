'use strict';

beforeEach(function () {
  this.addMatchers({
    toHaveClass: function (cls) {
      this.message = function () {
        return 'Expected "' + angular.mock.dump(this.actual) + '" to have class "' + cls + '".';
      };

      return this.actual.hasClass(cls);
    },
    toHaveClassCount: function (cls, count) {
      this.message = function () {
        return 'Expected "' + angular.mock.dump(this.actual) + '" to have ' + count + ' instances of class "' + cls + '".';
      };

      for (var i = 0, classCount = 0; i < this.actual.length; i++) {
        var elm = angular.element(this.actual[i]);
        if (elm.hasClass(cls)) { classCount += 1; }
      }

      return (classCount === count);
    },
    toHaveTypeCount: function (type, count) {
      this.message = function () {
        return 'Expected "' + angular.mock.dump(this.actual) + '" to have ' + count + ' instances of type "' + type + '".';
      };

      for (var i = 0, typeCount = 0; i < this.actual.length; i++) {
        var elm = angular.element(this.actual[i]);
        if (elm.attr('type') === type) { typeCount += 1; }
      }

      return (typeCount === count);
    },
    toHaveNameCount: function (name, count) {
      this.message = function () {
        return 'Expected "' + angular.mock.dump(this.actual) + '" to have ' + count + ' instances of name "' + name + '".';
      };

      for (var i = 0, nameCount = 0; i < this.actual.length; i++) {
        var elm = angular.element(this.actual[i]);
        if (elm.attr('name') === name) { nameCount += 1; }
      }

      return (nameCount === count);
    }

  });
});
