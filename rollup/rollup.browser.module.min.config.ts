import generateConfig from './rollup.base.config';

export default generateConfig( {
	minify: true,
	externalize: true,
 } );
