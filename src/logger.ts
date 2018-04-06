import * as _ from 'lodash';
import { Winston } from 'winston';

export const logger: Winston | Console | any = ( () => {
	if ( !process.browser ) {
		const winston = require( 'winston' );
		const { createLogger, format, transports } = winston;
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
				len: number,
				filler = ' ',
				left = true
			) => {
				filler = filler.repeat( len );
				str = left ? filler + str : str + filler;
				return str.slice( left ? -len : len );
			};
			const td = _.partialRight( trimToLength, 2, '0' ) as (
				str: string | number
			) => string;
			const formatDate = ( date = new Date() ) => {
				return `${td( date.getFullYear() )}/${td( date.getMonth() + 1 )}/${td(
					date.getDay()
				)} ${td( date.getHours() )}:${td( date.getMinutes() )}:${td(
					date.getSeconds()
				)}`;
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
							let message = `${infos.level.replace( level, 'Diaspora: ' + level )}${
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
		return console;
	}
} )();
