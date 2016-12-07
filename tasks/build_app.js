const gulp = require('gulp');
const less = require('gulp-less');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');
const jetpack = require('fs-jetpack');
const bundle = require('./bundle');
const utils = require('./utils');

const srcDir = jetpack.cwd('./src');
const destDir = jetpack.cwd('./app');

gulp.task('bundle', () => {
  gulp.src('./transpile/**/*').pipe(gulp.dest('./app/transpile'));
  Promise.all([
    bundle(srcDir.path('index.js'), destDir.path('index.js')),
  ]);
});

gulp.task('less', () =>
  gulp.src(srcDir.path('stylesheets/main.less'))
    .pipe(plumber())
    .pipe(less())
    .pipe(gulp.dest(destDir.path('stylesheets')))
);

gulp.task('watch', () => {
  const beepOnError = done =>
    (err) => {
      if (err) {
        utils.beepSound();
      }
      done(err);
    };

  watch('src/**/*.js', batch((events, done) => {
    gulp.start('bundle', beepOnError(done));
  }));
  watch('src/**/*.less', batch((events, done) => {
    gulp.start('less', beepOnError(done));
  }));
});

gulp.task('build', ['bundle', 'less']);
