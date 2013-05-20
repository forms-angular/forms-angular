module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        builddir: 'js-build',
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/**\n' + ' * <%= pkg.description %>\n' +
                ' * @version v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * @link <%= pkg.homepage %>\n' +
                ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' + ' */'
        },
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['app/js/<%= pkg.name %>.js', 'app/js/controllers/*.js', 'app/js/directives/*.js', 'app/js/filters/*.js', 'app/js/services/*.js'],
                dest: '<%= builddir %>/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: '<%= builddir %>/<%= pkg.name %>.js',
                dest: '<%= builddir %>/<%= pkg.name %>.min.js'
            }
        },
        lint: {
            files: ['grunt.js', 'common/**/*.js', 'modules/**/*.js']
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);
};