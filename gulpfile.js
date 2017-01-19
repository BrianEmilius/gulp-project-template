// include gulp
var gulp = require('gulp'),

// include plug-ins
	jshint = require('gulp-jshint'),
	changed = require('gulp-changed'),
	imagemin = require('gulp-imagemin'),
	minifyHTML = require('gulp-htmlmin'),
	concat = require('gulp-concat'),
	inject = require('gulp-inject'),
	stripDebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	autoprefix = require('gulp-autoprefixer'),
	cleanCSS = require('gulp-clean-css'),
	sass = require('gulp-sass'),
	cached = require('gulp-cached'),
	sassPartialsImported = require('gulp-sass-partials-imported'),
	series = require('stream-series'),

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

// inject relevant stylesheets and scripts, minify new or changed HTML pages
gulp.task('htmlpage', () => {
	var htmlSrc = './src/*.html',
		htmlDst = './build',
		scripts = gulp.src(['./build/assets/scripts/jquery.min.js', './build/assets/scripts/bootstrap.min.js', './build/assets/scripts/app.js'], {read: false}),
		css = gulp.src(['./build/assets/stylesheets/bootstrap.min.css', './build/assets/stylesheets/bootstrap-theme.min.css', './build/assets/stylesheets/font-awesome.min.css', './build/assets/stylesheets/default.css'], {read: false});

	gulp.src(htmlSrc)
		.pipe(changed(htmlDst))
		.pipe(inject(scripts, {
			addRootSlash: false,
			transform: (filePath, file, i, length) => {
				var newPath = filePath.replace('build/', '');
				console.log('injected script: ' + newPath);
				return '<script src="' + newPath  + '"></script>';
			}
		}))
		.pipe(inject(css, {
			addRootSlash: false,
			transform: (filePath, file, i, length) => {
				var newPath = filePath.replace('build/', '');
				console.log('injected style: ' + newPath);
				return '<link rel="stylesheet" href="' + newPath + '">';
			}
		}))
		.pipe(minifyHTML({collapseWhitespace: true}))
		.pipe(gulp.dest(htmlDst));
});

// JS concat, strip debugging and minify
gulp.task('scripts', () => {
	gulp.src(['./src/assets/scripts/lib.js','./src/assets/scripts/*.js'])
		.pipe(concat('app.js'))
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(gulp.dest('./build/assets/scripts/'));
});

// SASS to CSS
gulp.task('sass', () => {
	gulp.src(['./src/assets/stylesheets/sass/**/*.scss'])
		.pipe(cached('sassfiles'))
		.pipe(sassPartialsImported(scss_dir))
		.pipe(sass({includePaths: scss_dir, outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(gulp.dest('./build/assets/stylesheets'));
});

// copy relevant boostrap and jquery files to build
gulp.task('copyBootstrap', () => {
	gulp.src(
		['./node_modules/bootstrap/dist/js/bootstrap.min.js',
		'./node_modules/jquery/dist/jquery.min.js'])
		.pipe(gulp.dest('./build/assets/scripts'));

	gulp.src(
		['./node_modules/bootstrap/dist/css/bootstrap.min.css',
		'./node_modules/bootstrap/dist/css/bootstrap-theme.min.css'])
		.pipe(gulp.dest('./build/assets/stylesheets'));
});

// copy relevant font-awesome files to build
gulp.task('copyFontAwesome', () => {
	gulp.src(['./node_modules/font-awesome/css/font-awesome.min.css'])
		.pipe(gulp.dest('./build/assets/stylesheets'));

	gulp.src(['./node_modules/font-awesome/fonts/*'])
		.pipe(gulp.dest('./build/assets/fonts'));
});

// default gulp task
gulp.task('default', ['imagemin', 'jshint', 'scripts', 'copyFontAwesome', 'sass', 'copyBootstrap', 'htmlpage'], () => {
	// watch for image-changes
	gulp.watch('./src/assets/media/**/*', ['imagemin']);
	
	// watch for HTML changes
	gulp.watch('./src/*.html', ['htmlpage']);

	// watch for JS changes
	gulp.watch('./src/assets/scripts/*.js', ['scripts']);

	// watch for SASS changes
	gulp.watch('./src/assets/stylesheets/sass/*.scss', ['sass']);
});