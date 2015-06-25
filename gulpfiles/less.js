module.exports = function (gulp, config) {

  var path = require('path'),
      less = require('gulp-less'),
      rename = require('gulp-rename'),
      plumber = require('gulp-plumber'),
      gutil = require('gulp-util');

  gulp.task('less', function () {
    gulp.src(path.join(config.path.src, '**/style.less'))
      .pipe(plumber()) // エラー時に停止させない。
      .pipe(less())
      .pipe(rename(function (path) {
        path.dirname +=  './../css';
      }))
      .pipe(gulp.dest(config.path.src))
      .on('error', gutil.log);
  });

  gulp.task('less-watch', function() {
    gulp.watch(path.join(config.path.src, '**/style.less'), ['less']);
  });
};
