/**
 * Function used to give feedback to the user about errors or other infos communicated by Diaspora. It can print directly to stdout, or can use Winston transport if configured so on server environment.
 * 
 * @param args - Things to log to the console
 * @author Gerkin
 */
export type LoggingFunction = ( ...args: any[] ) => void;

export enum ELoggingLevel{
	Silly,
	Verbose,
	Debug,
	Log,
	Warn,
	Error,
	Silent,
}

export abstract class Logger implements ILoggerInterface{

	protected _level = ELoggingLevel.Silly;
	public abstract get level();
	public abstract set level( level: ELoggingLevel );
	public constructor( logProvider: ILoggerInterface ){
		this.silly = logProvider.silly;
		this.verbose = logProvider.verbose;
		this.debug = logProvider.debug;
		this.log = logProvider.log;
		this.warn = logProvider.warn;
		this.error = logProvider.error;
	}

	public silly: LoggingFunction;
	public verbose: LoggingFunction;
	public debug: LoggingFunction;
	public log: LoggingFunction;
	public warn: LoggingFunction;
	public error: LoggingFunction;
}

/**
 * Logger exposed by Diaspora.
 * On server environment, you can use it to configure the underlying Winston instance.
 * On the browser, it wraps calls to the browser's {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/console console}.
 * 
 * @author Gerkin
 */
export interface ILoggerInterface{
	silly:   LoggingFunction;
	verbose: LoggingFunction;
	debug:   LoggingFunction;
	log:     LoggingFunction;
	warn:    LoggingFunction;
	error:   LoggingFunction;
}
