module.exports = function(config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
        files: [
          "node_modules/angular/angular.js",
          "node_modules/angular-sanitize/angular-sanitize.js",
          "node_modules/lodash/lodash.js",
          "node_modules/ng-infinite-scroll/build/ng-infinite-scroll.js",
          'node_modules/angular-mocks/angular-mocks.js',
          'node_modules/angular-messages/angular-messages.js',
          'node_modules/angular-elastic/elastic.js',
          'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
          'dist/client/forms-angular.js',
          'src/client/template/*.html',
          'test/example-directives/*.js',
          'test/helpers/karma-helpers.js',
          'test/template/*.html',
          'test/midway/**/*.js'
        ],

        client: {
          captureConsole: true
        },
        autoWatch : true,
        usePolling: true,

        customLaunchers: {
          ChromeHeadless: {
            base: 'Chrome',
            flags: [
              '--headless',
              '--disable-gpu',
              // Without a remote debugging port, Google Chrome exits immediately.
              '--remote-debugging-port=9222'
            ]
          }
        },

        browsers : ['ChromeHeadless'],
        // browsers : ['Firefox', 'ChromeHeadless'],

        // use dots reporter, as travis terminal does not support escaping sequences
        // possible values: 'dots', 'progress'
        // CLI --reporters progress
        reporters: ['progress', 'junit'],

        junitReporter:  {
            outputFile: 'test_out/unit.xml',
            suite: 'midway'
        },
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-ng-html2js-preprocessor',
            'karma-junit-reporter'
        ],
        ngHtml2JsPreprocessor: {
            // strip this from the file path
            stripPrefix: 'src/client/'
        },
        preprocessors: {
            'src/client/template/*.html': 'ng-html2js',
            'test/template/*.html': 'ng-html2js'
        }
    });
};

