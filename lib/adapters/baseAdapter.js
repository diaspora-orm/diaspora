'use strict';

const SequentialEvent = require( 'sequential-event' );

class DiasporaAdapter extends SequentialEvent {
	constructor( classEntity ) {
		super();
		this.classEntity = classEntity;
	}

	/**
	 * Returns a promise resolved once adapter state is ready
	 * @returns {Promise} Promise resolved when adapter is ready, and rejected if an error occured
	 */
	waitReady() {
		return new Promise(( resolve, reject ) => {
			const logReady = () => {
				console.info( `Adapter ${ this.name || '' } of type ${ this.constructor.name } is now ready` );
			};
			if ( 'ready' === this.state ) {
				logReady();
				return resolve( this );
			}
			this.on( 'ready', () => {
				logReady();
				return resolve( this );
			}).on( 'error', err => {
				return reject( err );
			});
		});
	}
}

module.exports = DiasporaAdapter;