basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
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
    'app/bower_components/angular-elastic/elastic.js',
    'app/js/forms-angular.js',
    'app/js/**/*.js',
    'app/demo/demo.js',
    'app/demo/directives/bespoke-field.js',
    'test/unit/**/*.js'
];

autoWatch = true;

browsers = ['PhantomJS'];

junitReporter = {
    outputFile: 'test_out/unit.xml',
    suite: 'unit'
};
