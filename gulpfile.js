var gulp = require('gulp');
var clean = require('gulp-clean');
var fileinclude = require('gulp-file-include');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

gulp.task('clean', function () {
    gulp.src('dist/', { read: false })
        .pipe(clean())
    ;
});

gulp.task('default', function () {
    gulp.src('src/main.js')
        .pipe(fileinclude({
            prefix: '// @@'
        }))
        .pipe(rename('angular-form-validation.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename('angular-form-validation.min.js'))
        .pipe(gulp.dest('dist'))
        .on('error', gutil.log)
    ;
});