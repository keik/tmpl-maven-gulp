module.exports = function (gulp, config) {

  var connect = require('gulp-connect');

  gulp.task('connect', function() {
    connect.server({
      root: [config.path.src, require('path').join(config.path.src, config.path.resources)],
      port: 8888
    });
  });
};
