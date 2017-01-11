var gulp           = require( 'gulp' );
var pump           = require( 'pump' );
//TODO: remove del if it's not needed later
var del            = require( 'del' );
var nunjucksRender = require( 'gulp-nunjucks-render' );
var sass           = require( 'gulp-sass' );
var uglify         = require( 'gulp-uglify' );
var notify         = require( 'gulp-notify' );
var plumber        = require( 'gulp-plumber' );
var browserSync    = require( 'browser-sync' );
var autoprefixer   = require( 'gulp-autoprefixer' );
var rsync          = require( 'rsyncwrapper' );
var fs             = require( 'fs' );

function customerPlumber( errTitle ) {
    return plumber( {
        errorHandler: notify.onError( {
            title: errTitle || "Error running Gulp",
            message: "Error: <%= error.message %>",
            sound: 'Glass'
        } )
    } );
}

//Compile nunjucks files, put in dev
gulp.task( 'nunjucks', function( cb ) {
    pump( [
        //TODO: update when staff page is ready
        gulp.src( [ 'pages/**/*.nunjucks' ] ),
        customerPlumber( 'Nunjucks Error' ),
        nunjucksRender( {
            path: [ 'templates' ]
        } ),
        gulp.dest( 'dev' ),
        browserSync.reload( {
            stream: true
        } )
    ],
    cb
    );
} );

//Compile sass, put in dev/css
gulp.task( 'sass', function( cb ) {
    pump( [
        //TODO: update when staff page is ready
        gulp.src( [ 'sass/**/*.scss' ] ),
        customerPlumber( 'SASS Error' ),
        sass().on( 'error', sass.logError ),
        autoprefixer(),
        gulp.dest( './dev/css' ),
        browserSync.reload( {
            stream: true
        } )
    ],
    cb
    );
} );

gulp.task( 'compress', function ( cb ) {
    pump( [
        gulp.src( './js/*.js' ),
        customerPlumber( 'JS Error' ),
        uglify(),
        gulp.dest( './dev/js' ),
        browserSync.reload( {
            stream: true
        } )
    ],
    cb
    );
} );

// checkout https://github.com/sindresorhus/gulp-imagemin for images
gulp.task( 'copy', function( cb ) {
    pump  ( [
        //TODO: update exclusions when placeholder images are needed.
        gulp.src( [ 'img/*' ] ),
        customerPlumber( 'Copy Error' ),
        gulp.dest( './dev/img' ),
        browserSync.reload( {
            stream: true
        } )
    ],
    cb
    );
} );

gulp.task( 'default', [ 'nunjucks', 'sass', 'compress', 'copy' ] );

gulp.task( 'browserSync', function() {
    browserSync( {
        server: {
            baseDir: 'dev'
        }
    } );
} );

gulp.task( 'watch', [ 'default', 'browserSync' ], function() {
    gulp.watch( './sass/**/*.scss', [ 'sass' ] );
    gulp.watch( './js/*.js', [ 'compress' ] );
    gulp.watch( ['pages/**/*.nunjucks', 'templates/**/*.nunjucks'], [ 'nunjucks' ] );
} );
