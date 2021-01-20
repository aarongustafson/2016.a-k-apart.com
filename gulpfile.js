var gulp     = require('gulp'),
    imagemin = require('gulp-imagemin'),
    download = require('gulp-download-stream'),
    rename   = require('gulp-rename'),
    webp     = require('gulp-webp');

gulp.task('images', function() {
	
	var source = './i',
		  destination = './i';
	
	// Optimize & move
	gulp.src( source + '/**/*.{jpg,png,svg,gif}')
		// Optimize
		.pipe(imagemin())
		// Copy
		.pipe(gulp.dest(destination))
		;

	// Make WebP versions or PNG & JPG
	gulp.src(source + '/**/*.{jpg,png}')
		 // WebP
		.pipe(webp())
		 // Publish
		.pipe(gulp.dest(destination))
		;

	return true;

});
gulp.task('getImages',function(){
  var source = './i/s/temp',
      destination = './i/s';
  gulp.src( source + '/*-300.{jpg,png}')
    // Figure out the file I want to get
    .pipe(rename(function(path){
      //console.log( path );
      download( 'https://10kapart.blob.core.windows.net/screenshots/' + path.basename.replace('-300', '') + path.extname )
        .pipe(gulp.dest(destination));
    }))
    .pipe(gulp.dest(destination))
    ;
});