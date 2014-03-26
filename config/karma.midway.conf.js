module.exports = function(config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
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
            "app/bower_components/ngInfiniteScroll/ng-infinite-scroll.js",
            "app/bower_components/ng-grid/build/ng-grid.js",
            "app/bower_components/select2/select2.js",
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/jspdf/dist/jspdf.source.js',
            'app/bower_components/angular-elastic/elastic.js',
            'app/bower_components/ckeditor/ckeditor.js',
            'app/js/forms-angular.js',
            'app/js/**/*.js',
            'app/demo/demo.js',
            'app/demo/**/*.js',
            'app/demo/template/*.html',
            'test/midway/**/*.js'
        ],

        autoWatch : true,

        browsers : ['PhantomJS'],

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
            'app/demo/template/*.html': 'ng-html2js'
        }
    });
};

