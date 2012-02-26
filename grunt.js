config.init({
	lint: {
		files: [ "grunt.js", "lib/*.js" ]
	}
});

task.registerTask( "default", "lint" );
