module.exports = function (gulp, config) {

  var path = require('path'),
      filter = require('gulp-filter'),
      htmlhint = require("gulp-htmlhint"),
      csslint = require('gulp-csslint'),
      jshint = require('gulp-jshint');

  /** filters pattern */
  var pattern = {
    js: '**/*.js',
    css: '**/*.css',
    users: ['**', '!**/vendor/**']
  };

  gulp.task('htmlhint', function() {
    return gulp.src(path.join(config.path.src, '**/*.html'))
      .pipe(filter(pattern.users))
      .pipe(htmlhint({htmlhintrc: '.htmlhintrc'}))
      .pipe(htmlhint.reporter());
  });

  gulp.task('csslint', function() {
    return gulp.src(path.join(config.path.src, '**/*.css'))
      .pipe(filter(pattern.users))
      .pipe(csslint('.csslintrc'))
      .pipe(csslint.reporter());
  });

  gulp.task('jshint', function() {
    return gulp.src(path.join(config.path.src, '**/*.js'))
      .pipe(filter(pattern.users))
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'));
  });

  gulp.task('weblint-watch', function() {
    gulp.watch(path.join(config.path.src, '**/*.html'), ['htmlhint']);
    gulp.watch(path.join(config.path.src, '**/*.css'), ['csslint']);
    gulp.watch(path.join(config.path.src, '**/*.js'), ['jshint']);
  });

  gulp.task('weblint', ['htmlhint', 'csslint', 'jshint']);
};
