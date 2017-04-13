var autoprefixer  = require('gulp-autoprefixer'),
    browserSync   = require("browser-sync"),
    concat        = require('gulp-concat'),
    del           = require('del'),
    fs            = require('fs'),
    gulp          = require('gulp'),
    gulpif        = require('gulp-if'),
    inject        = require("gulp-inject"),
    jshint        = require('gulp-jshint'),
    minifyCSS     = require('gulp-clean-css'),
    nodemon       = require('gulp-nodemon'),
    ngAnnotate    = require('gulp-ng-annotate'),
    notify        = require('gulp-notify'),
    p             = require('./package.json'),
    path          = require('path'),
    plumber       = require('gulp-plumber'),
    rename        = require('gulp-rename'),
    replace       = require('gulp-replace'),
    sass          = require('gulp-sass'),
    sourcemaps    = require('gulp-sourcemaps'),
    stylish       = require('jshint-stylish'),
    templateCache = require('gulp-angular-templatecache'),
    uglify        = require('gulp-uglify'),
    util          = require('gulp-util'),
    war           = require('gulp-war'),
    zip           = require('gulp-zip'),
    src = {
        root: 'src/app/',
        styles: [
            'src/assets/styles/main.scss'
        ],
        vendors: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/angular/angular.min.js',
            'node_modules/angular-animate/angular-animate.min.js',
            'node_modules/angular-touch/angular-touch.min.js',
            'node_modules/angular-ui-router/release/angular-ui-router.min.js',
            'node_modules/angular-local-storage/dist/angular-local-storage.min.js',
            'node_modules/angularjs-toaster/toaster.min.js',
            'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
            'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
            'node_modules/angular-ui-mask/dist/mask.js',
            'node_modules/croppie/croppie.js',
            'node_modules/ng-img-crop/compile/minified/ng-img-crop.js'
        ]
    },
    dist = {
        root: 'dist/',
        assets: 'dist/assets/',
        war: './war'
    },
    watchoff = util.env.watchoff,
    smashoff = util.env.smashoff;


//=============================================================================
//BROWSER SYNC
//=============================================================================
gulp.task('browser-sync', function() {
    if(watchoff === undefined || watchoff === 'false') {
        browserSync({
            notify: false,
            https: false,
            server: {
                baseDir: dist.root
            }
        });
    }
});

gulp.task('bs-reload', function () {
    if(watchoff === undefined || watchoff === 'false') {
        browserSync.reload();
    }
});


//=============================================================================
//CLEAN
//=============================================================================
gulp.task('clean', function() {
    return del([dist.root + '/**/*', dist.root + '/*.*'],
        function(err, deletedFiles) {
            if (deletedFiles) console.log('- Files deleted:\n\t',
                deletedFiles.join('\n\t'));
            var assetsFolder = dist.assets;
            if (!fs.exists(assetsFolder)){
                fs.mkdir(assetsFolder, 0664, function(err){
                    if (err) console.log('Unable to create directory ' +
                        assetsFolder);
                    else console.log('+ Created directory ' + assetsFolder + '\n');
                });
            }
        });
});

//=============================================================================
//SASS COMPILER
//=============================================================================
gulp.task('styles', [], function() {
    return gulp.src(src.styles)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(rename({suffix: '-' + p.version + '.min'}))
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('.', {sourceRoot: '/maps'}))
        .pipe(gulp.dest(dist.assets))
        .pipe(gulpif(!watchoff, browserSync.reload({stream: true})))
        /*.pipe(notify({message: 'Sass has been compiled.'}))*/;
});


//=============================================================================
//JAVASCRIPT COMPRESSOR
//=============================================================================
gulp.task('app-scripts', [], function () {
    return gulp.src(['src/app/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('app-' + p.version + '.min.js'))
        .pipe(ngAnnotate())
        .pipe(gulpif((smashoff === 'false'), uglify()))
        .pipe(sourcemaps.write('.', {sourceRoot: '/maps'}))
        .pipe(gulp.dest(dist.assets))
        .pipe(gulpif(!watchoff, browserSync.reload({stream: true})));
});
gulp.task('vendor-scripts', [], function() {
    return gulp.src(src.vendors)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('vendor-'+p.version+'.min.js'))
        .pipe(ngAnnotate())
        .pipe(sourcemaps.write('.', {sourceRoot: '/maps'}))
        .pipe(gulp.dest(dist.assets))
        .pipe(gulpif(!watchoff, browserSync.reload({stream: true})));
});

//=============================================================================
//INDEX
//=============================================================================
gulp.task('index', function () {
    var version = p.version,
        sources = gulp.src(
            [dist.assets+'vendor-'+version+'.min.js',
                dist.assets+'app-'+version+'.min.js',
                dist.assets+'partials-'+version+'.min.js',
                dist.assets+'main-'+version+'.min.css'],
            {read: false}
        ),
        options = {
            relative: false,
            ignorePath: dist.root,
            addRootSlash: false
        };
    gulp.src(src.root+'index.html')
        .pipe(rename("index.html"))
        .pipe(plumber())
        .pipe(inject(sources, options))
        .pipe(gulp.dest(dist.root));
});
gulp.task('partials', function() {
    return gulp.src(['src/app/**/*.html','!src/app/index.html'])
        .pipe(plumber())
        .pipe(templateCache({standalone:true}))
        .pipe(sourcemaps.init())
        .pipe(concat('partials-'+p.version+'.min.js'))
        .pipe(sourcemaps.write('.', {sourceRoot: '/maps'}))
        .pipe(gulp.dest(dist.assets));
});
gulp.task('assets', function() {
    gulp.src('src/assets/images/**/*')
        .pipe(plumber())
        .pipe(gulp.dest(dist.assets+'images/'));

    gulp.src('src/assets/fonts/**/*')
        .pipe(plumber())
        .pipe(gulp.dest(dist.assets+'fonts/'));

    gulp.src('src/assets/files/**/*')
        .pipe(plumber())
        .pipe(gulp.dest(dist.assets+'files/'));
});


//=============================================================================
//JSHINT - javascript linter. Prints errors in syntax to console
//=============================================================================
gulp.task('lint', function() {
    return gulp.src(['src/app/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});


//=============================================================================
//WATCH - watches whatever files are listed and runs the associated
//task if those files change.
//=============================================================================
gulp.task('watch', function() {
    gulp.watch(["src/assets/**/*.scss"], ["styles"]);
    gulp.watch(["src/app/**/*.js"], ["app-scripts", "lint"]);
    gulp.watch(["src/app/**/*.html"], ['watchBuildHtml']);
    gulp.watch(["src/assets/files/*.*"], ['assets']);
});
gulp.task('watchBuildHtml', ['index', 'partials'], function() {
    browserSync.reload();
});


//=============================================================================
//NODEMON - start nodemon, watch, and restart on change
//=============================================================================

gulp.task('nodemon', ['browser-sync'], function() {
    nodemon({
        script: 'index.js',
        ext: 'js'
    }).on('start', function() {
        browserSync.reload();
    });
});

//=============================================================================
//NGDOCS - Creates documentation and stores the html files in the docs
//directory.
//NOTE: javaDoc syntax must be used - for more information see the url
//https://www.npmjs.com/package/gulp-ngdocs
//=============================================================================
gulp.task('ngdocs', [], function () {
    var gulpDocs = require('gulp-ngdocs');
    var options = {
        //    navTemplate:  "src/common/framework/my-docs-nav.html",
        title:        "WebUI - P.A.S. 2 Angular Application Documentation 2015",
        html5Mode:    true,
        startPage:    '/docs',
        editExample:  true
    };
    return gulp.src('src/app/*.js')
        .pipe(gulpDocs.process(options))
        .pipe(gulp.dest('./docs'));
});


//=============================================================================
//BUILD PROCESS ONLY
//=============================================================================

gulp.task('buildOnly', ['cleanBuild'], function() {
    gulp.start('war');
});

gulp.task('cleanBuild',  function() {
    return del([dist.root + '/**/*', dist.root + '/*.*', dist.war + '/**/*', dist.war + '/*.*'],
        function(err, deletedFiles) {
            if (deletedFiles) console.log('- Files deleted:\n\t',
                deletedFiles.join('\n\t'));
            var assetsFolder = dist.assets;
            if (!fs.exists(assetsFolder)){
                fs.mkdir(assetsFolder, 0664, function(err){
                    if (err) console.log('Unable to create directory ' +
                        assetsFolder);
                    else console.log('+ Created directory ' + assetsFolder + '\n');
                });
            }
        });
});

gulp.task('stylesBuild', [], function() {
    return gulp.src(src.styles)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(rename({suffix: '-' + p.version + '.min'}))
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('.', {sourceRoot: '/maps'}))
        .pipe(gulp.dest(dist.assets));
});

gulp.task('app-scriptsBuild', ['stylesBuild'], function () {
    return gulp.src(['src/app/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('app-' + p.version + '.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('.', {sourceRoot: '/maps'}))
        .pipe(gulp.dest(dist.assets));
});

gulp.task('vendor-scriptsBuild', ['app-scriptsBuild'], function() {
    return gulp.src(src.vendors)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('vendor-'+p.version+'.min.js'))
        .pipe(ngAnnotate())
        .pipe(sourcemaps.write('.', {sourceRoot: '/maps'}))
        .pipe(gulp.dest(dist.assets));
});


gulp.task('partialsBuild', ['vendor-scriptsBuild'], function() {
    return gulp.src(['src/app/**/*.html','!src/app/index.html'])
        .pipe(plumber())
        .pipe(templateCache({standalone:true}))
        .pipe(sourcemaps.init())
        .pipe(concat('partials-'+p.version+'.min.js'))
        .pipe(sourcemaps.write('.', {sourceRoot: '/maps'}))
        .pipe(gulp.dest(dist.assets));
});

gulp.task('fontsBuild', ['partialsBuild'], function() {
    return gulp.src('src/assets/fonts/**/*')
        .pipe(plumber())
        .pipe(gulp.dest(dist.assets+'fonts/'));
});

gulp.task('imagesBuild', ['fontsBuild'], function() {
    return gulp.src('src/assets/images/**/*')
        .pipe(plumber())
        .pipe(gulp.dest(dist.assets+'images/'));
});

gulp.task('filesBuild', ['imagesBuild'], function() {
    return gulp.src('src/assets/files/**/*')
        .pipe(plumber())
        .pipe(gulp.dest(dist.assets+'files/'));
});

gulp.task('indexBuild', ['filesBuild'], function () {
    var version = p.version,
        sources = gulp.src(
            [dist.assets+'vendor-'+version+'.min.js',
                dist.assets+'app-'+version+'.min.js',
                dist.assets+'partials-'+version+'.min.js',
                dist.assets+'main-'+version+'.min.css'],
            {read: false}
        ),
        options = {
            relative: false,
            ignorePath: dist.root,
            addRootSlash: false
        };
    return gulp.src(src.root+'index.html')
        .pipe(rename("index.html"))
        .pipe(plumber())
        .pipe(inject(sources, options))
        .pipe(gulp.dest(dist.root));
});

gulp.task('war', ['indexBuild'], function() {
    gulp.src([dist.root + '/**', dist.assets + '/**'])
        .pipe(war({
            welcome: 'index.html',
            displayName: 'Divvee Back Office'
        }))
        .pipe(zip('backOffice.war'))
        .pipe(gulp.dest(dist.war));
});

//=============================================================================
//DEFAULT TASK - what gets run when you type 'gulp' into command line
//=============================================================================
gulp.task('default', [], function () {
    gulp.start('build');
});

gulp.task('build', ['clean', 'lint'], function() {
    gulp.start('run');
});

gulp.task('run', ['styles', 'vendor-scripts', 'app-scripts',
    'partials', 'assets'], function () {
    gulp.start('index');
    if(watchoff === undefined || watchoff === 'false') {
        console.log('Running Gulp in \'watch\' mode!');
        gulp.start('nodemon', 'watch');
    }
});

gulp.task('just-run', function () {
    gulp.start('browser-sync', 'watch');
});