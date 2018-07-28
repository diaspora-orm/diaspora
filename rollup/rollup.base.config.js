import resolve  from 'rollup-plugin-node-resolve';
import commonjs  from 'rollup-plugin-commonjs';
import sourceMaps  from 'rollup-plugin-sourcemaps';
import camelCase  from 'lodash.camelcase';
import { uglify }  from 'rollup-plugin-uglify';
import json  from 'rollup-plugin-json';
import { minify as minifyEs }  from 'uglify-es';
import jscc from 'rollup-plugin-jscc';
import typescript from 'rollup-plugin-typescript2';
import { compact, defaults } from 'lodash';

const libraryName = 'Diaspora';

export default options => {
	const {
		minify,
		externalize,
		browser,
		useGlobals
	} = defaults(options, {
		browser: true,
		useGlobals: options.externalize,
	});
	const getFileName = type => {
		return `dist/${ browser ? 'browser' : 'node' }/${ type }/${ externalize ? '' : 'standalone/' }index${ minify ? '.min' : '' }.js`
	};
	const globals = useGlobals ? {
		lodash:             '_',
		'sequential-event': 'SE',
	} : {};
	
	const commonjsConfig = {
		namedExports: {
			'node_modules/lodash/lodash.js': Object.keys( require( 'lodash' ) ),
		},
	};
	
	const config = {
		input: 'src/index.ts',
		output: [
			{
				file: getFileName( 'umd' ),
				name: libraryName,
				format: 'umd',
				sourcemap: true,
				globals,
				exports: 'named'
			},
			{
				file: getFileName( 'es5' ),
				name: libraryName,
				format: 'es',
				sourcemap: true,
				globals,
				exports: 'named'
			},
		],
		// Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
		external: ( externalize ? ['lodash', 'sequential-event'] : [] ).concat( ['winston', 'request-promise', 'util', 'logform'] ),
		
		watch: {
			include: 'src/**',
		},
		plugins: compact([
			// Preprocess files
			jscc( {
				values: {
					_BROWSER: browser,
				},
				extensions: ['.js', '.ts'],
			} ),
			/*replace({
				values: {
					GLOBAL: browser ? 'window' : 'global',
				}
			}),*/
			
			// Compile TypeScript files
			typescript( {
				useTsconfigDeclarationDir: true,
				clean: true,
				check: true,
			} ),
			
			json(),
			// Allow node_modules resolution, so you can use 'external' to control
			// which external modules to include in the bundle
			// https://github.com/rollup/rollup-plugin-node-resolve#usage
			browser ? resolve( {
				browser,
			} ) : undefined,
			// Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
			commonjs( browser ? commonjsConfig : undefined ),
		].concat( minify ? [
			// Minify
			uglify( {}, minifyEs ),
		] : [] ).concat( [
			
			// Resolve source maps to the original source
			sourceMaps(),
		] )),
	};
	return config;
};
