import * as _ from 'lodash';
import { Logger as WLogger, createLogger, transports } from 'winston';
import { Logger, ELoggingLevel } from './logger';
import { format } from 'logform';
import { TransformableInfo } from 'logform';

const LoggerHash = {
	[ELoggingLevel.Silly]: 'silly',
	[ELoggingLevel.Verbose]: 'verbose',
	[ELoggingLevel.Debug]: 'debug',
	[ELoggingLevel.Log]: 'log',
	[ELoggingLevel.Warn]: 'warn',
	[ELoggingLevel.Error]: 'error',
	[ELoggingLevel.Silent]: 'silent',
};

export class NodeLogger extends Logger {
	public set level( level: ELoggingLevel ) {
		this.logger.level = LoggerHash[level];
		this._level = level;
	}
	public get level() {
		return this._level;
	}
	protected logger: WLogger;
	
	public constructor() {
		const { combine, json } = format;
		
		const log = createLogger( {
			level: LoggerHash[ELoggingLevel.Silly],
			format: json(),
			transports: [
				//
				// - Write to all logs with level `info` and below to `combined.log`
				// - Write all logs error (and below) to `error.log`.
				//
			],
		} );
		
		log.add( new transports.Console( {
			format: combine(
				format.colorize(),
				// TODO: replace with logform TransformableInfos when Winston typings updated to 3.x
				format( NodeLogger.format )()
			),
		} ) );
		super( {
			silly: log.silly.bind( log ),
			verbose: log.verbose.bind( log ),
			debug: log.debug.bind( log ),
			log: log.info.bind( log ),
			warn: log.warn.bind( log ),
			error: log.error.bind( log ),
		} );
		this.logger = log;
	}
	
	/**
	 * Trims the string to the provided length, using the sufficient number of filler characters on the left or rigth
	 * 
	 * @author Gerkin
	 * @param str    - String to trim to the target length
	 * @param len    - Desired length of the string, that will be reached using filler chars
	 * @param filler - Chars to repeat in order to fill the missing space in string
	 * @param left   - Set to false to trim on the right
	 */
	protected static trimToLength(
		str: string | number,
		len: number = 2,
		filler = '0',
		left = true
	){
		filler = filler.repeat( len );
		str = left ? filler + str : str + filler;
		return str.slice( left ? -len : len );
	}
	
	/**
	 * Format the date to a readable format
	 * 
	 * @author Gerkin
	 * @param date - Date to convert to string
	 */
	protected static formatDate( date = new Date() ){
		const datePart = `${NodeLogger.trimToLength( date.getDay() )}/${NodeLogger.trimToLength( date.getMonth() + 1 )}/${NodeLogger.trimToLength( date.getFullYear(), 4 )}`;
		const timePart = `${NodeLogger.trimToLength( date.getHours() )}:${NodeLogger.trimToLength( date.getMinutes() )}:${NodeLogger.trimToLength( date.getSeconds() )}`;
		return `${datePart} ${timePart}:${NodeLogger.trimToLength( date.getMilliseconds(), 3 )}`;
	}
	
	/**
	 * Main logger function used by Diaspora on node environment, disaplying `Diaspora`, colors & the date
	 * 
	 * @author Gerkin
	 * @param infos - Winston message infos
	 */
	protected static format( infos: TransformableInfo ){
		const MESSAGE = Symbol.for( 'message' );
		const LEVEL = Symbol.for( 'level' );

		// Ugly patch related to [a known typescript missing feature](https://github.com/Microsoft/TypeScript/issues/24587)
		// TODO: Clean this up!
		const level = infos[LEVEL as any];
		// Add 'Diaspora: ' before the log level name
		infos.level = infos.level.replace( level, 'Diaspora: ' + level );
		
		let message = `${infos.level}${''} @ ${NodeLogger.formatDate()} => ${
			infos.message
		}`;
		const omittedKeys = ['level', 'message', 'splat'];
		if ( !_.isEmpty( _.difference( _.keys( infos ), omittedKeys ) ) ) {
			message += ' ' + JSON.stringify( _.omit( infos, omittedKeys ) );
		}

		// Ugly patch related to [a known typescript missing feature](https://github.com/Microsoft/TypeScript/issues/24587)
		// TODO: Clean this up!
		infos[MESSAGE as any] = message;
		return infos;
	}
}
