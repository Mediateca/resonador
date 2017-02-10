module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            css: {
                files: ['**/*.scss'],
                tasks: ['sass']
            },
            scripts: {
                files: ['src/js/**/*.js'],
                tasks: ['uglify']
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            src: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/js',
                        src: '**/*.js',
                        dest: 'dist',
                        ext: '.min.js'
                    }
                ]
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: [{expand: true, cwd: 'src/sass', src: '**/*.scss', dest: 'dist/assets/css', ext: '.min.css'}]
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: [
                            'node_modules/angular/angular.min.js',
                            'node_modules/angular-animate/angular-animate.min.js',
                            'node_modules/angular-aria/angular-aria.min.js',
                            'node_modules/angular-material/angular-material.min.js',
                            'node_modules/angular-messages/angular-messages.min.js',
                            'node_modules/angular-route/angular-route.min.js',
                            'node_modules/angular-sanitize/angular-sanitize.min.js',
                            'node_modules/angularfire/dist/angularfire.min.js',
                            'node_modules/ngclipboard/dist/ngclipboard.min.js',
                            'node_modules/ngclipboard/node_modules/clipboard/dist/clipboard.min.js',
                            'node_modules/angular-material-expansion-panel/dist/md-expansion-panel.min.js',
                            'node_modules/ng-file-upload/dist/ng-file-upload-all.min.js'
                        ],
                        dest: 'dist/assets/js/',
                        flatten: true
                    },
                    {
                        expand: true,
                        src: ['node_modules/firebase/firebase.js'],
                        rename: function () {
                            return 'dist/assets/js/firebase.min.js';
                        }
                    },
                    {
                        expand: true, cwd: 'node_modules/font-awesome/fonts/', src: '**', dest: 'dist/assets/fonts/'
                    },
                    {
                        expand: true, cwd: 'node_modules/font-awesome/scss/', src: ['**', '!font-awesome.scss'], dest: 'src/sass/fontawesome/'
                    },
                    {
                        expand: true,
                        src: ['node_modules/font-awesome/scss/font-awesome.scss'],
                        rename: function () {
                            return 'src/sass/fontawesome/_font-awesome.scss';
                        }
                    },
                    {
                        expand: true,
                        src: ['node_modules/angular-material/angular-material.scss'],
                        rename: function () {
                            return 'src/sass/angular-material/_angular-material.scss';
                        }
                    },
                ],
            },
        }/*,
        ftp_push: {
            your_target: {
                options: {
                    authKey: "DevC3-6",
                    host: "ftp.c3visual.com",
                    dest: "/",
                    port: 21
                },
                */
                //files: [{expand: true, cwd: 'dist', src: '**/*'}]
                /*
            }
        }*/
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //grunt.loadNpmTasks('grunt-ftp-push');
    
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('actualizar', ['copy', 'sass', 'uglify']);
    //grunt.registerTask('deploy', ['copy', 'sass', 'uglify', 'ftp_push']);
};