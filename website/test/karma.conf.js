// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-06-21 using
// generator-karma 0.8.1
'use strict';

module.exports = function (config) {
  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
      'node_modules/angular-ui-date/dist/date.js',
      'node_modules/angular-sanitize/angular-sanitize.js',
      'node_modules/fng-bootstrap-date/fng-bootstrap-date.js',
      'node_modules/fng-bootstrap-datetime/fng-bootstrap-datetime.js',
      'node_modules/underscore/underscore.js',
      'node_modules/ng-infinite-scroll/build/ng-infinite-scroll.js',
      'node_modules/angular-elastic/elastic.js',
      'node_modules/forms-angular/dist/client/forms-angular.js',
      'node_modules/ui-select/dist/select.js',
      'node_modules/fng-ckeditor/index.js',
      'node_modules/fng-ui-select/src/fng-ui-select.js',
      'node_modules/jquery-ui/ui/widget.js',
      'node_modules/jquery-ui/ui/data.js',
      'node_modules/jquery-ui/ui/scroll-parent.js',
      'node_modules/jquery-ui/ui/widgets/mouse.js',
      'node_modules/jquery-ui/ui/widgets/sortable.js',
      'node_modules/jquery-ui/ui/widgets/datepicker.js',
      'node_modules/angular-ui-date/dist/date.js',
      'node_modules/angular-ui-grid/ui-grid.js',
      'node_modules/angular-ui-sortable/dist/sortable.js',
      'node_modules/jspdf/dist/jspdf.umd.js',
      'node_modules/fng-reports/dist/fng-reports.js',
      'node_modules/ng-ckeditor/ng-ckeditor.js',
      'node_modules/ckeditor/ckeditor.js',
      'node_modules/angular-css/angular-css.js',
      'node_modules/fng-colour-picker/fng-colour-picker.js',
      'node_modules/tinycolor2/dist/tinycolor-min.js',
      'node_modules/angularjs-color-picker/dist/angularjs-color-picker.min.js',
      'node_modules/blueimp-load-image/js/load-image.all.min.js',
      'node_modules/blueimp-file-upload/js/cors/jquery.postmessage-transport.js',
      'node_modules/blueimp-file-upload/js/cors/jquery.xdr-transport.js',
      'node_modules/blueimp-file-upload/js/vendor/jquery.ui.widget.js',
      'node_modules/blueimp-file-upload/js/jquery.fileupload.js',
      'node_modules/blueimp-file-upload/js/jquery.fileupload-process.js',
      'node_modules/blueimp-file-upload/js/jquery.fileupload-validate.js',
      'node_modules/blueimp-file-upload/js/jquery.fileupload-image.js',
      'node_modules/blueimp-file-upload/js/jquery.fileupload-audio.js',
      'node_modules/blueimp-file-upload/js/jquery.fileupload-video.js',
      'node_modules/blueimp-file-upload/js/jquery.fileupload-angular.js',
      'node_modules/blueimp-file-upload/js/jquery.iframe-transport.js',
      'node_modules/fng-jq-upload/dist/fng-jq-upload.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-messages/angular-messages.js',
      'node_modules/fng-audit/dist/client/fng-audit.js',
      'app/scripts/**/*.js',
      'app/scripts/template/*.html',
      'test/client/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

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

    browsers : ['Chrome'],
    // browsers : ['Firefox', 'ChromeHeadless'],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['progress', 'junit'],

    junitReporter:  {
      outputDir: 'test_out',
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
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
      'src/client/template/*.html': 'ng-html2js'
    }
  });
};
