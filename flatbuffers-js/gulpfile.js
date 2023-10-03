const gulp = require('gulp')
const concat = require('gulp-concat')

gulp.task('d.ts', function () {
  return gulp.src('types/*.d.ts')
    .pipe(concat('flatbuffers.d.ts'))
    .pipe(gulp.dest('k6/flatbuffers'));
})
