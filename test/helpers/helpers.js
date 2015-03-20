'use strict';

beforeEach(function () {
  jasmine.addMatchers({
    //toHaveClass: function (cls) {
    //  this.message = function () {
    //    return 'Expected "' + angular.mock.dump(this.actual) + '" to have class "' + cls + '".';
    //  };
    //
    //  return this.actual.hasClass(cls);
    //},
    toHaveClass: function() {
      return {
        compare: function(actual, expected) {
          var passed = actual.hasClass(expected);
          return {
            pass: passed,
            message: 'Expected "' + angular.mock.dump(actual) + '" to have class "' + expected + '".'
          };
        }
      };
    },

    //toHaveClassCount: function (cls, count) {
    //  this.message = function () {
    //    return 'Expected "' + angular.mock.dump(this.actual) + '" to have ' + count + ' instances of class "' + cls + '".';
    //  };
    //
    //  for (var i = 0, classCount = 0; i < this.actual.length; i++) {
    //    var elm = angular.element(this.actual[i]);
    //    if (elm.hasClass(cls)) { classCount += 1; }
    //  }
    //
    //  return (classCount === count);
    //},
    toHaveClassCount: function() {
      return {
        compare: function(actual, cls, expected) {
          for (var i = 0, classCount = 0; i < actual.length; i++) {
            var elm = angular.element(actual[i]);
            if (elm.hasClass(cls)) { classCount += 1; }
          }
          var passed = (classCount === expected);

          return {
            pass: passed,
            message: 'Expected "' + angular.mock.dump(actual) + '" to have ' + expected + ' instances of class "' + cls + '".'
          };
        }
      };
    },

    //toHaveTypeCount: function (type, count) {
    //  this.message = function () {
    //    return 'Expected "' + angular.mock.dump(this.actual) + '" to have ' + count + ' instances of type "' + type + '".';
    //  };
    //
    //  for (var i = 0, typeCount = 0; i < this.actual.length; i++) {
    //    var elm = angular.element(this.actual[i]);
    //    if (elm.attr('type') === type) { typeCount += 1; }
    //  }
    //
    //  return (typeCount === count);
    //},
    toHaveTypeCount: function() {
      return {
        compare: function(actual, type, expected) {
          for (var i = 0, typeCount = 0; i < actual.length; i++) {
            var elm = angular.element(actual[i]);
            if (elm.attr('type') === type) { typeCount += 1; }
          }

          var passed = (typeCount === expected);

          return {
            pass: passed,
            message: 'Expected "' + angular.mock.dump(actual) + '" to have ' + expected + ' instances of type "' + type + '".'
          };
        }
      };
    },

    //toHaveNameCount: function (name, count) {
    //  this.message = function () {
    //    return 'Expected "' + angular.mock.dump(this.actual) + '" to have ' + count + ' instances of name "' + name + '".';
    //  };
    //
    //  for (var i = 0, nameCount = 0; i < this.actual.length; i++) {
    //    var elm = angular.element(this.actual[i]);
    //    if (elm.attr('name') === name) { nameCount += 1; }
    //  }
    //
    //  return (nameCount === count);
    //}
    toHaveNameCount: function() {
      return {
        compare: function(actual, name, expected) {
          for (var i = 0, nameCount = 0; i < actual.length; i++) {
            var elm = angular.element(actual[i]);
            if (elm.attr('name') === name) { nameCount += 1; }
          }

          var passed = (nameCount === expected);

          return {
            pass: passed,
            message: 'Expected "' + angular.mock.dump(actual) + '" to have ' + expected + ' instances of name "' + name + '".'
          };
        }
      };
    }

  });
});
