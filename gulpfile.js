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
var creds          = JSON.parse( fs.readFileSync( './secrets.json' ) );

function customerPlumber( errTitle ) {
    return plumber( {
        errorHandler: notify.onError( {
            title: errTitle || "Error running Gulp",
            message: "Error: <%= error.message %>",
            sound: 'Glass'
        } )
    } );
}

//Compile nunjucks files, put in target
gulp.task( 'nunjucks', function( cb ) {
    pump( [
        //TODO: update when staff page is ready
        gulp.src( [ 'pages/**/*.nunjucks' ] ),
        customerPlumber( 'Nunjucks Error' ),
        nunjucksRender( {
            path: [ 'templates' ]
        } ),
        gulp.dest( 'target' ),
        browserSync.reload( {
            stream: true
        } )
    ],
    cb
    );
} );

//Compile sass, put in target/css
gulp.task( 'sass', function( cb ) {
    pump( [
        //TODO: update when staff page is ready
        gulp.src( [ 'sass/**/*.scss' ] ),
        customerPlumber( 'SASS Error' ),
        sass().on( 'error', sass.logError ),
        autoprefixer(),
        gulp.dest( './target/css' ),
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
        gulp.dest( './target/js' ),
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
        gulp.dest( './target/img' ),
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
            baseDir: 'target'
        }
    } );
} );

gulp.task( 'watch', [ 'default', 'browserSync' ], function() {
    gulp.watch( './sass/**/*.scss', [ 'sass' ] );
    gulp.watch( './js/*.js', [ 'compress' ] );
    gulp.watch( ['pages/**/*.nunjucks', 'templates/**/*.nunjucks'], [ 'nunjucks' ] );
} );

gulp.task( 'deploy', [ 'default' ], function() {
    rsync( {
        src: 'target/',
        dest: creds.username,
        privateKey: creds.keyPath,
        ssh: true,
        recursive: true,
    }, function ( error, stdout, stderr, cmd ) {
        if ( error ) {
            console.log( error.message );
        } else {
            console.log( 'Uploaded to site successfully' );
        }
    } );
} );
