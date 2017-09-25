'use strict';

/* global module: false */

require( 'chalk' );

module.exports = function gruntInit( grunt ) {
	// Project configuration.

	const baseDocPath = 'site';
	const doccoPath = `${baseDocPath}/docco`;
	const jsdocPath = `${baseDocPath}/jsdoc`;
	const jsAssets = 'lib/adapters/baseAdapter.js' || [
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
			output_dir: doccoPath,
			readme: 'README-docco.md',
			//template_dir: 'node_modules/jekyll-docco-husky/template',
			files:        {
				expand: true,
				src:    jsAssets,
			},
			// Project name, output path, etc etc have to be configured in package.json
		},
		jsdoc: {
			src:     jsAssets,
			options: {
				private:     true,
				destination: jsdocPath,
				config:	     'site/jsdoc.json',
				template:    './node_modules/ink-docstrap/template2',
				readme:      'README-jsdoc.md',
			},
		},
		concat: {
			dist: {
				expand: true,
				src: [
					`${ doccoPath }/**/*.html`,
				],
				dest: './',
			},
			options: {
				banner: `---
layout: docpage
#title: Home
toc: false
---
`,
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
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-changed');

	require( 'load-grunt-tasks' )( grunt );

	grunt.registerTask(
		'documentate',
		[
			//			'markdown:index',
			'jsdoc',
			'docco_husky',
			'concat',
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
