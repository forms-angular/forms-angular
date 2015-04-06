var gulp = require('gulp');
var karma = require('gulp-karma');
var runSequence = require('run-sequence');

var browserSources = [
  'js/**/*.ts'
];
var testFiles = []; // Declared in the karma.conf.js
var distDirectory = 'dist';

/**
 * Main task: cleans, builds, run tests, and bundles up for distribution.
 */
gulp.task('all', function(callback) {
  runSequence(
    'clean',
    'build',
//    'test',
    callback);
});

gulp.task('build', function(callback) {
  runSequence(
    'compile',
    'uglify',
    'umdify',
    'map',
    'less',
    callback);
});

gulp.task('compile', function() {
  return buildHelper(browserSources, distDirectory , 'forms-angular.js');
});

gulp.task('clean', function() {
  var del = require('del');

  return del(distDirectory, function(err,paths) {console.log('Cleared ' + paths.join(' '));});
});

gulp.task('map', function() {
  var shell = require('gulp-shell');

  console.log('CWD: ' + process.cwd() + '/dist');

  return shell.task(
    'uglifyjs --compress --mangle --source-map forms-angular.min.js.map --source-map-root . -o forms-angular.min.js -- forms-angular.js',
    {cwd: process.cwd() + '/dist'}
  )();
});

gulp.task('test', function() {
  // Be sure to return the stream
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'config/karma.conf.js',
      action: 'run'
    }))
    .on('error', function(error) {
      // Make sure failed tests cause gulp to exit non-zero
      throw error;
    });
});

gulp.task('midway', function() {
  // Be sure to return the stream
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'config/karma.midway.conf.js',
      action: 'run'
    }))
    .on('error', function(error) {
      // Make sure failed tests cause gulp to exit non-zero
      throw error;
    });
});

//gulp.task('test:watch', function() {
//  return gulp.src(testFiles)
//    .pipe(karma({
//      configFile: 'karma.conf.js',
//      action: 'watch'
//    }));
//});
//
gulp.task('uglify', function() {
  var fs = require('fs');
  var uglifyJs = require('uglify-js2');

  var code = fs.readFileSync('dist/forms-angular.js', 'utf8');

  var parsed = uglifyJs.parse(code);
  parsed.figure_out_scope();

  var compressed = parsed.transform(uglifyJs.Compressor());
  compressed.figure_out_scope();
  compressed.compute_char_frequency();
  compressed.mangle_names();

  var finalCode = compressed.print_to_string();

  fs.writeFileSync('dist/forms-angular.min.js', finalCode);
});

gulp.task('umdify', function() {
  umdHelper('dist/forms-angular.js', 'dist');
  umdHelper('dist/forms-angular.min.js', 'dist');
});

var buildHelper = function(browserSources, directory, outputFile) {
  var typeScriptCompiler = require('gulp-tsc');

  return gulp
    .src(browserSources)
    .pipe(typeScriptCompiler({
      module: 'CommonJS',
      declaration: true, // Generate *.d.ts declarations file as well
      emitError: false,
      out: outputFile,
      target: 'ES5'
    }))
    .pipe(gulp.dest(directory));
};

var umdHelper = function(browserSources, directory) {
  var umd = require('gulp-umd');

  return gulp
    .src(browserSources)
    .pipe(umd({
      exports: function(file) {
        return 'fng';
      },
      namespace: function(file) {
        return 'fng';
      }
    }))
    .pipe(gulp.dest(directory));
};

gulp.task('less', function () {
  var less = require('gulp-less');
  var minifyCSS = require('gulp-minify-css');
  var path = require('path');

  return gulp.src('less/forms-angular-with-*.less')
    .pipe(less({}))
    .pipe(minifyCSS())
    .pipe(gulp.dest(distDirectory));
});
