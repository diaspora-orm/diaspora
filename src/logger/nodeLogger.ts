import * as _ from 'lodash';
import {Logger as WLogger, createLogger, transports} from 'winston';
import { Logger, ELoggingLevel } from './logger';
import { format } from 'logform';

const LoggerHash = {
	[ELoggingLevel.Silly]: 'silly',
	[ELoggingLevel.Verbose]: 'verbose',
	[ELoggingLevel.Debug]: 'debug',
	[ELoggingLevel.Log]: 'log',
	[ELoggingLevel.Warn]: 'warn',
	[ELoggingLevel.Error]: 'error',
	[ELoggingLevel.Silent]: 'silent',
};

export class NodeLogger extends Logger{

	public set level( level:ELoggingLevel ){
		this.logger.level = LoggerHash[level];
		this._level = level;
	}
	public get level(){
		return this._level;
	}
	protected logger: WLogger;
	
	public constructor(){
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
						
						let message = `${infos.level}${''} @ ${formatDate()} => ${infos.message}`;
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
}
