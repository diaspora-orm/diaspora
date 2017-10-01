'use strict';

/* global module: false */

require( 'chalk' );
const path = require( 'path' );

module.exports = function gruntInit( grunt ) {
	// Project configuration.

	const baseDocPath = 'site';
	const doccoPath = `${ baseDocPath }/docco`;
	const jsdocPath = `${ baseDocPath }/jsdoc`;
	const jsAssets = /*['lib/adapters/baseAdapter.js'] ||*/ [
		'Gruntfile.js',
		'diaspora.js',
		'lib/**/*.js',
		'!node_modules/**/*',
	];
	const jsFilesWTests = jsAssets.concat([
		'test/**/*.js',
	]);

	grunt.initConfig({
		pkg:    grunt.file.readJSON( 'package.json' ),
		eslint: {
			options: {
				format:     'stylish', //'node_modules/eslint-tap',
				fix:        true,
				configFile: 'eslint-es6-node.json',
			},
			info: {
				options: {
					silent: true,
				},
				src: jsFilesWTests,
			},
			strict: {
				options: {},
				src:     jsFilesWTests,
			},
		},
		docco_husky: {
			files: {
				expand: true,
				src:    jsFilesWTests,
			},
			output_dir:   doccoPath,
			project_name: 'Diaspora',
			template_dir: 'node_modules/diaspora_doc/docco',
			readme:       'README-docco.md',
		},
		jsdoc: {
			src:     jsAssets,
			options: {
				private:     true,
				destination: jsdocPath,
				config:      `${ baseDocPath }/jsdoc.json`, 
				template:    'node_modules/diaspora_doc/jsdoc',
				readme:      'README-jsdoc.md',
			},
		},
		browserify: {
			options: {
				browserifyOptions: {
					standalone: 'Diaspora',
				},
			},
			standalone: {
				src:     [ 'diaspora.js' ],
				require: [
					[ 'lodash', {
						entry:  true,
						expose: '_',
					}],
					[ 'bluebird', {
						entry:  true,
						expose: 'Promise',
					}],
					[ 'sequential-event', {
						entry:  true,
						expose: 'SequentialEvent',
					}],
				],
				dest: 'build/standalone/src/diaspora.js',	
			},
			isolated: {
				options: {
					external: [ 'lodash', 'bluebird', 'sequential-event' ],
				},
				src:  [ 'diaspora.js' ],
				dest: 'build/isolated/src/diaspora.js',	
			},
		},
		babel: {
			options: {
				sourceMap: true,
				presets:   [ 'es2015' ],
			},
			standalone: {
				files: [{
					expand: true,
					cwd:    'build/standalone/src',
					src:    [ 'diaspora.js' ],
					dest:   'build/standalone/dist',
					ext:    '.js',
				}],
			},
			isolated: {
				files: [{
					expand: true,
					cwd:    'build/isolated/src',
					src:    [ 'diaspora.js' ],
					dest:   'build/isolated/dist',
					ext:    '.js',
				}],
			},
		},
		uglify: {
			options: {
				banner:    '/*! <%= pkg.name %> build on <%= grunt.template.today("yyyy-mm-dd hh:MM:ss") %> for v<%= pkg.version %> */',
				sourceMap: true,
				output:    {
					comments: 'some',
				},
			},
			standalone: {
				files: [{
					expand: true,
					src:    [ 'build/standalone/dist/diaspora.js' ],
					dest:	  '.',
					rename: ( dst, src ) => path.resolve( dst, src.replace( /\.js$/, '.min.js' )),
				}],
			},
			isolated: {
				files: [{
					expand: true,
					src:    [ 'build/isolated/dist/diaspora.js' ],
					dest:	  '.',
					rename: ( dst, src ) => path.resolve( dst, src.replace( /\.js$/, '.min.js' )),
				}],
			},
		},
		copy: {
			diaspora_to_docs_site: {
				files: [{
					expand: true,
					cwd:    './build/standalone/dist/',
					src:    [ './diaspora*.js*' ],
					dest:   `${ baseDocPath }/assets/js/`,
				}],
			},
		},
		/*		markdown: {
			index: {
				files: [
					{
						src:  'README.md',
						dest: 'docs/index.html',
						ext:  '.html',
					},
				],
				options: {
					templateContext:    {},
					contextBinder:      false,
					contextBinderMark:  '@@@',
					autoTemplate:       true,
					autoTemplateFormat: 'jst',
					markdownOptions:    {
						gfm:       true,
						highlight: 'manual',
						codeLines: {
							before: '<span>',
							after:  '</span>',
						},
					},
				},
			},
		},*/
	});

	grunt.loadNpmTasks( 'grunt-jsdoc' );
	grunt.loadNpmTasks( 'grunt-docco-husky' );
	grunt.loadNpmTasks( 'grunt-markdown' );
	grunt.loadNpmTasks( 'gruntify-eslint' );
	grunt.loadNpmTasks( 'grunt-changed' );
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );

	require( 'load-grunt-tasks' )( grunt );

	grunt.registerTask( 'documentate', [
		'lint',
		'jsdoc',
		'docco_husky',
	]);
	grunt.registerTask( 'refreshScripts', [
		'lint',
		'buildStandalone',
		'buildIsolated',
	]);
	grunt.registerTask( 'buildStandalone', [
		'browserify:standalone',
		'babel:standalone',
		'uglify:standalone',
		'copy:diaspora_to_docs_site',
	]);
	grunt.registerTask( 'buildIsolated', [
		'browserify:isolated',
		'babel:isolated',
		'uglify:isolated',
	]);
	grunt.registerTask( 'lint', [
		'eslint:info',
	]);
	grunt.registerTask( 'all', [
		'refreshScripts',
		'documentate',
	]);
};
