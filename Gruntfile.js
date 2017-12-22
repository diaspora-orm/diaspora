'use strict';

/* global module: false */

const path = require( 'path' );

module.exports = grunt => {
	// Project configuration.

	const baseDocPath = 'doc';
	const testFiles = [ 'index.js', 'defineGlobals.js', 'models/**/*.js', 'adapters/index.js', 'adapters/inMemory.js', 'adapters/webStorage.js', 'adapters/utils.js', 'testApps/**/*.js' ];
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
		'!test/browser/**/*.js',
		'test/browser/selenium.js',
	]);
	const depsShim = {
		lodash: {
			path:    'node_modules/lodash/lodash.min.js',
			exports: '_',
		},
		'sequential-event': {
			path:    'node_modules/sequential-event/dist/sequential-event.min.js',
			exports: 'SequentialEvent',
		},
		bluebird: {
			path:    'node_modules/bluebird/js/browser/bluebird.min.js',
			exports: 'Promise',
		},
	};
	const babelPluginExtend = [
		/*		'babel-plugin-syntax-async-functions',
		[ 'babel-plugin-transform-async-to-module-method', {
			module: 'bluebird',
			method: 'coroutine',
		}],
		'babel-plugin-transform-regenerator',
		'babel-plugin-transform-runtime',*/

		[ 'transform-builtin-extend', {
			globals:     [ 'Error' ],
			approximate: true,
		}],
		//		'@babel/transform-runtime',
	];
	const browserifyOptionsDiaspora = {
		standalone: 'Diaspora',
		//transform:  [[ require( 'browserify-ignore-code' ) ]],
	};

	grunt.initConfig({
		pkg:    grunt.file.readJSON( 'package.json' ),
		eslint: {
			options: {
				format: 'stylish', //'node_modules/eslint-tap',
				fix:    true,
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
		/*		docco_husky: {
			files: {
				expand: true,
				src:    jsFilesWTests,
			},
			output_dir:   doccoPath,
			project_name: 'Diaspora',
			template_dir: 'node_modules/diaspora_doc/docco',
			readme:       'README-docco.md',
		},*/
		jsdoc: {
			src:     /*['lib/adapters/baseAdapter.js'],*/jsAssets,
			options: {
				private:     true,
				destination: jsdocPath,
				config:      `${ baseDocPath }/jsdoc.json`,
				template:    'node_modules/diaspora_doc/jsdoc',
				readme:      'README-jsdoc.md',
			},
		},
		browserify: {
			deps: {
				options: {
					shim: depsShim,
				},
				src:  [ 'node_modules/lodash/lodash.min.js', 'node_modules/sequential-event/dist/sequential-event.min.js', 'node_modules/bluebird/js/browser/bluebird.min.js' ],
				dest: 'build/dependencies/src/dependencies.js',
			},
			standalone: {
				src:     [ 'diaspora.js' ],
				dest:    'build/standalone/src/diaspora.js',
				options: {
					browserifyOptions: browserifyOptionsDiaspora,
					shim:              depsShim,
					exclude:           [
						'winston',
						'request',
						'request-promise',
					],
				},
			},
			isolated: {
				options: {
					browserifyOptions: browserifyOptionsDiaspora,
					exclude:           [
						'lodash',
						'bluebird',
						'sequential-event',
						'winston',
						'request',
						'request-promise',
					],
				},
				src:  [ 'diaspora.js' ],
				dest: 'build/isolated/src/diaspora.js',
			},
			test: {
				src:     testFiles.map( v =>  `./test/${  v }` ),
				dest:    'test/browser/unit-tests.es6.js',
				options: {
					alias: {
						'/test/adapters/index.js':          './test/adapters/index.js',
						'/test/adapters/baseAdapter.js':    './test/adapters/baseAdapter.js',
						'/test/adapters/inMemory.js':       './test/adapters/inMemory.js',
						'/test/adapters/webStorage.js':     './test/adapters/webStorage.js',
						'/test/adapters/webApi.js':         './test/adapters/webApi.js',
						'/test/models/index.js':            './test/models/index.js',
						'/test/models/simple.js':           './test/models/simple.js',
						'/test/models/simple-remapping.js': './test/models/simple-remapping.js',
						'/test/models/validations.js':      './test/models/validations.js',
						'/test/models/components.js':       './test/models/components.js',
						'/test/validation.js':              './test/validation.js',
					},
					exclude: [ './browser/selenium.js', './config.js', 'chai', '../diaspora', 'path', 'chalk', 'stack-trace', 'expect.js', 'node-localstorage', 'fs' ],
					options: {
						browserifyOptions: {
							fullPaths: false,
						},
					},
				},
			},
		},
		babel: {
			options: {
				sourceMap: true,
				presets:   [
					[ '@babel/env', {
						modules: 'umd', //"amd" | "umd" | "systemjs" | "commonjs" | false
						targets: {
							browsers: [ 'last 2 Chrome versions', '>= 1%' ],
						},
						//						uglify:      false,
						loose:       true,
						debug:       true,
						useBuiltIns: 'usage',
					}],
					//					'es2017',
				],
				//				plugins: [ 'babel-plugin-proxy' ],
			},
			deps: {
				options: {
					sourceMap: false,
				},
				files: [{
					expand: true,
					cwd:    'build/dependencies/src',
					src:    [ 'dependencies.js' ],
					dest:   'build/dependencies/dist',
					ext:    '.js',
				}],
			},
			standalone: {
				options: {
					plugins: babelPluginExtend.concat([
						[ '@comandeer/babel-plugin-banner', {
							banner: `/**
* @file <%= pkg.name %>
*
* <%= pkg.description %>
* Standalone build compiled on <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>
*
* @license <%= pkg.license %>
* @version <%= pkg.version %>
* @author <%= pkg.author %>
*/`,
						}],
					]),
				},
				files: [{
					expand: true,
					cwd:    'build/standalone/src',
					src:    [ 'diaspora.js' ],
					dest:   'build/standalone/dist',
					ext:    '.js',
				}],
			},
			isolated: {
				options: {
					plugins: babelPluginExtend.concat([
						[ '@comandeer/babel-plugin-banner', {
							banner: `/**
* @file <%= pkg.name %>
*
* <%= pkg.description %>
* Isolated build compiled on <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>
*
* @license <%= pkg.license %>
* @version <%= pkg.version %>
* @author <%= pkg.author %>
*/`,
						}],
					]),
				},
				files: [{
					expand: true,
					cwd:    'build/isolated/src',
					src:    [ 'diaspora.js' ],
					dest:   'build/isolated/dist',
					ext:    '.js',
				}],
			},
			test: {
				options: {
					sourceMap: false,
				},
				files: [{
					expand: true,
					src:    'test/browser/unit-tests.es6.js',
					dest:   './',
					ext:    '.js',
				}],
			},
		},
		uglify: {
			options: {
				sourceMap: true,
				output:    {
					comments: 'some',
				},
			},
			deps: {
				options: {
					banner:    false,
					sourceMap: false,
				},
				files: [{
					expand: true,
					src:    [ 'build/dependencies/dist/dependencies.js' ],
					dest:	  '.',
					rename: ( dst, src ) => path.resolve( dst, src.replace( /\.js$/, '.min.js' )),
				}],
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
			build_isolated_to_dist: {
				files: [{
					expand: true,
					cwd:    './build/isolated/dist/',
					src:    [ './diaspora*.js*' ],
					dest:   'dist/isolated',
				}],
			},
			build_standalone_to_dist: {
				files: [{
					expand: true,
					cwd:    './build/standalone/dist/',
					src:    [ './diaspora*.js*' ],
					dest:   'dist/standalone',
				}],
			},
			diaspora_to_docs_site: {
				files: [{
					expand: true,
					cwd:    './dist/standalone',
					src:    [ './diaspora.min.js*' ],
					dest:   `${ baseDocPath }/assets/js/`,
				}],
			},
			unit_tests: {
				files: [{
					expand: true,
					cwd:    './test/browser',
					src:    [ 'unit-tests.js' ],
					dest:   `${ baseDocPath }/assets/js/tests`,
				}],
			},
			diaspora_isolated_to_docs_site_tests: {
				files: [{
					expand: true,
					cwd:    './dist/isolated',
					src:    [ './diaspora.min.js*' ],
					dest:   `${ baseDocPath }/assets/js/tests/isolated`,
				}],
			},
		},
		clean: {
			doc_jsdoc: {
				src: [ `${ baseDocPath }/jsdoc` ],
			},
			doc_docco: {
				src: [ `${ baseDocPath }/docco` ],
			},
		},
	});

	grunt.loadNpmTasks( 'grunt-jsdoc' );
	//	grunt.loadNpmTasks( 'grunt-docco-husky' );
	grunt.loadNpmTasks( 'gruntify-eslint' );
	grunt.loadNpmTasks( 'grunt-changed' );
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );

	require( 'load-grunt-tasks' )( grunt );

	// ## Utils
	grunt.registerTask( 'lint', [
		'eslint:info',
	]);
	grunt.registerTask( 'documentate', [
		'lint',
		'clean:doc_jsdoc',
		'clean:doc_docco',
		'jsdoc',
		//		'docco_husky',
	]);
	grunt.registerTask( 'all', [
		'build',
		'documentate',
	]);

	// ## Builds
	// ### Tests
	grunt.registerTask( 'buildTests', [
		'lint',
		'browserify:test',
		'babel:test',
		'copy:unit_tests',
	]);
	// ### Dists
	grunt.registerTask( 'buildDependencies', [
		'browserify:deps',
		'babel:deps',
		'uglify:deps',
	]);
	grunt.registerTask( 'buildStandalone', [
		'lint',
		'browserify:standalone',
		'babel:standalone',
		'uglify:standalone',
		'copy:build_standalone_to_dist',
		'copy:diaspora_to_docs_site',
	]);
	grunt.registerTask( 'buildIsolated', [
		'lint',
		'browserify:isolated',
		'babel:isolated',
		'uglify:isolated',
		'copy:build_isolated_to_dist',
		'copy:diaspora_isolated_to_docs_site_tests',
	]);
	// -----
	// ### Combined
	grunt.registerTask( 'buildNoTests', [
		'buildStandalone',
		'buildIsolated',
	]);
	grunt.registerTask( 'build', [
		'buildNoTests',
		'buildTests',
	]);
};
