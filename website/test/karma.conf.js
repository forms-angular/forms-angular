// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-06-21 using
// generator-karma 0.8.1

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
      'app/bower_components/jquery/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'app/bower_components/angular-elastic/elastic.js',
      'app/bower_components/forms-angular/dist/forms-angular.js',
      'app/bower_components/angular-ui-select/dist/select.js',
      'app/bower_components/fng-ui-select/src/fng-ui-select.js',
      'app/bower_components/jquery-ui/jquery-ui.js',
      'app/bower_components/angular-ui-date/src/date.js',
      'app/bower_components/angular-ui-grid/ui-grid.js',
      'app/bower_components/jspdf/dist/jspdf.min.js',
      'app/bower_components/fng-reports/dist/fng-reports.js',
      'app/bower_components/ng-ckeditor/ng-ckeditor.js',
      'app/bower_components/ckeditor/ckeditor.js',
      'app/bower_components/angular-css/angular-css.js',
      'app/bower_components/blueimp-tmpl/js/tmpl.js',
      'app/bower_components/blueimp-load-image/js/load-image.js',
      'app/bower_components/blueimp-load-image/js/load-image-ios.js',
      'app/bower_components/blueimp-load-image/js/load-image-orientation.js',
      'app/bower_components/blueimp-load-image/js/load-image-meta.js',
      'app/bower_components/blueimp-load-image/js/load-image-exif.js',
      'app/bower_components/blueimp-load-image/js/load-image-exif-map.js',
      'app/bower_components/blueimp-canvas-to-blob/js/canvas-to-blob.js',
      'app/bower_components/blueimp-file-upload/js/cors/jquery.postmessage-transport.js',
      'app/bower_components/blueimp-file-upload/js/cors/jquery.xdr-transport.js',
      'app/bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-process.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-validate.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-image.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-audio.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-video.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-ui.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-jquery-ui.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-angular.js',
      'app/bower_components/blueimp-file-upload/js/jquery.iframe-transport.js',
      'app/bower_components/blueimp-gallery/js/blueimp-helper.js',
      'app/bower_components/blueimp-gallery/js/blueimp-gallery.js',
      'app/bower_components/blueimp-gallery/js/blueimp-gallery-fullscreen.js',
      'app/bower_components/blueimp-gallery/js/blueimp-gallery-indicator.js',
      'app/bower_components/blueimp-gallery/js/blueimp-gallery-video.js',
      'app/bower_components/blueimp-gallery/js/blueimp-gallery-vimeo.js',
      'app/bower_components/blueimp-gallery/js/blueimp-gallery-youtube.js',
      'app/bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-process.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-validate.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-image.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-audio.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-video.js',
      'app/bower_components/blueimp-file-upload/js/jquery.fileupload-angular.js',
      'app/bower_components/blueimp-file-upload/js/jquery.iframe-transport.js',
      'app/bower_components/fng-jq-upload/dist/fng-jq-upload.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-messages/angular-messages.js',
      'app/scripts/**/*.js',
      'app/scripts/template/*.html',
      'test/client/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-ng-html2js-preprocessor',
      'karma-jasmine'
    ],

    preprocessors: {
      'app/scripts/template/*.html': 'ng-html2js'
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
