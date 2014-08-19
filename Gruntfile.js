/* Gruntfile.js */
module.exports = function(grunt) {
 
// Project configuration.
grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
   // Tasks to go below here
	compass: {
		dev: {
			options: {
				/* Either use your config.rb for settings, or state them here */
				//config: 'config.rb'
				require:['susy'],
				httpPath:"/",
				sassDir:"site/assets/stylesheets/src",
				cssDir:"site/assets/stylesheets/build",
				imagesDir:"site/assets/images",
				javascriptsDir:"site/assets/js",
				fontsDir:"site/assets/fonts",
				outputStyle:"compact",
				noLineComments:true,
				relativeAssets:true,
				raw: "preferred_syntax = :sass\n"
			}
		}
	},
	watch: {
		styles: {
			files: ['site/assets/stylesheets/src/**/*.scss'],
			tasks: ['compass'],
			options: {
				spawn: false,
			}
		}
	}
});
 
// Load plugins here
grunt.loadNpmTasks('grunt-contrib-compass');
grunt.loadNpmTasks('grunt-contrib-watch');

// Default task(s).
grunt.registerTask('default', []);
grunt.registerTask('dev', ['watch']);

};