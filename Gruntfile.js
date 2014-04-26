// # Globbing// for performance reasons we're only matching one level down:// 'test/spec/{,*/}*.js'// use this if you want to match all subfolders:// 'test/spec/**/*.js'module.exports = function(grunt) {    var exec = require('child_process').exec,        fs = require('fs');    // load all grunt tasks    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);//    // configurable paths//    var yeomanConfig = {//        app: 'app',//        dist: 'dist'//    };    /*    WHAT NEEDS TO HAPPEN FOR A RELEASE    MANUAL: Merge everything into master and switch to master branch    BASH: npm test - Test proposed release    *MANUAL: Lint proposed release    BASH: grunt - loads of stuff    MANUAL: Create branch for the next release    */    // Project configuration.    grunt.initConfig({        // Project settings        yeoman: {            // configurable paths            app: require('./bower.json').appPath || 'app',            dist: 'dist'        },        builddir: 'js-build',        pkg: grunt.file.readJSON('package.json'),        meta: {            banner: '/**\n' + ' * <%= pkg.description %>\n' +                ' * @version v<%= pkg.version %> - ' +                '<%= grunt.template.today("yyyy-mm-dd hh:nn") %>\n' +                ' * @link <%= pkg.homepage %>\n' +                ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' + ' */'        },        watch: {            less: {                files: ['app/css/{,*/}*.less'],                tasks: ['less']            }        },        "expand-include" : {            "get-started": {                src: [ "app/partials/get-started/get-started-template.html" ],                dest: "app/partials/get-started.html",                options: {                    directiveSyntax: "xml",                    substituteEntities : true,                    adjustReferences: false                }            }        },        concat: {            options: {                banner: '/*! forms-angular <%= grunt.template.today("yyyy-mm-dd") %> */\n'            },            build: {                src: [                    'app/js/forms-angular.js',                    'app/js/controllers/*.js',                    'app/js/directives/*.js',                    'app/js/filters/*.js',                    'app/js/services/*.js',                    'app/js/plugins/ng-grid/*.js',                    'app/js/plugins/jsPDF/*.js',                    'app/generated/*.js'                ],                dest: '<%= builddir %>/forms-angular.js'            }        },//      If you are here because you just came across "Warning: Running "recess:dist" (recess) task Fatal error: variable @input-border is undefined Use --force to continue.//      Then make sure your bower.json specifies ~1.2 of git://github.com/t0m/select2-bootstrap-css.git#~1.2        less: {            bs2: {                options: {                    compile: true                },                files: {                    'app/demo/css/demo-bs2.css': ['app/demo/css/demo-bs2.less'],                    'app/css/forms-angular-bs2.css': ['app/css/forms-angular-bs2.less']                }            },            bs3: {                options: {                    compile: true                },                files: {                    'app/demo/css/demo-bs3.css': ['app/demo/css/demo-bs3.less'],                    'app/css/forms-angular-bs3.css': ['app/css/forms-angular-bs3.less']                }            }        },        clean: {            dist: {                files: [{                    dot: true,                    src: [                        '.tmp',                        'dist/*',                        'dist/.git*'                    ]                }]            },            server: '.tmp'        },        // Add vendor prefixed styles        autoprefixer: {            options: {                browsers: ['last 1 version']            },            dist: {                files: [{                    expand: true,                    cwd: '.tmp/styles/',                    src: '{,*/}*.css',                    dest: '.tmp/styles/'                }]            }        },        uglify: {            options: {                banner: '/*! forms-angular <%= grunt.template.today("yyyy-mm-dd") %> */\n'            },            build: {                src: '<%= builddir %>/forms-angular.js',                dest: '<%= builddir %>/forms-angular.min.js'            }        },        lint: {            files: ['grunt.js', 'common/**/*.js', 'modules/**/*.js']        },        jshint: {            options: {                jshintrc: '.jshintrc'            },            all: [                'Gruntfile.js',                'app/js/scripts/{,*/}*.js',                'server/{,*/}*.js',                'test/api/{,*/}*.js',                'test/unit/{,*/}*.js',                'test/e2e/{,*/}*.js'            ]        },        copy: {            // Copy the required files into the npm distribution folder//                    {expand: true, src: ['path/*'], dest: 'dest/', filter: 'isFile'}, // includes files in path//                    {expand: true, src: ['path/**'], dest: 'dest/'}, // includes files in path and its subdirs//                    {expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'}, // makes all src relative to cwd//                    {expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'} // flattens results to a single level            bower: {                files: [                    {src: 'bower.json', dest: 'js-build/bower.json'},                    {src: 'app/css/forms-angular-bs2.css', dest:'js-build/forms-angular-bs2.css'},                    {src: 'app/css/forms-angular-bs2.less', dest:'js-build/forms-angular-bs2.less'},                    {src: 'app/css/forms-angular-bs3.css', dest:'js-build/forms-angular-bs3.css'},                    {src: 'app/css/forms-angular-bs3.less', dest:'js-build/forms-angular-bs3.less'}                ]            },            npm: {                files: [                    {src: 'package.json', dest:'npm-build/package.json'},                    {src: 'LICENSE.txt', dest:'npm-build/LICENSE.txt'},                    {src: 'server/lib/data_form.js',dest:'npm-build/lib/data_form.js'}                ]            },            dist: {                files: [                    {                        expand: true,                        dot: true,                        cwd: '<%= yeoman.app %>',                        dest: '<%= yeoman.dist %>',                        src: [                            '*.{ico,png,txt}',                            'partials/*.html',                            'template/*.html',                            '.htaccess',                            'img/{,*/}*.{webp}',                            'fonts/*'                        ]                    },                    {                        expand: true,                        cwd: '.tmp/img',                        dest: '<%= yeoman.dist %>/img',                        src: [                            'generated/*'                        ]                    },                    {expand:true, cwd:'<%= yeoman.app %>/bower_components/components-font-awesome', src:['**'], dest: '<%= yeoman.dist %>/styles/components-font-awesome'},                    {expand:true, cwd:'<%= yeoman.app %>/bower_components/jquery-ui/themes/smoothness/images', src:['**'], dest: '<%= yeoman.dist %>/styles/images'},                    {expand:true, cwd:'<%= yeoman.app %>/bower_components/select2', src:['*.{gif,png}'], dest: '<%= yeoman.dist %>/styles'}                ]            },            styles: {                expand: true,                cwd: '<%= yeoman.app %>/styles',                dest: '.tmp/styles/',                src: '{,*/}*.css'            }        },        bump: {            options: {                files: ['package.json','bower.json'],                updateConfigs: ['pkg'],                commit: true,                commitMessage: 'Release v%VERSION%',                commitFiles: ['-a'], // '-a' for all files                createTag: true,                tagName: 'v%VERSION%',                tagMessage: 'Version %VERSION%',                push: true,                pushTo: 'origin',                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'            }        },        // Renames files for browser caching purposes        rev: {            dist: {                files: {                    src: [                        '<%= yeoman.dist %>/scripts/{,*/}*.js',                        '<%= yeoman.dist %>/styles/{,*/}*.css',                        '<%= yeoman.dist %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',                        '<%= yeoman.dist %>/styles/fonts/*'                    ]                }            }        },        // Reads HTML for usemin blocks to enable smart builds that automatically        // concat, minify and revision files. Creates configurations in memory so        // additional tasks can operate on them        useminPrepare: {            html: 'app/index.html',            options: {                dest: 'dist'            }        },        // Allow the use of non-minsafe AngularJS files. Automatically makes it        // minsafe compatible so Uglify does not destroy the ng references        ngmin: {            dist: {                files: [{                    expand: true,                    cwd: '.tmp/concat/scripts',                    src: ['app.js', 'lib.js'],                    dest: '.tmp/concat/scripts'                }]            }        },        // Performs rewrites based on rev and the useminPrepare configuration        usemin: {            html: ['<%= yeoman.dist %>/{,*/}*.html'],            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],            options: {                assetsDirs: ['<%= yeoman.dist %>']            }        },        // The following *-min tasks produce minified files in the dist folder        imagemin: {            dist: {                files: [{                    expand: true,                    cwd: '<%= yeoman.app %>/img',                    src: '{,*/}*.{png,jpg,jpeg,gif}',                    dest: '<%= yeoman.dist %>/img'                }],                options: {                    cache: false                }            }        },        svgmin: {            dist: {                files: [{                    expand: true,                    cwd: '<%= yeoman.app %>/img',                    src: '{,*/}*.svg',                    dest: '<%= yeoman.dist %>/img'                }]            }        },        ngtemplates:  {            //TODO separate out the bs2 and bs3 stuff so we aren't sending near dupes down the wire            formsAngular:        {                cwd:      'app',                src:      'template/**.html',                dest:     'app/generated/app.templates.js',                options:    {                    htmlmin: {                        collapseBooleanAttributes:      true,                        collapseWhitespace:             true,                        removeAttributeQuotes:          true,                        removeComments:                 true,                        removeEmptyAttributes:          true,                        removeRedundantAttributes:      true,                        removeScriptTypeAttributes:     true,                        removeStyleLinkTypeAttributes:  true                    },                    usemin: "scripts/lib.js"                },                module: 'formsAngular'            }        },        htmlmin: {            dist: {                options: {                    // Optional configurations that you can uncomment to use                    // removeCommentsFromCDATA: true,                    // collapseBooleanAttributes: true,                    // removeAttributeQuotes: true,                    // removeRedundantAttributes: true,                    // useShortDoctype: true,                    // removeEmptyAttributes: true,                    // removeOptionalTags: true*/                },                files: [{                    expand: true,                    cwd: '<%= yeoman.app %>',                    src: ['*.html', 'partials/*.html', 'template/*.html'],                    dest: '<%= yeoman.dist %>'                }]            }        },        concurrent: {            dist: [                'copy:styles',//                'newer:imagemin',  causing "lossy operations" error message and it isn't a big deal to skip...//                'svgmin',                'newer:htmlmin'            ]        }    });    grunt.registerTask('modify_json', 'Modify the package.json and bower.json files.', function(type) {        var filename = 'npm-build/package.json';        var content = grunt.file.readJSON(filename);        switch (type) {            case 'live' :                content.name = "forms-angular";                break;            case 'test' :                content.name = "forms-angular-test";                break;            default:                grunt.fatal('Invalid call to modify_json : '+ type);        }        content.main = "lib/data_form.js";        delete content.scripts;        delete content.dependencies.express;        delete content.dependencies.bower;        delete content.dependencies.mongoose;        delete content.devDependencies;        grunt.file.write(filename, JSON.stringify(content,null,2));        grunt.log.ok('Modified npm build package.json');        filename = 'js-build/bower.json';        content = grunt.file.readJSON(filename);        delete content.dependencies['components-font-awesome'];        grunt.file.write(filename, JSON.stringify(content,null,2));        grunt.log.ok('Modified npm build bower.json');    });    grunt.registerTask('commit-tag-push', 'Do a git commit, tag and push', function(folder) {        var startDir = process.cwd();        var opts = grunt.config.get(['bump']).options;        process.chdir(folder);        var globalVersion = grunt.config.get().pkg.version;        var commitMessage = opts.commitMessage.replace('%VERSION%', globalVersion);        var done = this.async();        var queue = [];        var next = function () {            if (!queue.length) {                process.chdir(startDir);                return done();            }            queue.shift()();        };        var runIt = function (behavior) {            queue.push(behavior);        };        runIt(function () {            exec('git commit ' + opts.commitFiles.join(' ') + ' -m "' + commitMessage + '"', function (err, stdout, stderr) {                if (err) {                    grunt.fatal('Can not create the commit:\n  ' + stderr);                }                grunt.log.ok('Committed as "' + commitMessage + '"');                next();            });        });        var tagName = opts.tagName.replace('%VERSION%', globalVersion);        var tagMessage = opts.tagMessage.replace('%VERSION%', globalVersion);        runIt(function () {            exec('git tag -a ' + tagName + ' -m "' + tagMessage + '"', function (err, stdout, stderr) {                if (err) {                    grunt.fatal('Can not create the tag:\n  ' + stderr);                }                grunt.log.ok('Tagged as "' + tagName + '"');                next();            });        });        runIt(function () {            exec('git push ' + opts.pushTo + ' && git push ' + opts.pushTo + ' --tags', function (err, stdout, stderr) {                if (err) {                    grunt.fatal('Can not push to ' + opts.pushTo + ':\n  ' + stderr);                }                grunt.log.ok('Pushed to ' + opts.pushTo);                next();            });        });        next();    });    grunt.registerTask('npm-publish', 'Publish a package', function (folder) {        var done = this.async();        exec('npm publish ' + folder, function (err, stdout, stderr) {            grunt.log.ok(stdout);            if (err) {                grunt.fatal('Can publish to npm:\n  ' + stderr);            }            grunt.log.ok('Package published');            done();        });    });    grunt.registerTask('check-font-awesome', 'Check that font awesome is installed before build', function() {        var done = this.async();        fs.exists(grunt.config(['yeoman']).app + '/bower_components/components-font-awesome', function(exists) {            if (exists) {                done()            } else {                grunt.fatal('Cannot build website before you have installed font-awesome.  Run\nbower install components-font-awesome#3.2.1\n');            }        })    });    grunt.registerTask('setupFramework', 'Selecte the framework prior to running less', function(framework) {        var done = this.async();        exec('bash scripts/framework.sh ' + framework, function (err, stdout, stderr) {            if (err) {                grunt.fatal('Error running framework script:\n  ' + stderr);            }            grunt.log.ok('Set up for framework ' + framework);            done();        });    });    var bumpLevel = grunt.option('bumpLevel') || 'patch';    grunt.registerTask('build_getting_started', ['expand-include']);    grunt.registerTask('build', [        'clean:dist',        'useminPrepare',        'check-font-awesome',        'setupFramework:bs3',        'less:bs3',        'setupFramework:bs2',        'less:bs2',        'ngtemplates',        'concurrent:dist',        'autoprefixer',        'concat',        'ngmin',        'copy:dist',//        'cdnify',        'cssmin',        'uglify',        'rev',        'usemin'    ]);    grunt.registerTask('default', [//        'jshint',        'build'    ]);    // To do a minor / major release to something of the form    // grunt release --bumpLevel=minor    grunt.registerTask('release', ['build', 'bump-only:' + bumpLevel, 'copy', 'modify_json:live', 'bump-commit', 'commit-tag-push:js-build', 'npm-publish:npm-build']);    grunt.registerTask('testprep', ['expand-include', 'build', 'copy', 'modify_json:test']);    grunt.registerTask('testrelease', ['expand-include', 'build', 'bump-only:' + bumpLevel, 'copy', 'modify_json:test', 'npm-publish:npm-build']);};