var gulp = require('gulp'),
    config = require('./gulpfiles/config.js');

require('./gulpfiles/weblint.js')(gulp, config);
require('./gulpfiles/less.js')(gulp, config);
require('./gulpfiles/build.js')(gulp, config);
require('./gulpfiles/connect.js')(gulp, config);

gulp.task('watch', ['inject-vendors', 'less', 'weblint', 'weblint-watch', 'less-watch', 'connect']);
gulp.task('default', ['watch']);
