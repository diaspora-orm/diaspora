'use strict';

/* global module: false */

require( 'chalk' );

module.exports = function gruntInit( grunt ) {
	// Project configuration.

	const baseDocPath = 'docs';
	const jsAssets = [
		'Gruntfile.js',
		'diaspora.js',
		'lib/**/*.js',
		'!node_modules/**/*',
		'tests/**/*.js',
	];

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
				src: jsAssets,
			},
			strict: {
				options: {},
				src:     jsAssets,
			},
		},
		docco_husky: {
			project_name: 'Diaspora',
			files: {
				expand: true,
				src:    jsAssets,
			},
			// Project name, output path, etc etc have to be configured in package.json
		},
		jsdoc: {
			src:     jsAssets,
			options: {
				private:     true,
				destination: `${ baseDocPath }/jsdoc/`,
				config:	     'jsdoc.json',
				template:    './node_modules/ink-docstrap/template',
				readme:      'README-jsdoc.md',
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
	});

	grunt.loadNpmTasks( 'grunt-jsdoc' );
	grunt.loadNpmTasks( 'grunt-docco-husky' );
	grunt.loadNpmTasks( 'grunt-markdown' );
	grunt.loadNpmTasks( 'gruntify-eslint' );

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
		'refreshScripts',
		[
			'eslint:info',
		]
	);
	grunt.registerTask(
		'lint',
		[
			'eslint:info',
		]
	);
};
