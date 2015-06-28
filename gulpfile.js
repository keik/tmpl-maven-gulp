var gulp = require('gulp'),
    path = require('path'),
    util = require('util'),
    del = require('del'),
    es = require('event-stream'),
    runSequence = require('run-sequence'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    filter = require('gulp-filter'),
    htmlhint = require("gulp-htmlhint"),
    csslint = require('gulp-csslint'),
    jshint = require('gulp-jshint'),
    connect = require('gulp-connect'),
    inject = require('gulp-inject'),
    htmlmin = require('gulp-htmlmin'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

var config = {
  path: {

    /** frontend resources path */
    src: 'src/main/webapp',

    /** built-frontend resouces path */
    dest: 'target/dist',

    /** relative templates path from webapp **/
    templates: 'WEB-INF/templates',

    /** relative resources path from webapp **/
    resources: 'resources'
  }
};

var timeStamp = Date.now();

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


gulp.task('less', function () {
  gulp.src(path.join(config.path.src, '**/style.less'))
    .pipe(plumber())
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




gulp.task('connect', function() {
  connect.server({
    root: [config.path.src, require('path').join(config.path.src, config.path.resources)],
    port: 8888
  });
});



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
  // minify original CSS
  var userStream = gulp.src(path.join(config.path.src, '**/*.css'))
        .pipe(filter(pattern.users))
        .pipe(cssmin())
        .pipe(gulp.dest(config.path.dest));

  // minify CSS of libraries
  var vendorStream = gulp.src(bowerFiles)
        .pipe(filter(pattern.css))
        .pipe(cssmin())
        .pipe(concat('_vendor' + timeStamp + '.css'))
        .pipe(gulp.dest(path.join(config.path.dest, config.path.resources)));

  return es.merge(userStream, vendorStream);
});

gulp.task('minify-js', function () {
  // minify original JS
  var userStream = gulp.src(path.join(config.path.src, '**/*.js'))
        .pipe(filter(pattern.users))
        .pipe(uglify({preserveComments: 'some'}).on('error', gutil.log))
        .pipe(gulp.dest(config.path.dest));

  // minify JS of libraries
  var vendorStream = gulp.src(bowerFiles)
        .pipe(filter(pattern.js))
        .pipe(uglify({preserveComments: 'some'}).on('error', gutil.log))
        .pipe(concat('_vendor' + timeStamp + '.js'))
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



gulp.task('watch', ['inject-vendors', 'less', 'weblint', 'weblint-watch', 'less-watch', 'connect']);
gulp.task('default', ['watch']);
