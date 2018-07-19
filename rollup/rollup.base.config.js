const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const sourceMaps = require('rollup-plugin-sourcemaps');
const camelCase = require('lodash.camelcase');
const uglify = require('rollup-plugin-uglify').uglify;
const json = require('rollup-plugin-json');
const hypothetical = require( 'rollup-plugin-hypothetical' );
const minifyEs = require('uglify-es').minify;

const pkg = require('../package.json')

const libraryName = 'Diaspora'

const formatHypotheticalReplace = (str) => `// ===== HYPOTHETICAL REPLACE START ======
${str}
// =====  HYPOTHETICAL REPLACE END  ======
`;

module.exports = (minify, externalize) => {
	const fileName = camelCase(libraryName);
	const getFileName = libFile => {
		const extRegex = /(\.(t|j)sx?)/;
		if(!externalize){
			libFile = libFile.replace(extRegex, '.standalone$1');
		}
		if(minify){
			libFile = libFile.replace(extRegex, '.min$1');
		}
		return libFile;
	}
	const globals = externalize ? {
		'lodash': '_',
		'sequential-event': 'SE',
	} : undefined
	
	const commonjsConfig = {
		namedExports: {
			'node_modules/lodash/lodash.js': Object.keys(require('lodash'))
		}
	};
	
	const config = {
		input: 'dist/lib/index.js',
		output: [
			{ file: getFileName(`dist/umd/${fileName}.js`), name: libraryName, format: 'umd', sourcemap: true, globals, exports: 'named' },
			{ file: getFileName(`dist/es5/${fileName}.js`), name: libraryName, format: 'es', sourcemap: true, globals, exports: 'named' },
		],
		// Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
		external: (externalize ? ['lodash', 'sequential-event'] : []).concat(['winston', 'request-promise', 'util', 'os']),
		
		watch: {
			include: 'src/**',
		},
		plugins: [
			// Compile TypeScript files
			//typescript(),
			
			json(),
			
			hypothetical({
				allowRealFiles: true,
				allowFallthrough: true,
				files: {
					'winston': `
					export default null;
					`,
					'request-promise': `
					export default null;
					`,
					'util': `
					export default null;
					`,
					
					
					// Drop-in replacement classes
					'./dist/lib/logger/index.js': formatHypotheticalReplace(`import { BrowserLogger } from './browserLogger';
					/**
					* Reference to the static logger instance for Diaspora.
					*/
					export const logger = new BrowserLogger();`),
					'./dist/lib/adapters/webApi/adapterDeclaration.js': formatHypotheticalReplace(`import { BrowserWebApiAdapter } from './subAdapters/browserAdapter';

export const declareWebApi = ( Diaspora ) => Diaspora.registerAdapter( 'webApi', BrowserWebApiAdapter );`),
					'./dist/lib/adapters/webStorage/adapterDeclaration.js': formatHypotheticalReplace(`import { WebStorageAdapter } from './adapter';

export const declareWebStorage = ( Diaspora ) => Diaspora.registerAdapter( 'webStorage', WebStorageAdapter );`),
				}
			}),
			// Allow node_modules resolution, so you can use 'external' to control
			// which external modules to include in the bundle
			// https://github.com/rollup/rollup-plugin-node-resolve#usage
			resolve({
				browser: true,
			}),
			// Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
			commonjs(commonjsConfig),
		].concat(minify ? [
			// Minify
			uglify({}, minifyEs),
		] : []).concat([
			
			// Resolve source maps to the original source
			sourceMaps(),
		]),
	}
	return config;
};
