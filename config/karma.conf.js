module.exports = function(config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
        files: [
            "bower_components/angular/angular.js",
            "bower_components/angular-sanitize/angular-sanitize.js",
            "bower_components/angular-route/angular-route.js",
            "bower_components/underscore/underscore.js",
            "bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js",
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-elastic/elastic.js',
            'bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
            'js/forms-angular.js',
            'js/**/*.js',
            'template/*.html',
            'test/example-directives/*.js',
            'test/helpers/**/*.js',
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
            'karma-phantomjs-launcher',
            'karma-ng-html2js-preprocessor',
            'karma-junit-reporter'
        ],
        ngHtml2JsPreprocessor: {
            // strip this from the file path
            stripPrefix: ''
        },
        preprocessors: {
            'template/*.html': 'ng-html2js'
        }
    });
};