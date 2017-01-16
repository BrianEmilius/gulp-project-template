// include gulp
var gulp = require('gulp'),

// include plug-ins
	jshint = require('gulp-jshint'),
	changed = require('gulp-changed'),
	imagemin = require('gulp-imagemin'),
	minifyHTML = require('gulp-minify-html'),
	concat = require('gulp-concat'),
	stripDebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	autoprefix = require('gulp-autoprefixer'),
	cleanCSS = require('gulp-clean-css'),
	sass = require('gulp-sass'),
	cached = require('gulp-cached'),
	sassPartialsImported = require('gulp-sass-partials-imported'),

// other variables
	scss_dir = './src/assets/stylesheets/sass/';

// JS hint task
gulp.task('jshint', () => {
	gulp.src('./src/assets/scripts/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// minify new images
gulp.task('imagemin', () => {
	var imgSrc = './src/assets/media/**/*',
		imgDst = './build/assets/media';

	gulp.src(imgSrc)
		.pipe(changed(imgDst))
		.pipe(imagemin())
		.pipe(gulp.dest(imgDst));
});

// minify new or changed HTML pages
gulp.task('htmlpage', () => {
	var htmlSrc = './src/*.html',
		htmlDst = './build';

	gulp.src(htmlSrc)
		.pipe(changed(htmlDst))
		.pipe(minifyHTML())
		.pipe(gulp.dest(htmlDst));
});

// JS concat, strip debugging and minify
gulp.task('scripts', () => {
	gulp.src(['./src/assets/scripts/lib.js','./src/assets/scripts/*.js'])
		.pipe(concat('script.js'))
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(gulp.dest('./build/assets/scripts/'));
});

// SASS to CSS
gulp.task('sass', () => {
	gulp.src(['./src/assets/stylesheets/sass/**/*.scss'])
		.pipe(cached('sassfiles'))
		.pipe(sassPartialsImported(scss_dir))
		.pipe(sass({includePaths: scss_dir}).on('error', sass.logError))
		.pipe(gulp.dest('./src/assets/stylesheets'));
});

// CSS concat, auto-prefix and minify
gulp.task('css', () => {
	gulp.src(['./src/assets/stylesheets/*.css'])
		.pipe(autoprefix('last 18 versions'))
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('./build/assets/stylesheets'));
});

// default gulp task
gulp.task('default', ['imagemin', 'htmlpage', 'jshint', 'scripts', 'sass', 'css'], () => {
	// watch for image-changes
	gulp.watch('./src/assets/media/**/*', ['imagemin']);
	
	// watch for HTML changes
	gulp.watch('./src/*.html', ['htmlpage']);

	// watch for JS changes
	gulp.watch('./src/assets/scripts/*.js', ['scripts']);

	// watch for SASS changes
	gulp.watch('./src/assets/stylesheets/sass/*.scss', ['sass']);

	// watch for CSS changes
	gulp.watch('./src/assets/stylesheets/*.css', ['css']);
});