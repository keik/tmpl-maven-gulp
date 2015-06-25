module.exports = function (gulp, config) {

  var util = require('util'),
      path = require('path'),
      es = require('event-stream'),
      gutil = require('gulp-util'),
      del = require('del'),
      filter = require('gulp-filter'),
      inject = require('gulp-inject'),
      htmlmin = require('gulp-htmlmin'),
      cssmin = require('gulp-cssmin'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat'),
      runSequence = require('run-sequence');

  /** bower files */
  var bowerFiles = require('main-bower-files')();

  /** filters pattern */
  var pattern = {
    js: '**/*.js',
    css: '**/*.css',
    users: ['**', '!**/vendor/**']
  };

  /** production flag */
  var isProduction = false;

  gulp.task('clean', function () {
    return del.sync([config.path.dest]);
  });

  gulp.task('minify-html', function () {
    return gulp.src(path.join(config.path.dest, '**/*.html'))
      .pipe(htmlmin({removeComments: true, collapseWhitespace: true, keepClosingSlash: true}))
      .pipe(gulp.dest(config.path.dest));
  });

  gulp.task('minify-css', function () {
    // ユーザ CSS をミニファイ (画面ごとに使用するファイルが異なるため concat はしない)
    var userStream = gulp.src(path.join(config.path.src, '**/*.css'))
          .pipe(filter(pattern.users))
          .pipe(cssmin())
          .pipe(gulp.dest(config.path.dest));

    // ライブラリの CSS をミニファイ (concat する)
    var vendorStream = gulp.src(bowerFiles)
          .pipe(filter(pattern.css))
          .pipe(cssmin())
          .pipe(concat('_vendor' + config.timeStamp + '.css'))
          .pipe(gulp.dest(path.join(config.path.dest, config.path.resources)));

    return es.merge(userStream, vendorStream);
  });

  gulp.task('minify-js', function () {
    // ユーザ JavaScript をミニファイ (画面ごとに使用するファイルが異なるため concat はしない)
    var userStream = gulp.src(path.join(config.path.src, '**/*.js'))
          .pipe(filter(pattern.users))
          .pipe(uglify({preserveComments: 'some'}).on('error', gutil.log))
          .pipe(gulp.dest(config.path.dest));

    // ライブラリの JavaScript をミニファイ (concat する)
    var vendorStream = gulp.src(bowerFiles)
          .pipe(filter(pattern.js))
          .pipe(uglify({preserveComments: 'some'}).on('error', gutil.log))
          .pipe(concat('_vendor' + config.timeStamp + '.js'))
          .pipe(gulp.dest(path.join(config.path.dest, config.path.resources)));

    return es.merge(userStream, vendorStream);
  });

  gulp.task('inject-vendors', function () {
    var sources,
        ignorePath,
        destPath;

    if (isProduction) {
      sources = path.join(config.path.dest, '**/_vendor*');
      ignorePath = path.join(config.path.dest, config.path.resources),
      destPath = config.path.dest;
    } else {
      sources = bowerFiles;
      ignorePath = path.join(config.path.src, config.path.resources),
      destPath = config.path.src;
    }

    return gulp.src(path.join(config.path.src, '**/*.html'))
      .pipe(filter(pattern.users))
      .pipe(inject(gulp.src(sources, {read: false}), {
        name: 'vendor',
        ignorePath: ignorePath,
        selfClosingTag: true,
        transform: function (filepath, file, index, length, targetFile) {
          var ext = filepath.match(/[^\.]+$/)[0];
          switch (ext) {
          case 'js':
            return util.format('<script src="%s" th:src="@{%s}"></script>', filepath, filepath);
          case 'css':
            return util.format('<link rel="stylesheet" href="%s" th:href="@{%s}" />', filepath, filepath);
          }
          return '';
        }
      }))
      .pipe(gulp.dest(destPath));
  });

  gulp.task('build', function () {
    isProduction = true;
    runSequence(
      'clean',
      'less',
      ['minify-css', 'minify-js'],
      'inject-vendors',
      'minify-html'
    );
  });
};
