import * as _ from 'lodash';
import * as Winston from 'winston';


/**
 * Function used to give feedback to the user about errors or other infos communicated by Diaspora. It can print directly to stdout, or can use Winston transport if configured so on server environment.
 * 
 * @author Gerkin
 */
export type LoggingFunction = ( ...args: any[] ) => void;
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
const initLogger: () => ILoggerInterface = () => {
	if ( !process.browser ) {
		const { createLogger, format, transports } = Winston;
		const { combine, json } = format;

		const log = createLogger( {
			level: 'silly',
			format: json(),
			transports: [
				//
				// - Write to all logs with level `info` and below to `combined.log`
				// - Write all logs error (and below) to `error.log`.
				//
			],
		} );

		//
		// If we're not in production then log to the `console` with the format:
		// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
		//
		if ( process.env.NODE_ENV !== 'production' ) {
			const trimToLength = (
				str: string | number,
				len: number = 2,
				filler = '0',
				left = true
			) => {
				filler = filler.repeat( len );
				str = left ? filler + str : str + filler;
				return str.slice( left ? -len : len );
			};
			const formatDate = ( date = new Date() ) => {
				const datePart = `${trimToLength( date.getDay() )}/${trimToLength( date.getMonth() + 1 )}/${trimToLength( date.getFullYear(), 4 )}`;
				const timePart = `${trimToLength( date.getHours() )}:${trimToLength( date.getMinutes() )}:${trimToLength( date.getSeconds() )}`;
				return `${datePart} ${timePart}:${trimToLength( date.getMilliseconds(), 3 )}`;
			};

			log.add(
				new transports.Console( {
					format: combine(
						format.colorize(),
						// TODO: replace with logform TransformableInfos when Winston typings updated to 3.x
						format( ( infos: any, opts: any ) => {
							const MESSAGE = Symbol.for( 'message' );
							const LEVEL = Symbol.for( 'level' );
							const level = infos[LEVEL];
							// Add 'Diaspora: ' before the log level name
							infos.level = infos.level.replace( level, 'Diaspora: ' + level );

							let message = `${infos.level}${
								log.paddings[level]
							}@${formatDate()} => ${infos.message}`;
							const omittedKeys = ['level', 'message', 'splat'];
							if ( !_.isEmpty( _.difference( _.keys( infos ), omittedKeys ) ) ) {
								message += ' ' + JSON.stringify( _.omit( infos, omittedKeys ) );
							}
							infos[MESSAGE] = message;
							return infos;
						} )()
					),
				} )
			);
		}
		return log;
	} else {
		const bindConsoleFct = ( fctName: string, ...args: any[] ) => {
			return ( console as any )[fctName].bind( console, ...args ) as ( ...args: any[] ) => void;
		};
		const newLogger: ILoggerInterface = {
			silly:   bindConsoleFct( 'info',  'Diaspora: silly  ' ),
			verbose: bindConsoleFct( 'info',  'Diaspora: verbose' ),
			debug:   bindConsoleFct( 'info',  'Diaspora: debug  ' ),
			log:     bindConsoleFct( 'log',   'Diaspora: log    ' ),
			warn:    bindConsoleFct( 'warn',  'Diaspora: warn   ' ),
			error:   bindConsoleFct( 'error', 'Diaspora: error  ' ),
		};
		return newLogger;
	}
};
/**
 * Reference to the static logger instance for Diaspora.
 */
export const logger = initLogger();
