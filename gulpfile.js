'use strict';

var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var Server = require('karma').Server;
var parseConfig = require('karma').config.parseConfig;
var typeScriptCompiler = require('gulp-typescript');
var uglify = require('gulp-uglify');
var replace  =  require('gulp-replace');
var pump = require('pump');

var browserSources = [
  'src/client/js/controller/*.ts',
  'src/client/js/directives/*.ts',
  'src/client/js/filters/*.ts',
  'src/client/js/services/*.ts',
  'src/client/js/*.ts'
];
var testFiles = []; // Declared in the karma.conf.js
var rootDir = process.cwd();
var distDirectory = 'dist';

gulp.task('watch', function(){
  gulp.watch(['js/**/*.ts', 'server/data_form.ts'], ['build']);
});


gulp.task('compileClientSide', function() {
  return gulp
    .src(browserSources)
    .pipe(typeScriptCompiler({
      module: 'amd',
      lib: [
        "ES5",
        "ES2015",
        "DOM"
      ],
      out: 'forms-angular.js',
      target: 'ES5'
    }))
    .pipe(gulp.dest(distDirectory + '/client'));
});

gulp.task('compileServerSide', function() {
  return gulp
    .src('src/server/*.ts')
    .pipe(typeScriptCompiler({
      target: 'ES5'
    }))
    .pipe(gulp.dest(distDirectory + '/server'));
});

gulp.task('clean', function() {
  return del(distDirectory, function(err,paths) {console.log('Cleared ' + paths.join(' '));});
});

gulp.task('cleanMin', function() {
  return del(distDirectory + '/client/min', function(err,paths) {console.log('Cleared ' + paths.join(' '));});
});

gulp.task('annotate', function() {
  var ngAnnotate = require('gulp-ng-annotate');

  return gulp.src(distDirectory + '/client/forms-angular.js')
    .pipe(ngAnnotate())
    .pipe(gulp.dest(distDirectory + '/client'));
});

gulp.task('concatTemplates', function() {

  var concat = require('gulp-concat');

  return gulp.src(distDirectory + '/client/*.js')
    .pipe(concat('forms-angular.js'))
    .pipe(gulp.dest('./dist/client'));
});

gulp.task('tidy', function() {
  return del([distDirectory + '/client/templates.js'], function(err,paths) {console.log('Cleared ' + paths.join(' '));});
});

gulp.task('karmaTest', function(done) {
    parseConfig(
        rootDir + '/test/karma.conf.js',
        {singleRun: true},
        {promiseConfig: true, throwErrors: true}
    ).then(function (config) {
         var server = new Server(config, done);
         server.start();
        });
});

gulp.task('midwayTest', function(done) {
    parseConfig(
        rootDir + '/test/karma.midway.conf.js',
        {singleRun: true},
        {promiseConfig: true, throwErrors: true}
    ).then(function (config) {
        var server = new Server(config, done);
        server.start();
    });
});

gulp.task('apiTest', function () {
  return gulp.src('test/api/API-Spec.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(require('gulp-mocha')({reporter: 'dot', 'forbid-only': true}));
});

gulp.task('saveDebug', function () {
  return gulp.src(distDirectory + '/client/min/forms-angular.js')
    .pipe(rename('forms-angular.min.js'))
    .pipe(gulp.dest(distDirectory + '/client'));
});

gulp.task('uglify', function(cb) {
  return pump([
      gulp.src(distDirectory + '/client/forms-angular.js'),
      uglify(),
      gulp.dest(distDirectory + '/client/min')
    ],
    cb
  );
});

gulp.task('copyTypes', function () {
  var files = [
      './src/client/index.d.ts',
      './src/server/index.d.ts'
  ]
  return gulp.src(files, {base: './src/'})
    .pipe(gulp.dest(distDirectory));
});

gulp.task('copyLess', function () {
  return gulp.src(['./src/client/less/*.less'])
    .pipe(gulp.dest(distDirectory + '/client'));
});

gulp.task('copyJs', function () {
  return gulp.src([distDirectory + '/server/*.js'])
    .pipe(gulp.dest('./src/server'));
});

gulp.task('templates', function() {
  var templateCache = require('gulp-angular-templatecache');

  return gulp
    .src('src/client/template/**/*.html')
    .pipe(templateCache({standalone: false, module: 'formsAngular'}))
    .pipe(replace(/templateCache.put\('\//g, "templateCache.put('"))
    .pipe(gulp.dest(distDirectory + '/client'));
});

gulp.task('less', function () {
  var less = require('gulp-less');
  var minifyCSS = require('gulp-clean-css');
  var path = require('path');

  return gulp.src('src/client/less/forms-angular-with-*.less')
    .pipe(less({}))
    .pipe(minifyCSS())
    .pipe(gulp.dest(distDirectory + '/client'));
});

/**
 * Main task: cleans, builds, run tests, and bundles up for distribution.
 */
gulp.task('compile', gulp.series(
  'compileServerSide',
  'compileClientSide',
  function(done) {done();})
);

gulp.task('test', gulp.series(
    'karmaTest',
    'midwayTest',
    'apiTest',
    function(done) {done();})
);

gulp.task('build', gulp.series(
    'clean',
    'compile',
    'templates',
    'concatTemplates',
    'annotate',
    'tidy',
    'uglify',
    'saveDebug',
    'copyTypes',
    'copyLess',
    'copyJs',
    'cleanMin',
    'less',
  function(done) {done();})
);

gulp.task('debugBuild', gulp.series(
    'compile',
    'templates',
    'concatTemplates',
    'annotate',
    'tidy',
    'less',
  function(done) {done();})
);

gulp.task('all', gulp.series(
  'build',
  'test',
  function(done) {done();})
);

gulp.task('default', gulp.series(
  'clean',
  'build',
  'test',
  function(done) {done();})
);

gulp.task('allServer', gulp.series(
  'clean',
  'compileServerSide',
  'apiTest',
  function(done) {done();})
);
