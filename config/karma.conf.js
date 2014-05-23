module.exports = function(config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
        files: [
            "app/bower_components/jquery/dist/jquery.js",
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
            'app/bower_components/angular-jqfile-upload/dist/uploader.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.js',
            'app/js/forms-angular.js',
            'app/js/**/*.js',
            'app/demo/demo.js',
            'app/template/*.html',
            'app/demo/directives/bespoke-field.js',
            'test/unit/**/*.js'
        ],

        autoWatch : true,
        usePolling: true,

        browsers : ['PhantomJS'],

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
            'karma-ng-html2js-preprocessor',
            'karma-firefox-launcher',
            'karma-junit-reporter'
        ],
        ngHtml2JsPreprocessor: {
            // strip this from the file path
            stripPrefix: 'app/'
        },
        preprocessors: {
            'app/template/*.html': 'ng-html2js'
        }
    });
};