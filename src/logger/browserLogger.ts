import { Logger, ELoggingLevel } from './logger';

export class BrowserLogger extends Logger{
	public set level( level:ELoggingLevel ){
		this._level = level;
	}
	public get level(){
		return this._level;
	}
	public constructor(){
		const voidFct = () => {return;};
		super( {
			silly:   voidFct,
			verbose: voidFct,
			debug:   voidFct,
			log:     voidFct,
			warn:    voidFct,
			error:   voidFct,
		} );
		this.silly    = this.bindConsoleFct( ELoggingLevel.Silly, 'info',  'Diaspora: silly  ' );
		this.verbose  = this.bindConsoleFct( ELoggingLevel.Verbose, 'info',  'Diaspora: verbose' );
		this.debug    = this.bindConsoleFct( ELoggingLevel.Debug, 'info',  'Diaspora: debug  ' );
		this.log      = this.bindConsoleFct( ELoggingLevel.Log, 'log',   'Diaspora: log    ' );
		this.warn     = this.bindConsoleFct( ELoggingLevel.Warn, 'warn',  'Diaspora: warn   ' );
		this.error    = this.bindConsoleFct( ELoggingLevel.Error, 'error', 'Diaspora: error  ' );
	}

	/**
	 * Prepare a log function with a specific log level
	 * 
	 * @author Gerkin
	 * @param minLevel - Logging level of this function, under which no log will be emitted
	 * @param fctName  - Name of the console function to target
	 * @param args     - Parameters to prepend to the log
	 * @returns A logging function to call with any parameters
	 */
	private bindConsoleFct( minLevel: ELoggingLevel, fctName: string, ...args: any[] ){
		return ( ...logArgs: any[] ) => {
			if ( this.level <= minLevel ){
				( console as any )[fctName]( ...args, ...logArgs );
			}
		};
	}
}
