var ScreenShotReporter = require('protractor-jasmine2-screenshot-reporter');
var path = require('path');

exports.config = {
  specs: [
    './bs3-1024x768.spec.js'
  ],
  capabilities: {
    browserName: 'firefox'
  },
  directConnect: true,
  baseUrl: 'http://0.0.0.0:9000',
  framework: 'jasmine2',

  onPrepare: function() {

    // Disable animations so e2e tests run more quickly
    var disableNgAnimate = function() {
      angular.module('disableNgAnimate', []).run(['$animate', function($animate) {
        $animate.enabled(false);
      }]);
    };

    browser.addMockModule('disableNgAnimate', disableNgAnimate);

    // Add a screenshot reporter and store screenshots
    jasmine.getEnv().addReporter(new ScreenShotReporter({
      dest:'test/screen_tests/screenshots/bs3-firefox-1024x768',
      pathBuilder: function(currentSpec, suites, browserCapabilities) {
        return currentSpec.description;
  }
    }));
  }

};
