var gulp = require('gulp'),
	source = require('vinyl-source-stream'),
	gutil = require('gulp-util'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	notify = require("gulp-notify"),
	babelify = require('babelify'),
	svgmin = require('gulp-svgmin'),
	svgstore = require('gulp-svgstore'),
	path = require('path'),

	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	buffer = require('vinyl-buffer'),

	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	historyApiFallback = require('connect-history-api-fallback');

gulp.task('sass', function(){
	return gulp.src('./css/style.scss')
		.pipe(sass())
		.pipe(autoprefixer({
			browser: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('./css/build/'))
		.pipe(reload({stream:true}))
});

gulp.task('svg', function(){
	return gulp.src('./svg/*.svg')
		.pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + 'icon-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
		.pipe(gulp.dest('./svg/svgbuild'));
})

/*
  Browser Sync
*/
gulp.task('browser-sync', function() {
    browserSync({
        // we need to disable clicks and forms for when we test multiple rooms
        server : {},
        middleware : [ historyApiFallback() ],
        ghostMode: false
    });
});

//Functions for browserify, reactify, watchify and gulp-notify
function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

function buildScript(file, watch) {
  var props = {
    entries: ['./scripts/' + file],
    debug : true,
    cache: {},
    packageCache: {},
    transform:  [babelify.configure({stage : 0 })]
  };

  // watchify() if watch requested, otherwise run browserify() once 
  var bundler = watch ? watchify(browserify(props)) : browserify(props);

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(gulp.dest('./build/'))
      // If you also want to uglify it
      // .pipe(buffer())
      // .pipe(uglify())
      // .pipe(rename('app.min.js'))
      // .pipe(gulp.dest('./build'))
      .pipe(reload({stream:true}))
  }

  // listen for an update and run rebundle
  bundler.on('update', function() {
    rebundle();
    gutil.log('Rebundle...');
  });

  // run it once the first time buildScript is called
  return rebundle();
}

gulp.task('scripts', function() {
  return buildScript('main.js', false);
});

gulp.task('default', ['sass', 'scripts', 'browser-sync'], function() {

	gulp.watch('css/**/*', ['sass']);

 	return buildScript('main.js', true);
});
