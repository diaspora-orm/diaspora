const intercept = require( 'intercept-stdout' );

import { BrowserLogger } from '../src/logger/browserLogger';
import { ELoggingLevel } from '../src/logger/logger';
import { NodeLogger } from '../src/logger/nodeLogger';


const catchStdout = () => {
	let stdout = '';
	let stderr = '';
	const interceptionEnd = intercept( ( out: string ) => stdout += out, ( err: string ) => stderr += err );
	return () => {
		interceptionEnd();
		return {stdout, stderr};
	};
};


it( 'Change level', () => {
	const browserLogger = new BrowserLogger();
	browserLogger.level = ELoggingLevel.Debug;
	const nodeLogger = new NodeLogger();
	nodeLogger.level = ELoggingLevel.Debug;
	
	browserLogger.verbose( 'test' );
	nodeLogger.verbose( 'test' );
} );
