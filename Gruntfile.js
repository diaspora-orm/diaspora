'use strict';

/* global module: false */

require( 'chalk' );

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
			files: {
				expand: true,
				src:    jsAssets,
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
				plugins:     [ 'plugins/markdown' ],
				template:    'node_modules/diaspora_doc/jsdoc',
				readme:      'README-jsdoc.md',
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

	require( 'load-grunt-tasks' )( grunt );

	grunt.registerTask(
		'documentate',
		[
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
