var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var Server = require('karma').Server;
var typeScriptCompiler = require('gulp-tsc');
var uglify = require('gulp-uglify');
var pump = require('pump');

var browserSources = [
  'js/**/*.ts'
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
      declaration: true, // Generate *.d.ts declarations file as well
      emitError: false,
      out: 'forms-angular.js',
      target: 'ES5'
    }))
    .pipe(gulp.dest(distDirectory));
});

gulp.task('compileServerSide', function() {
  return gulp
    .src('server/*.ts')
    .pipe(typeScriptCompiler({
      target: 'ES5'
    }))
    .pipe(gulp.dest('./server'));
});

gulp.task('clean', function() {
  return del(distDirectory, function(err,paths) {console.log('Cleared ' + paths.join(' '));});
});

gulp.task('annotate', function() {
  var ngAnnotate = require('gulp-ng-annotate');

  return gulp.src(distDirectory + '/forms-angular.js')
    .pipe(ngAnnotate())
    .pipe(gulp.dest(distDirectory));
});

gulp.task('concatTemplates', function() {

  var concat = require('gulp-concat');

  return gulp.src(distDirectory + '/*.js')
    .pipe(concat('forms-angular.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('tidy', function() {
  return del([distDirectory + '/templates.js'], function(err,paths) {console.log('Cleared ' + paths.join(' '));});
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
    configFile: rootDir + '/config/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('midwayTest', function(done) {
  new Server({
    configFile: rootDir + '/config/karma.midway.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('apiTest', function () {
  return gulp.src('test/api/**/*Spec.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(require('gulp-mocha')({reporter: 'dot'}));
});

//gulp.task('test:watch', function() {
//  return gulp.src(testFiles)
//    .pipe(karma({
//      configFile: 'karma.conf.js',
//      action: 'watch'
//    }));
//});
//

gulp.task('uglify', function(cb) {
  pump([
      gulp.src('dist/forms-angular.js'),
      uglify(),
      gulp.dest('dist')
    ],
    cb
  );
  // var fs = require('fs');
  // var uglifyJs = require('uglify-js');
  //
  // var code = fs.readFileSync('dist/forms-angular.js', 'utf8');
  //
  // var parsed = uglifyJs.parse(code);
  // parsed.figure_out_scope();
  //
  // var compressed = parsed.transform(uglifyJs.Compressor());
  // compressed.figure_out_scope();
  // compressed.compute_char_frequency();
  // compressed.mangle_names();
  //
  // var finalCode = compressed.print_to_string();
  //
  // fs.writeFileSync('dist/forms-angular.min.js', finalCode);
});


gulp.task('templates', function() {
  var templateCache = require('gulp-angular-templatecache');

  return gulp
    .src('template/**/*.html')
    .pipe(templateCache({standalone: false, module: 'formsAngular'}))
    .pipe(gulp.dest(distDirectory));
});

//var umdHelper = function(browserSources, directory) {
//  var umd = require('gulp-umd');
//
//  return gulp
//    .src(browserSources)
//    .pipe(umd({
//      exports: function(file) {
//        return 'formsAngular';
//      },
//      namespace: function(file) {
//        return 'formsAngular';
//      }
//    }))
//    .pipe(gulp.dest(directory));
//};

gulp.task('less', function () {
  var less = require('gulp-less');
  var minifyCSS = require('gulp-clean-css');
  var path = require('path');

  return gulp.src('less/forms-angular-with-*.less')
    .pipe(less({}))
    .pipe(minifyCSS())
    .pipe(gulp.dest(distDirectory));
});
