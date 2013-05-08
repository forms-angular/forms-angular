basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'app/lib/jquery/jquery-*.js',
  'app/lib/angular/angular.js',
  'app/lib/angular/angular-*.js',
  'app/lib/underscore.js',
  'test/lib/angular/angular-mocks.js',
  'app/lib/angular-ui/angular-ui-0.4.0/build/**/*.js',
  'app/js/app.js',
  'app/js/**/*.js',
  'test/unit/**/*.js'
];

autoWatch = true;

browsers = ['PhantomJS'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
