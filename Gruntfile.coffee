module.exports = (grunt) ->
    "use strict"

    grunt.initConfig
        clean: ["dist/"]

        copy:
            release:
                files: [
                    {
                        src: [
                            'manifest.json'
                            'popup.html'
                            'css/*.css'
                            'images/**'
                            'sounds/**'
                        ]
                        dest: 'dist'
                        filter: 'isFile'
                        expand: true
                    },
                    {
                        src: [
                            'fonts/**'
                        ]
                        cwd: 'vendor/bower/fontawesome/'
                        dest: 'dist'
                        filter: 'isFile'
                        expand: true
                    }
                ]

        less:
            dist:
                options:
                    cleancss: true
                    paths: ['css']
                files:
                    'dist/css/style.min.css': 'css/app.less'

        uglify:
            dist:
                # options:
                #     # For debugging/testing
                #     beautify: true
                #     preserveComments: true;
                files:
                    'dist/js/common.min.js': [
                        'js/lib/ga.js'

                        'vendor/bower/jquery/dist/jquery.js'
                        'vendor/bower/countdown/dest/jquery.countdown.js'
                        'vendor/bower/jQuery-Storage-API/jquery.storageapi.js'

                        'js/functions.js'
                    ]
                    'dist/js/background.min.js': [
                        'vendor/bower/moment/moment.js'
                        'vendor/bower/moment-timezone/builds/moment-timezone-with-data-2010-2020.js'

                        'js/background-functions.js'
                        'js/background-main.js'
                    ]
                    'dist/js/frontend.min.js': [
                        'vendor/bower/bootstrap/js/button.js'
                        'vendor/bower/bootstrap/js/tab.js'

                        'vendor/bower/jquery.slimscroll/jquery.slimscroll.js'

                        'js/livebomb.js'
                    ]

        watch:
            less:
                files: ['css/*.less']
                tasks: ['less']
            copy:
                files: ['manifest.json', 'popup.html', 'css/*.css', 'images/*', 'sounds/*']
                tasks: ['copy']
            uglify:
                files: ['js/*']
                tasks: ['uglify']


    # Grunt Contrib Tasks
    grunt.loadNpmTasks "grunt-contrib-clean"
    grunt.loadNpmTasks "grunt-contrib-copy"
    grunt.loadNpmTasks "grunt-contrib-uglify"
    grunt.loadNpmTasks "grunt-contrib-watch"
    grunt.loadNpmTasks "grunt-contrib-less"

    # Grunt Tasks
    grunt.registerTask "default", [
        "clean", "copy", "less", "uglify"
    ]

    grunt.registerTask "dev", [
        "clean", "copy", "less", "uglify", "watch"
    ]
