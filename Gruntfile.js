'use strict';

/* global module: false */

require( 'chalk' );
const path = require( 'path' );

module.exports = function gruntInit( grunt ) {
	// Project configuration.

	const baseDocPath = 'site';
	const testFiles = ['index.js', 'defineGlobals.js', 'models/**/*.js', 'adapters/index.js', 'adapters/inMemory.js', 'adapters/localStorage.js', 'adapters/utils.js', 'testApps/**/*.js'];
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
				options: {
					browserifyOptions: {
						standalone: 'Diaspora',
					},
				},
			},
			isolated: {
				options: {
					external: [ 'lodash', 'bluebird', 'sequential-event' ],
					browserifyOptions: {
						standalone: 'Diaspora',
					},
				},
				src:  [ 'diaspora.js' ],
				dest: 'build/isolated/src/diaspora.js',	
			},
			test: {
				src:     testFiles.map(v =>  './test/browser/sources/' + v),
				dest:    'test/browser/unit-tests.js',
				options: {
					alias: {
/*						'./adapters/index.js': './test/browser/sources/adapters/index.js',
						'./inMemory.js': './test/browser/sources/adapters/inMemory.js',
						'./localStorage.js': './test/browser/sources/adapters/localStorage.js',
						'./models/index.js': './test/browser/sources/models/index.js',
						'./simple.js': './test/browser/sources/models/simple.js',
						'./simple-remapping.js': './test/browser/sources/models/simple-remapping.js',
						'./validations.js': './test/browser/sources/models/validations.js',*/
					},
//					require:  grunt.file.expand(testFiles.filter(v => v !== 'index.js').map(v => './test/browser/sources/' + v)).map(v => path.relative('./test/browser/sources', v)),
					exclude: [ './browser/selenium.js', './config.js', 'chai', '../diaspora', 'path', 'chalk', 'stack-trace', 'expect.js', 'node-localstorage', 'fs' ],
				},
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
			test: {
				options: {
					sourceMap: false,
				},
				files: [{
					expand: true,
					cwd:    'test',
					src:    testFiles,
					dest:   'test/browser/sources',
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
		clean: {
			doc_jsdoc: {
				src: [ 'site/jsdoc' ],
			},
			doc_docco: {
				src: [ 'site/docco' ],
			},
		},
	});

	grunt.loadNpmTasks( 'grunt-jsdoc' );
	grunt.loadNpmTasks( 'grunt-docco-husky' );
	grunt.loadNpmTasks( 'grunt-markdown' );
	grunt.loadNpmTasks( 'gruntify-eslint' );
	grunt.loadNpmTasks( 'grunt-changed' );
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );

	require( 'load-grunt-tasks' )( grunt );

	grunt.registerTask( 'documentate', [
		'lint',
		'clean:doc_jsdoc',
		'clean:doc_docco',
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
	grunt.registerTask('refreshTests', [
		'babel:test',
		'browserify:test',
	]);
};
