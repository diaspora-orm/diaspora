'use strict';

/* global module: false */

require( 'chalk' );
//const fs = require( 'fs' );
const _ = require( 'lodash' );
const path = require( 'path' );
//const textReplace = require('grunt-text-replace/lib/grunt-text-replace');

module.exports = function gruntInit( grunt ) {
	// Project configuration.

	const baseDocPath = 'docs';
	const jsAssets = [
		'Gruntfile.js',
		'js/**/*.js',
		'!js/**/*.min.js',
		'!js/dependencies/**',
		'!node_modules/**',
		'tests/**/*.js',
	];
	const lessFiles = [{
		expand: true,
		cwd:    'public/src/less',
		src:    [ '**.less' ],
		dest:   'public/dist/css',
		rename: ( dst, src ) => path.resolve( dst, src.replace( /\.less$/, '.css' )),
	}];
	const lesslint = {
		files:   lessFiles,
		options: {
			csslint: {
				'box-sizing':         false,
				'adjoining-classes':  false,
				'qualified-headings': false,
				'universal-selector': false,
				'ids':                false,
				'unique-headings':    false,
			},
			failOnError: false,
		},
	};

	grunt.initConfig({
		pkg:    grunt.file.readJSON( 'package.json' ),
		uglify: {
			options: {
				preserveComments: 'some',
			},
			public_js: {
				options: {
					banner:    '/*! <%= pkg.name %> build on <%= grunt.template.today("yyyy-mm-dd hh:MM:ss") %> for v<%= pkg.version %> */',
					sourceMap: false,
					footer:    '/**/',
				},
				files: [
					{
						expand: true,
						src:    [ 'public/src/js/**.*js', '!**/*.min.js' ],
						dest:   'public/dist/js',
						cwd:    'public/src/js',
						rename: ( dst, src ) => path.resolve( dst, src.replace( /\.js$/, '.min.js' )),
					},
				],
			},
		},
		cssmin: {
			public_css: {
				files: [
					{
						expand: true,
						cwd:    'public/src/css',
						src:    [ 'public/src/css/**/*.css' ],
						dest:   'public/dist/css',
					},
				],
			},
		},
		copy: {
			public_other: {
				files: [
					{
						expand: true,
						cwd:    'public/src',
						src:    [ '**', '!less/**', 'css/**/*.css', '!js/**', '!images/**/*.{png,jpg,gif,svg}', 'js/**/*.min.js' ],
						dest:   'public/dist',
						rename: ( dst, src ) => path.resolve( dst, src.replace( /\.min\.js$/, '.js' )),
					},
				],
			},
		},
		eslint: {
			options: {
				format: 'stylish', //'node_modules/eslint-tap',
				fix:    true,
			},
			info: {
				options: {
					configFile: 'eslint-es6-browser.json',
					silent:     true,
				},
				src: _.concat([], jsAssets, [
					'public/src/js/**.js',
					'!public/src/js/**.min.js',
					'!public/src/js/require.js',
					'!public/src/js/dren.js',
					'!public/src/js/default-xhr.js',
					'!public/src/js/ithoughts-toolbox.js',
				]),
			},
			strict: {
				options: {
					configFile: 'eslint-es6-browser.json',
				},
				src: jsAssets,
			},
		},
		docco_husky: {
			files: {
				expand: true,
				src:    jsAssets,
			},
			project_name: 'AltCore',
			output_dir:   `${ baseDocPath }/docco`,
		},
		jsdoc: {
			src:     jsAssets,
			options: {
				private:     true,
				destination: `${ baseDocPath }/jsdoc`,
				config:	     'jsdoc.json',
				template:    './node_modules/ink-docstrap/template',
				readme:      'README-jsdoc.md',
			},
		},
		babel: {
			options: {
				sourceMap: true,
				presets:   [ 'es2015' ],
			},
			dist: {
				files: [{
					'expand': true,
					'cwd':    'public/src/js',
					'src':    [
						'**/*.js',
						'!dependencies/**/*.js',
						'!**/*.min.js',
					],
					'dest': 'public/dist/js',
					'ext':  '.js',
				}],
			},
		},
		lesslint: {
			info: _.merge({}, lesslint, {
				options: {
					failOnWarning: false,
				},
			}),
			strict: _.merge({}, lesslint, {
				options: {
					failOnWarning: true,
				},
			}),
		},
		less: {
			dist: {
				files:   lessFiles,
				options: {
					plugins: [
						new ( require( 'less-plugin-autoprefix' ))({
							browsers: 'last 2 versions',
						}), // add vendor prefixes
						new ( require( 'less-plugin-clean-css' ))({
							advanced: true,
						}),
					],
				},
			},
		},
		markdown: {
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
		},
		imagemin: {
			public_images: {
				options: {},
				files:   [{
					expand: true,
					cwd:    'public/src/images',
					src:    [ '**/*.{png,jpg,gif,svg}' ],
					dest:   'public/dist/images',
				}],
			},
		},
	});

	// Load the plugin that provides the 'uglify' task.
	grunt.loadNpmTasks( 'grunt-jsdoc' );
	grunt.loadNpmTasks( 'grunt-docco-husky' );
	grunt.loadNpmTasks( 'grunt-markdown' );
	grunt.loadNpmTasks( 'gruntify-eslint' );
	grunt.loadNpmTasks( 'grunt-lesslint' );
	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-imagemin' );
	grunt.loadNpmTasks( 'grunt-changed' );

	require( 'load-grunt-tasks' )( grunt );

	grunt.registerTask(
		'documentate',
		[
			'markdown:index',
			'jsdoc',
			'docco_husky',
		]
	);
	grunt.registerTask(
		'refreshStyles',
		[
			'lesslint:info',
			'changed:less:dist',
			'changed:cssmin:public_css',
		]
	);
	grunt.registerTask(
		'refreshScripts',
		[
			'eslint:info',
			'changed:babel:dist',
			'changed:uglify:public_js',
		]
	);
	grunt.registerTask(
		'refreshResources',
		[
			'refreshStyles',
			'refreshScripts',
			'changed:imagemin:public_images',
			'changed:copy:public_other',
		]
	);
	grunt.registerTask(
		'lint',
		[
			'eslint:info',
			'lesslint:info',
		]
	);
};
