'use strict';
var gulp       = require('gulp'), // Подключаем Gulp
	sass         = require('gulp-sass'), //Подключаем Sass пакет,
	browserSync  = require('browser-sync'), // Подключаем Browser Sync
	concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
	plumber      = require('gulp-plumber'), // Ловим ошибки
	notify       = require('gulp-notify'), // Украшаем ошибки
	sourcemaps   = require('gulp-sourcemaps'), // Правильный путь по CSS
	pug         = require('gulp-pug'), // Препроцессор pug
	bourbon      = require('node-bourbon'); // mixin'ы для sass


gulp.task('sass', function(){ // Создаем таск Sass
	return gulp.src('app/scss/**/*.scss') // Берем источник
	.pipe(plumber({
		errorHandler: notify.onError(function(err){
			return {
				title: 'Styles',
				message: err.message
			}
		})
	}))
	.pipe(sourcemaps.init())
		.pipe(sass({includePaths: require('node-bourbon').includePaths, outputStyle: 'expanded'})) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 5%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		// .pipe(cssnano()) // Сжимаем
		// .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
	});

gulp.task('pug', function() {
	return gulp.src('app/pug/index.pug')
	.pipe(plumber({
		errorHandler: notify.onError(function(err){
			return {
				title: 'Styles',
				message: err.message
			}
		})
	}))
	.pipe(pug({ pretty: '\t' }))
	.pipe(gulp.dest('app'));
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('scripts', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'libs_for_project/jquery/dist/jquery.min.js'
		])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
	});

gulp.task('css-production', function(){ // Создаем таск для css продакшн
	return gulp.src('app/scss/**/*.scss') // Берем источник
		.pipe(sass({includePaths: require('node-bourbon').includePaths})) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		// .pipe(cssnano()) // Сжимаем
		// .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
		.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
	});

gulp.task('watch', ['browser-sync', 'pug', 'sass', 'scripts'], function() {
	gulp.watch('app/scss/**/*.scss', ['sass']); // Наблюдение за sass файлами в папке sass
	gulp.watch('app/pug/**/*.pug', ['pug']); // Наблюдение за pug файлами в корне проекта
	gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/images/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/images')); // Выгружаем на продакшен
	});

gulp.task('build', ['clean', 'img', 'css-production', 'scripts'], function() {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/css/**.css'
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('default', ['watch']);
