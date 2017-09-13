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
			if ( 'ready' === this.state ) {
				return resolve( this );
			}
			this.on( 'ready', () => {
				return resolve( this );
			}).on( 'error', err => {
				return reject( err );
			});
		});
	}
}

module.exports = DiasporaAdapter;