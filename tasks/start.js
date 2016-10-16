const childProcess = require('child_process');
const electron = require('electron');
const gulp = require('gulp');

gulp.task('start', ['build', 'watch'], () => {
  childProcess.spawn(electron, ['app'], {
    stdio: 'inherit',
  })
  .on('close', () => {
    process.exit();
  });
});
