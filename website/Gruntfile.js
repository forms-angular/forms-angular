// Generated on 2020-12-09 using generator-fng 0.2.23
'use strict';

module.exports = function (grunt) {
  var localConfig;
  try {
    localConfig = require('./server/config/local.env');
  } catch(e) {
    localConfig = {};
  }

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    protractor: 'grunt-protractor-runner',
    buildcontrol: 'grunt-build-control'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    pkg: grunt.file.readJSON('package.json'),
    yeoman: {
      // configurable paths
      client: 'app',
      app: 'app',
      dist: 'dist'
    },
    express: {
      options: {
        port: process.env.PORT || 9000
      },
      dev: {
        options: {
          script: 'server.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'server.js'
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    watch: {
      injectJS: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '!<%= yeoman.client %>/{app,components}/**/*.mock.js',
          '!<%= yeoman.client %>/app/app.js'],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.css'
        ],
        tasks: ['injector:css']
      },
      mochaTest: {
        files: ['server/**/*.spec.js'],
        tasks: ['env:test', 'mochaTest']
      },
      jsTest: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ],
        tasks: ['newer:jshint:all', 'karma']
      },
      less: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
        tasks: ['newer:less']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.css',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.html',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.spec.js',
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js',
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '<%= yeoman.client %>/.jshintrc',
        reporter: require('jshint-stylish')
      },
      server: {
        options: {
          jshintrc: 'server/.jshintrc'
        },
        src: [
          'server/**/*.js',
          '!server/**/*.spec.js'
        ]
      },
      serverTest: {
        options: {
          jshintrc: 'server/.jshintrc-spec'
        },
        src: ['server/**/*.spec.js']
      },
      all: [
        '<%= yeoman.client %>/{app,components}/**/*.js',
        '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
        '!<%= yeoman.client %>/{app,components}/**/*.mock.js'
      ],
      test: {
        src: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '!<%= yeoman.dist %>/.openshift',
            '!<%= yeoman.dist %>/Procfile'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/'
        }]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // compile less into css
    less: {
      dist: {
        options: {
          compile: true
        },
        files: {
          '.tmp/styles/main-bs2.css': ['<%= yeoman.app %>/styles/demo-bs2.less'],
          '.tmp/styles/main-bs3.css': ['<%= yeoman.app %>/styles/demo-bs3.less']
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server.js',
        options: {
          nodeArgs: ['--inspect-brk'],
          env: {
            PORT: process.env.PORT || 9000
          },
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              setTimeout(function () {
                require('open')('http://localhost:8080/debug?port=5858');
              }, 500);
            });
          }
        }
      }
    },

    // // Automatically inject Bower components into the app
    // wiredep: {
    //   target: {
    //     src: '<%= yeoman.client %>/index.html',
    //     ignorePath: '<%= yeoman.client %>/',
    //     exclude: [
    //       /bootstrap-sass-official/,
    //       /bootstrap.js/,
    //       '/json3/',
    //       '/es5-shim/'
    //       , /blueimp-file-upload\/js\/jquery.fileupload-ui.js/, /blueimp-file-upload\/js\/jquery.fileupload-jquery-ui.js/
    //
    //       ,  /ckeditor\/ckeditor.js/
    //     ]
    //   }
    // },
    //
    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/public/{,*/}*.js',
            '<%= yeoman.dist %>/public/{,*/}*.css',
            '<%= yeoman.dist %>/public/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/public/assets/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index.html'],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/public/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/public/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/public/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/public',
          '<%= yeoman.dist %>/public/assets/images'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '*/**.js',
          dest: '.tmp/concat'
        }]
      }
    },

    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: 'tmpApp',
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        usemin: 'app/app.js'
      },
      main: {
        cwd: '<%= yeoman.client %>',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/templates.js'
      },
      tmp: {
        cwd: '.tmp',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/tmp-templates.js'
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>',
          dest: '<%= yeoman.dist %>/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'assets/images/{,*/}*.{webp}',
            'assets/fonts/**/*',
            'index.html'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/public/assets/images',
          src: ['generated/*']
        }, {
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.client %>',
        dest: '.tmp/',
        src: ['{app,components}/**/*.css']
      }
    },

    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        connectCommits: false,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      heroku: {
        options: {
          remote: 'heroku',
          branch: 'master'
        }
      },
      openshift: {
        options: {
          remote: 'openshift',
          branch: 'master'
        }
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
      ],
      test: [
      ],
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['server/**/*.spec.js']
    },

    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      firefox: {
        options: {
          args: {
            browser: 'firefox'
          }
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      },
      all: localConfig
    },

    injector: {
      options: {

      },
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            ['{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
              '!{.tmp,<%= yeoman.client %>}/app/app.js',
              '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.spec.js',
              '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js']
          ]
        }
      },
      less: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/app/', '');
            filePath = filePath.replace('/client/components/', '');
            return '@import "' + filePath + '";';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          '<%= yeoman.client %>/css/app.less': [
            '<%= yeoman.client %>/**/*.less',
            '!<%= yeoman.client %>/css/app.less'
          ]
        }
      },
      // Inject component css into index.html
      css: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            '<%= yeoman.client %>/{app,components}/**/*.css'
          ]
        }
      }
    },
  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'env:all', 'env:prod', 'express:prod', 'wait', 'open', 'express-keepalive']);
    }

    if (target === 'debug') {
      return grunt.task.run([
        'clean:server',
        'less',
        'env:all',
        'concurrent:server',
        'injector',
        // 'wiredep',
        'autoprefixer',
        'concurrent:debug'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'less',
      'env:all',
      'concurrent:server',
      'injector',
      // 'wiredep',
      'autoprefixer',
      'express:dev',
      'wait',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', function(target) {
    if (target === 'server') {
      return grunt.task.run([
        'env:all',
        'env:test',
        'mochaTest'
      ]);
    }

    else if (target === 'client') {
      return grunt.task.run([
        'clean:server',
        'less',
        'env:all',
        'concurrent:test',
        'injector',
        'autoprefixer',
        'karma'
      ]);
    }

    else if (target === 'e2e') {
      return grunt.task.run([
        'clean:server',
        'less',
        'env:all',
        'env:test',
        'concurrent:test',
        'injector',
        // 'wiredep',
        'autoprefixer',
        'express:dev',
        'protractor'
      ]);
    }

    else if (target === 'screens') {
      return grunt.task.run([
        'prepare',
        'express:test',
        'protractor:bs2_320x480',
        'protractor:bs3_320x480',
        'protractor:bs2_1024x768',
        'protractor:bs3_1024x768'
      ]);
    }

    else {
      grunt.task.run([
        'test:server',
        'test:client',
        'test:e2e',
        // 'test:screens'  Not a lot of point as not comparing them at the moment
      ]);
    }
  });

  grunt.registerTask('build', [
    'clean:dist',
    'injector:less',
    'concurrent:dist',
    'injector',
    // 'wiredep',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};

//
//
//
//
//
// // Generated on 2014-06-21 using generator-fng 0.0.1-alpha.1
// 'use strict';
//
// // # Globbing
// // for performance reasons we're only matching one level down:
// // 'test/spec/{,*/}*.js'
// // use this if you want to recursively match all subfolders:
// // 'test/spec/**/*.js'
//
// module.exports = function (grunt) {
//
//   // Load grunt tasks automatically
//   require('load-grunt-tasks')(grunt);
//
//   // Time how long tasks take. Can help when optimizing build times
//   require('time-grunt')(grunt);
//
//   // Define the configuration for all the tasks
//   grunt.initConfig({
//
//     // Project settings
//     yeoman: {
//       // configurable paths
//       app: 'app',
//       dist: 'dist'
//     },
//     express: {
//       options: {
//         port: process.env.PORT || 9000
//       },
//       dev: {
//         options: {
//           script: 'server.js',
//           debug: true
//         }
//       },
//       test: {
//         options: {
//           script: 'server.js',
//           debug: true,
//           node_env: 'test'
//         }
//       },
//       prod: {
//         options: {
//           script: 'public/server.js',
//           node_env: 'production'
//         }
//       }
//     },
//     open: {
//       server: {
//         url: 'http://localhost:<%= express.options.port %>'
//       }
//     },
//     watch: {
//       styles: {
//         files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
//         tasks: ['newer:copy:styles', 'autoprefixer']
//       },
//       gruntfile: {
//         files: ['Gruntfile.js']
//       },
//       mochaTest: {
//         files: ['test/server/{,*/}*.js'],
//         tasks: ['env:test', 'mochaTest']
//       },
//       jsTest: {
//         files: ['test/client/spec/{,*/}*.js'],
//         tasks: ['karma']
//       },
//       less: {
//         files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
//         tasks: ['newer:less']
//       },
//
//       livereload: {
//         files: [
//           '<%= yeoman.app %>/partials/{,*//*}*.{html,jade}',
//           '<%= yeoman.app %>/index.html',
//           '{.tmp,<%= yeoman.app %>}/styles/{,*//*}*.css',
//           '{.tmp,<%= yeoman.app %>}/scripts/{,*//*}*.js',
//           '<%= yeoman.app %>/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
//         ],
//
//         options: {
//           livereload: true
//         }
//       },
//       express: {
//         files: [
//           'server.js',
//           'lib/**/*.{js,json}'
//         ],
//         tasks: ['express:dev', 'wait'],
//         options: {
//           livereload: true,
//           nospawn: true //Without this option specified express won't be reloaded
//         }
//       }
//     },
//
//     // Empties folders to start fresh
//     clean: {
//       dist: {
//         files: [{
//           dot: true,
//           src: [
//             '.tmp',
//             '<%= yeoman.dist %>/*',
//             '!<%= yeoman.dist %>/.git*',
//             '!<%= yeoman.dist %>/Procfile'
//           ]
//         }]
//       },
//       heroku: {
//         files: [{
//           dot: true,
//           src: [
//             'heroku/*',
//             '!heroku/.git*',
//             '!heroku/Procfile'
//           ]
//         }]
//       },
//       server: '.tmp'
//     },
//
//     // Add vendor prefixed styles
//     autoprefixer: {
//       options: {
//         browsers: ['last 1 version']
//       },
//       dist: {
//         files: [{
//           expand: true,
//           cwd: '.tmp/styles/',
//           src: '{,*/}*.css',
//           dest: '.tmp/styles/'
//         }]
//       }
//     },
//
//     // Debugging with node inspector
//     'node-inspector': {
//       custom: {
//         options: {
//           'web-host': 'localhost'
//         }
//       }
//     },
//
//     // compile less into css
//     less: {
//       dist: {
//         options: {
//           compile: true
//         },
//         files: {
//           '.tmp/styles/main-bs2.css': ['<%= yeoman.app %>/styles/demo-bs2.less'],
//           '.tmp/styles/main-bs3.css': ['<%= yeoman.app %>/styles/demo-bs3.less']
//         }
//       }
//     },
//
//     // Use nodemon to run server in debug mode with an initial breakpoint
//     nodemon: {
//       debug: {
//         script: 'server.js',
//         options: {
//           nodeArgs: ['--debug-brk'],
//           env: {
//             PORT: process.env.PORT || 9000
//           },
//           callback: function (nodemon) {
//             nodemon.on('log', function (event) {
//               console.log(event.colour);
//             });
//
//             // opens browser on initial server start
//             nodemon.on('config:update', function () {
//               setTimeout(function () {
//                 require('open')('http://localhost:8080/debug?port=5858');
//               }, 500);
//             });
//           }
//         }
//       }
//     },
//
//     // Renames files for browser caching purposes
//     rev: {
//       dist: {
//         files: {
//           src: [
//             '<%= yeoman.dist %>/public/scripts/{,*/}*.js',
//             '<%= yeoman.dist %>/public/styles/{,*/}*.css',
//             '<%= yeoman.dist %>/public/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
//             '<%= yeoman.dist %>/public/styles/fonts/*'
//           ]
//         }
//       }
//     },
//
//     injector: {
//       options: {},
//       scripts: {
//         options: {
//           transform: function(filePath) {
//             filePath = filePath.replace("/app/", "");
//             filePath = filePath.replace("/.tmp/", "");
//             return '<script src="' + filePath + '"></script>';
//           },
//           starttag: "<!-- injector:js -->",
//           endtag: "<!-- endinjector -->"
//         },
//         files: {
//           "<%= yeoman.client %>/index.html": [
//             [
//               "{.tmp,<%= yeoman.client %>}/**/*.js",
//               "!{.tmp,<%= yeoman.client %>}/app.js",
//               "!{.tmp,<%= yeoman.client %>}/**/*.spec.js",
//               "!{.tmp,<%= yeoman.client %>}/**/*.mock.js"
//             ]
//           ]
//         }
//       },
//       // Inject component css into index.html
//       css: {
//         options: {
//           transform: function(filePath) {
//             filePath = filePath.replace("/app/", "");
//             filePath = filePath.replace("/.tmp/", "");
//             return '<link rel="stylesheet" href="' + filePath + '">';
//           },
//           starttag: "<!-- injector:css -->",
//           endtag: "<!-- endinjector -->"
//         },
//         files: {
//           "<%= yeoman.client %>/index.html": ["<%= yeoman.client %>/**/*.css"]
//         }
//       },
//       less: {
//         options: {
//           transform: function(filePath) {
//             filePath = filePath.replace("/app/", "");
//             filePath = filePath.replace("/client/components/", "");
//             return "@import '" + filePath + "';";
//           },
//           starttag: "// injector",
//           endtag: "// endinjector"
//         },
//         files: {
//           "<%= yeoman.client %>/css/app.less": [
//             "<%= yeoman.client %>/**/*.less",
//             "!<%= yeoman.client %>/css/app.less"
//           ]
//         }
//       }
//     },
//
//     // Reads HTML for usemin blocks to enable smart builds that automatically
//     // concat, minify and revision files. Creates configurations in memory so
//     // additional tasks can operate on them
//     useminPrepare: {
//       html: ['<%= yeoman.client %>/index.html'],
//       options: {
//         dest: '<%= yeoman.dist %>',
//         flow: {
//           steps: {
//             js: ['concat', 'uglify'],
//             css: ['concat', 'cssmin']
//           },
//           post: {
//             js: [{
//               name: 'concat',
//               createConfig: function(context, block) {
//                 if (block.dest === 'scripts/vendor.js') {
//                   // We want to tell it how to get hold of the stuff in node_modules folders.  See https://github.com/yeoman/grunt-usemin flow section for details
//                   var vendorObj = _.find(context.options.generated.files, function(obj) {
//                     return (obj.dest === '.tmp/concat/scripts/vendor.js');
//                   });
//                   vendorObj.src = vendorObj.src.map(function(file) {
//                     return 'node_modules/'+ file.slice(4);
//                   });
//                 }
//               }
//             }],
//             css: [{
//               name: 'concat',
//               createConfig: function(context, block) {
//                 if (block.dest === 'styles/main.css') {
//                   // We want to tell it how to get hold of the stuff in node_modules folders.  See https://github.com/yeoman/grunt-usemin flow section for details
//                   var vendorObj = _.find(context.options.generated.files, function(obj) {
//                     return (obj.dest === '.tmp/concat/styles/main.css');
//                   });
//                   vendorObj.src = vendorObj.src.map(function(file) {
//                     return file;
//                     // console.log(file);
//                     // if (file.slice(0,4) === 'css/' || file.slice(0,9) === 'features/' || file.slice(0,11) === 'components/') {
//                     //   console.log(file);
//                     //   return file;
//                     // } else {
//                     //   var retVal = 'node_modules/'+file;
//                     //   console.log(retVal);
//                     //   return retVal;
//                     // }
//                   });
//                 }
//               }
//             }]
//           }
//         }
//       }
//     },
//
//
//     // Performs rewrites based on rev and the useminPrepare configuration
//     usemin: {
//       html: ['<%= yeoman.dist %>/{,*/}*.html'],
//       css: ['<%= yeoman.dist %>/public/styles/{,*/}*.css'],
//       options: {
//         assetsDirs: ['<%= yeoman.dist %>/public']
//       }
//     },
//
//     // The following *-min tasks produce minified files in the dist folder
//     imagemin: {
//       options : {
//         cache: false
//       },
//       dist: {
//         files: [{
//           expand: true,
//           cwd: '<%= yeoman.app %>/images',
//           src: '{,*/}*.{png,jpg,jpeg,gif}',
//           dest: '<%= yeoman.dist %>/public/images'
//         }]
//       }
//     },
//
//     svgmin: {
//       dist: {
//         files: [{
//           expand: true,
//           cwd: '<%= yeoman.app %>/images',
//           src: '{,*/}*.svg',
//           dest: '<%= yeoman.dist %>/public/images'
//         }]
//       }
//     },
//
//     htmlmin: {
//       dist: {
//         options: {
//           //collapseWhitespace: true,
//           //collapseBooleanAttributes: true,
//           //removeCommentsFromCDATA: true,
//           //removeOptionalTags: true
//         },
//         files: [{
//           expand: true,
//           cwd: '<%= yeoman.app %>',
//           src: ['*.html', 'partials/**/*.html'],
//           dest: '<%= yeoman.dist %>'
//         }]
//       }
//     },
//
//     // Allow the use of non-minsafe AngularJS files. Automatically makes it
//     // minsafe compatible so Uglify does not destroy the ng references
//     ngAnnotate: {
//       dist: {
//         files: [{
//           expand: true,
//           cwd: '.tmp/concat/scripts',
//           src: '*.js',
//           dest: '.tmp/concat/scripts'
//         }]
//       }
//     },
//
//     // Copies remaining files to places other tasks can use
//     copy: {
//       dist: {
//         files: [{
//           expand: true,
//           dot: true,
//           cwd: '<%= yeoman.app %>',
//           dest: '<%= yeoman.dist %>/public',
//           src: [
//             '*.{ico,png,txt}',
//             '.htaccess',
//             'images/{,*/}*.{webp}',
//             'fonts/**/*'
//           ]
//         }, {
//           expand: true,
//           dot: true,
//           cwd: 'node_modules/components-font-awesome',
//           dest: '<%= yeoman.dist %>',
//           src: 'font/**/*'
//         // }, {
//         //   expand: true,
//         //   cwd: 'node_modules/select2/select2-bootstrap.css',
//         //   dest: '<%= yeoman.dist %>/public/styles',
//         //   src: ['*']
//         }, {
//           expand: true,
//           cwd: 'node_modules/jquery-ui/themes/base/images/',
//           dest: '<%= yeoman.dist %>/public/styles/images',
//           src: ['*']
//         }, {
//           expand: true,
//           cwd: '.tmp/images',
//           dest: '<%= yeoman.dist %>/public/images',
//           src: ['generated/*']
//         }, {
//           expand: true,
//           dest: '<%= yeoman.dist %>',
//           src: [
//             'package.json',
//             'server.js',
//             'lib/**/*'
//           ]
//         }]
//       },
//       styles: {
//         expand: true,
//         cwd: '<%= yeoman.app %>/styles',
//         dest: '.tmp/styles/',
//         src: '{,*/}*.css'
//       },
//       maincss: {
//         expand: true,
//         cwd: '.tmp/styles/',
//         dest: '<%= yeoman.dist %>/public/styles',
//         src: '{,*/}*.css'
//       }
//     },
//
//     // Run some tasks in parallel to speed up the build process
//     concurrent: {
//       server: [
//         'copy:styles'
//       ],
//       test: [
//         'copy:styles'
//       ],
//       debug: {
//         tasks: [
//           'nodemon',
//           'node-inspector'
//         ],
//         options: {
//           logConcurrentOutput: true
//         }
//       },
//       dist: [
//         'copy:styles',
//         'imagemin',
//         'svgmin',
//         'htmlmin'
//       ]
//     },
//
//     // By default, your `index.html`'s <!-- Usemin block --> will take care of
//     // minification. These next options are pre-configured if you do not wish
//     // to use the Usemin blocks.
// //    cssmin: {
// //       dist: {
// //         files: {
// //           '<%= yeoman.dist %>/styles/main.css': [
// //             '.tmp/styles/{,*/}*.css',
// //             '<%= yeoman.app %>/styles/{,*/}*.css'
// //           ]
// //         }
// //       }
// //    },
//     uglify: {
//       options: {
//         compress: {
//           drop_console: true
//         }
//       }
//     },
//
//     concat: {
//       options: {
//         process: function(src, filepath) {
//           // output an extra semicolon when concatenating javascripts
//           if (/\.js$/.test(filepath)) {
//             return src + ";";
//           }
//
//           return src;
//         }
//       }
//     },
//
//     // Test settings
//     karma: {
//       unit: {
//         configFile: 'test/karma.conf.js',
//         singleRun: true
//       }
//     },
//
//     mochaTest: {
//       options: {
//         reporter: 'spec'
//       },
//       src: ['test/server/**/*.js']
//     },
//
//     protractor: {
//       options: {
//         // args: {
//         //   seleniumServerJar: 'node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar'
//         // },
//         keepAlive: false, // If false, the grunt process stops when the test fails.
//         noColor: false // If true, protractor will not use colors in its output.
//       },
//       bs2_320x480: {
//         configFile: "test/screen_tests/chrome-bs2-320x480.conf.js"
//       },
//       bs3_320x480: {
//         configFile: "test/screen_tests/chrome-bs3-320x480.conf.js"
//       },
//       bs2_1024x768: {
//         configFile: "test/screen_tests/chrome-bs2-1024x768.conf.js"
//       },
//       bs3_1024x768: {
//         configFile: "test/screen_tests/chrome-bs3-1024x768.conf.js"
//       },
//       e2e: {
//         configFile: "test/e2e/protractor-chrome.conf.js"
//       }
//     },
//
//     env: {
//       test: {
//         NODE_ENV: 'test'
//       }
//     }
//   });
//
//   // Used for delaying livereload until after server has restarted
//   grunt.registerTask('wait', function () {
//     grunt.log.ok('Waiting for server reload...');
//
//     var done = this.async();
//
//     setTimeout(function () {
//       grunt.log.writeln('Done waiting!');
//       done();
//     }, 500);
//   });
//
//   grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
//     this.async();
//   });
//
//   grunt.registerTask('prepare', [
//     'clean:server',
//     // 'wiredep',
//     'less',
//     'concurrent:server',
//     'autoprefixer'
//   ]);
//
//   grunt.registerTask('serve', function (target) {
//     if (target === 'dist') {
//       return grunt.task.run([
//         'build',
//         'express:prod',
//         'open',
//         'express-keepalive'
//       ]);
//     }
//
//     if (target === 'debug') {
//       return grunt.task.run([
//         'prepare',
//         'concurrent:debug'
//       ]);
//     }
//
//     grunt.task.run([
//       'prepare',
//       'express:dev',
//       'open',
//       'watch'
//     ]);
//   });
//
//   grunt.registerTask('server', function () {
//     grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
//     grunt.task.run(['serve']);
//   });
//
//   grunt.registerTask('test', function(target) {
//     if (target === 'server') {
//       return grunt.task.run([
//         'env:test',
//         'mochaTest'
//       ]);
//     }
//
//     else if (target === 'client') {
//       return grunt.task.run([
//         'clean:server',
//         'concurrent:test',
//         'autoprefixer',
//         //'karma'
//       ]);
//     }
//
//     else if (target === 'e2e') {
//       return grunt.task.run([
//         'prepare',
//         'express:test',
//         'protractor:e2e'
//       ]);
//     }
//
//     else if (target === 'screens') {
//       return grunt.task.run([
//         'prepare',
//         'express:test',
//         'protractor:bs2_320x480',
//         'protractor:bs3_320x480',
//         'protractor:bs2_1024x768',
//         'protractor:bs3_1024x768'
//       ]);
//     }
//
//     else {
//       grunt.task.run([
//         'test:server',
//         'test:client',
//         'test:e2e',
//         // 'test:screens'  Not a lot of point as not comparing them at the moment
//       ]);
//     }
//   });
//
//   grunt.registerTask('build', [
//     // 'clean:dist',
//     // // 'wiredep',
//     // 'less',
//     // 'useminPrepare',
//     // 'concurrent:dist',
//     // 'autoprefixer',
//     // 'concat',
//     // 'ngAnnotate',
//     // 'copy:dist',
//     // 'cssmin',
//     // 'uglify',
//     // 'rev',
//     // 'usemin',
//     // 'copy:maincss'
//     'clean:dist',
//     'injector:less',
//     'concurrent:dist',
//     'injector',
//     'useminPrepare',
//     'autoprefixer',
//     'ngtemplates',
//     'concat',
//     'copy:dist',
//     'cssmin',
//     'copy:preuglify',
//     'uglify:mygen',
//     'copy:uglified',
//     'rev',
//     'usemin',
//     'copy:thirdPartyAssets'
//   ]);
//
//   grunt.registerTask('heroku', function () {
//     grunt.log.warn('The `heroku` task has been deprecated. Use `grunt build` to build for deployment.');
//     grunt.task.run(['build']);
//   });
//
//   grunt.registerTask('default', [
//     'test',
//     'build'
//   ]);
// };
