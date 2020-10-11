var ScreenShotReporter = require('protractor-jasmine2-screenshot-reporter');
var path = require('path');

exports.config = {
  specs: [
    './find_functions.spec.js',
    './selects.spec.js'
  ],
  capabilities: {
    browserName: 'chrome'
  },
  directConnect: true,//  broken with firefox 38 - see https://github.com/angular/protractor/issues/2134
  baseUrl: 'http://localhost:9000',
  framework: 'jasmine2',

  onPrepare: function() {

    // Disable animations so e2e tests run more quickly
    var disableNgAnimate = function() {
      angular.module('disableNgAnimate', []).run(['$animate', function($animate) {
        $animate.enabled(false);
      }]);
    };

    browser.addMockModule('disableNgAnimate', disableNgAnimate);

    // Add a screenshot reporter and take screenshots of failed tests
    jasmine.getEnv().addReporter(new ScreenShotReporter({
      dest:'failed_tests/screenshots',
      captureOnlyFailedSpecs: true,
      pathBuilder: function(currentSpec, suites, browserCapabilities) {
        return currentSpec.fullName;
      }
    }));
  }

};
