// include gulp
var gulp = require('gulp');

//include react
var react = require('gulp-react');
var babel = require('gulp-babel');

var path = {
  ALL: ['src/scripts/*.js', 'src/scripts/**/*.js'],
  JS: ['src/scripts/*.js', 'src/scripts/**/*.js'],
  MINIFIED_OUT: 'build.min.js',
  DEST_SRC: 'dist/src',
  DEST_BUILD: 'dist/build',
  DEST: 'dist'
};

// include plug-ins
var concat = require('gulp-concat');

// JS concat, JSX transpile and minify
gulp.task('scripts', function() {
  return gulp.src(['./src/scripts/Ratscrew.js','./src/scripts/*.js'])
    .pipe(react())
    .pipe(babel({
      presets: ['react', 'es2015']
      }))
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./build/scripts/'));
});

// include plug-ins
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

// CSS concat, auto-prefix and minify
gulp.task('styles', function() {
  return gulp.src(['./src/styles/*.css'])
    .pipe(concat('styles.css'))
    .pipe(autoprefix('last 2 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/styles/'));
});

// default gulp task
gulp.task('default', ['scripts'], function() {
  // watch for JS changes
  gulp.watch('./src/scripts/*.js', ['scripts']);

  // watch for CSS changes
  gulp.watch('./src/styles/*.css', function() {
    gulp.run('styles');
  });
});