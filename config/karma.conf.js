module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            "app/bower_components/jquery/jquery.js",
            "app/bower_components/jquery-ui/ui/jquery-ui.js",
            "app/bower_components/angular/angular.js",
            "app/bower_components/angular-sanitize/angular-sanitize.js",
            "app/bower_components/angular-route/angular-route.js",
            "app/bower_components/underscore/underscore.js",
            "app/bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js",
            "app/bower_components/angular-ui-date/src/date.js",
            "app/bower_components/angular-ui-select2/src/select2.js",
            "app/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js",
            "app/bower_components/ng-grid/build/ng-grid.js",
            "app/bower_components/select2/select2.js",
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-elastic/elastic.js',
            'app/bower_components/jspdf/dist/jspdf.debug.js',
            'app/bower_components/ng-ckeditor/libs/ckeditor/ckeditor.js',
            'app/bower_components/ng-ckeditor/ng-ckeditor.js',
            'app/js/forms-angular.js',
            'app/js/**/*.js',
            'app/demo/demo.js',
            'app/demo/directives/bespoke-field.js',
            'test/unit/**/*.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        //preprocessors: %PREPROCESSORS%

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch : true,

        browsers : ['PhantomJS'],

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter

        // use dots reporter, as travis terminal does not support escaping sequences
        // possible values: 'dots', 'progress'
        // CLI --reporters progress
        reporters: ['progress', 'junit'],


        junitReporter:  {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        },
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-firefox-launcher',
            'karma-junit-reporter'
        ]
    });
};