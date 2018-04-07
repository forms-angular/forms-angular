var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var rename = require('gulp-rename');
var Server = require('karma').Server;
var typeScriptCompiler = require('gulp-tsc');
var uglify = require('gulp-uglify');
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

/**
 * Main task: cleans, builds, run tests, and bundles up for distribution.
 */
gulp.task('all', function(callback) {
  runSequence(
    'clean',
    'build',
    'test',
    callback);
});

gulp.task('default', function(callback) {
  runSequence(
    'clean',
    'build',
    'test',
    callback);
});

gulp.task('allServer', function(callback) {
  runSequence(
    'clean',
    'compileServerSide',
    'apiTest',
    callback);
});

gulp.task('build', function(callback) {
  runSequence(
    'compile',
    'templates',
    'concatTemplates',
    'annotate',
    'tidy',
    'uglify',
    'saveDebug',
    'copyTypes',
    'copyLess',
    'cleanMin',
    'less',
    callback);
});

gulp.task('debugBuild', function(callback) {
  runSequence(
    'compile',
    'templates',
    'concatTemplates',
    'annotate',
    'tidy',
    'less',
    callback);
});

gulp.task('compile', function(callback) {
  runSequence(
    'compileServerSide',
    'compileClientSide',
    callback);
});

gulp.task('compileClientSide', function() {
  return gulp
    .src(browserSources)
    .pipe(typeScriptCompiler({
      module: 'amd',
      emitError: false,
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

gulp.task('test', function(callback) {
  runSequence(
    'karmaTest',
    'midwayTest',
    'apiTest',
    callback);
});

gulp.task('karmaTest', function(done) {
  new Server({
    configFile: rootDir + '/test/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('midwayTest', function(done) {
  new Server({
    configFile: rootDir + '/test/karma.midway.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('apiTest', function () {
  return gulp.src('test/api/**/*Spec.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(require('gulp-mocha')({reporter: 'dot'}));
});

gulp.task('saveDebug', function () {
  gulp.src(distDirectory + '/client/min/forms-angular.js')
    .pipe(rename('forms-angular.min.js'))
    .pipe(gulp.dest(distDirectory + '/client'));
});

gulp.task('uglify', function(cb) {
  pump([
      gulp.src(distDirectory + '/client/forms-angular.js'),
      uglify(),
      gulp.dest(distDirectory + '/client/min')
    ],
    cb
  );
});

gulp.task('copyTypes', function () {
  gulp.src('./src/client/js/fng-types.d.ts')
    .pipe(rename('index.d.ts'))
    .pipe(gulp.dest(distDirectory + '/client'));
});

gulp.task('copyLess', function () {
  gulp.src('./src/client/less/*.less')
    .pipe(gulp.dest(distDirectory + '/client'));
});

gulp.task('templates', function() {
  var templateCache = require('gulp-angular-templatecache');

  return gulp
    .src('src/client/template/**/*.html')
    .pipe(templateCache({standalone: false, module: 'formsAngular'}))
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
