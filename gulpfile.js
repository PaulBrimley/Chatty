var gulp          = require('gulp'),
    templateCache = require('gulp-angular-templatecache'),
    del           = require('del'),
    concat        = require('gulp-concat'),
    inject        = require("gulp-inject"),
    minifyCSS     = require('gulp-clean-css'),
    ngAnnotate    = require('gulp-ng-annotate'),
    plumber       = require('gulp-plumber'),
    jshint        = require('gulp-jshint'),
    stylish       = require('jshint-stylish'),
    notify        = require('gulp-notify'),
    rename        = require('gulp-rename'),
    replace       = require('gulp-replace'),
    util          = require('gulp-util'),
    sass          = require('gulp-sass'),
    sourcemaps    = require('gulp-sourcemaps'),
    uglify        = require('gulp-uglify'),
    browserSync   = require("browser-sync"),
    gulpif        = require('gulp-if'),
    autoprefixer  = require('gulp-autoprefixer'),
    war           = require('gulp-war'),
    zip           = require('gulp-zip'),
    fs            = require('fs'),
    p             = require('./package.json'),
    src = {
        root: 'src/app/',
        styles: [
            'src/assets/styles/main.scss'
        ],
        scripts: [
            'src/app/app.js',
            'src/app/admin/**/*.js',
            'src/app/affiliate/**/*.js',
            'src/app/common/**/*.js'
        ],
        vendors: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/angular/angular.min.js',
            'node_modules/angular-animate/angular-animate.min.js',
            'node_modules/angular-touch/angular-touch.min.js',
            'node_modules/angular-ui-router/release/angular-ui-router.min.js',
            'node_modules/angular-local-storage/dist/angular-local-storage.min.js',
            'node_modules/angularjs-toaster/toaster.min.js',
            'node_modules/angular-dsv/angular-dsv.min.js',
            'node_modules/ng-fittext/dist/ng-FitText.min.js',
            'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
            'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
            'node_modules/angular-ui-mask/dist/mask.js',
            'node_modules/croppie/croppie.js',
            'node_modules/ng-img-crop/compile/minified/ng-img-crop.js'
        ]
    },
    dist = {
        root: 'backOffice/',
        assets: 'backOffice/assets/',
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
        //.pipe(replace(env.api[srvenv].pattern, env.api[srvenv].value))
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
//KARMA - unit testing
//=============================================================================
//gulp.task('test', function (done) {
// karma.start({
// configFile: __dirname + '/test/karma.conf.js'
// }, done);
//});


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
//, 'ngdocs' <--- to be added back in when I am ready for the docs to
//be generated
gulp.task('default', [], function () {
    //if(srvenv === undefined || srvseq === undefined) {
    //    console.log('\n*********************************');
    //    console.log('The --srvseq command-line switches must be used
    //when calling Gulp directly. These values will indicate the local
    //running sequence and help Gulp configure the appropriate API URLs
    //programmatically. Please consider using the build.bat script instead
    //which detects the running environment automatically and also runs npm,
    //    bower, gulp, etc.');
    //    console.log(' - OR - ');
    // console.log('e.g. gulp --srvenv qa --srvseq 1');
    //    console.log('e.g. gulp --srvenv [prod,qa,dev] --srvseq
    //    [1,2,3] [--watchoff [true,false]] [--smashoff [true,false]]');
    //    console.log('*********************************\n');
    //} else {
    // console.log(
    //    //'Gulp is working in the \'' + srvenv + '\' environment; ' +
    //    'sequence is set to \'' + srvseq + '\'; '
    // );
    // console.log(
    //    'Watchoff is set to \'' + watchoff + '\'; '
    // );
    // console.log(
    //    'Smashoff is set to \'' + smashoff + '\'; '
    // );
    //    gulp.start('build');
    //}
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
        gulp.start('browser-sync', 'watch');
    }
});

gulp.task('just-run', function () {
    gulp.start('browser-sync', 'watch');
});