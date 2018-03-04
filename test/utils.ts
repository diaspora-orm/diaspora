import _ from 'lodash';
import { resolve } from 'path';
import * as chalk from 'chalk';

const projectPath = resolve('../');
let config;
try {
	config = require('./config.js');
} catch (err) {
	if ('MODULE_NOT_FOUND' === err.code) {
		console.error(
			'Missing required file "config.js", please copy "config-sample.js" and edit it.'
		);
	} else {
		console.error(err);
	}
	process.exit();
}
export const conf = config;

const styles =
	'undefined' === typeof window
		? {
				category: chalk.bold.underline.blue,
				taskCategory: chalk.underline.white,
				bold: chalk.bold,
				adapter: chalk.bold.red,
				model: chalk.bold.red,
		  }
		: {};

export const getStyle = (styleName: string, text: string) => {
	const styleFct = styles[styleName];
	if (_.isFunction(styleFct)) {
		return styleFct(text);
	}
	return text;
};

export const getConfig = (adapterName: string): object => {
	return (config && config[adapterName]) || {};
};

export const importTest = (name: string, modulePath: string) => {
	describe(name, () => {
		require(modulePath);
	});
};

/* chai.use( function chaiUse( _chai, utils ) {
	utils.addProperty( chai.Assertion.prototype, 'set', function chaiSet() {
		this.assert(
			c.array( this._obj ) || this._obj.hasOwnProperty( 'entities' ),
			'expected #{this} to be a collection',
			'expected #{this} to not be a collection' );
		utils.flag( this, 'collection', true );
	});
	utils.addProperty( chai.Assertion.prototype, 'of', () => {});
	utils.addChainableMethod( chai.Assertion.prototype, 'boolean', function checkBool() {
		const elem = this._obj;
		const collection = utils.flag( this, 'collection' );
		this.assert(
			collection ? l.every( elem, c.boolean ) : c.boolean( elem ),
			`expected #{this} to be a ${ collection ? 'collection of ' : '' }boolean`,
			`expected #{this} to not be a ${ collection ? 'collection of ' : '' }boolean`
		);
	});
	utils.addChainableMethod( chai.Assertion.prototype, 'dataStoreEntity', function checkDataStoreEntity( adapter, properties ) {
		const data = this._obj;
		const collection = utils.flag( this, 'collection' );
		utils.flag( this, 'entityType', 'dataStoreEntity' );
		const check = ( entity, props = {}) => {
			try {
				expect( entity ).to.be.an( 'object' );
				//	console.log({name: adapter.name, idHash: entity.idHash, id: entity.id})
				expect( entity.idHash ).to.be.an( 'object' ).that.have.property( adapter.name, entity.id );
				expect( entity ).to.include.all.keys( 'id', 'idHash' );
				expect( entity.id ).to.not.be.undefined;
				if ( !entity.id ) {
					throw new Error();
				}
				if ( 'undefined' === typeof window ) {
					const baseName = ( adapter.name[0].toUpperCase() + adapter.name.substr( 1 )).replace( /Adapter$/, '' );
					expect( entity.constructor.name, 'Entity Class name does not comply to naming convention' ).to.equal( `${ baseName }Entity` );
				}
				l.forEach( props, ( val, key ) => {
					if ( c.undefined( val )) {
						expect( entity ).to.satisfy( obj => {
							return c.undefined( obj[key]) || !obj.hasOwnProperty( key );
						});
					} else {
						expect( entity ).to.have.property( key, val );
					}
				});
			} catch ( e ) {
				return e;
			}
		};
		let errorOut;
		if ( collection ) {
			if ( c.array( properties ) && properties.length === data.length ) {
				l.forEach( data, ( entity, index ) => {
					errorOut = check( entity, properties[index]);
					return !errorOut;
				});
			} else {
				l.forEach( data, entity => {
					errorOut = check( entity, properties );
					return !errorOut;
				});
			}
		} else {
			errorOut = check( data, properties );
		}
		this.assert(
			!errorOut,
			`expected #{this} to be a ${ collection ? 'collection of ' : '' }DataStoreEntity: failed because of ${ errorOut }`,
			`expected #{this} to not be a ${ collection ? 'collection of ' : '' }DataStoreEntity: failed because of ${ errorOut }`
		);
	});
	utils.addChainableMethod( chai.Assertion.prototype, 'entity', function checkDataStoreEntity( model, properties, orphan = null ) {
		const data = this._obj;
		const collection = utils.flag( this, 'collection' );
		utils.flag( this, 'entityType', 'entity' );
		const check = ( entity, props = {}) => {
			expect( entity.constructor.model ).to.equal( model );
			var dataSource = 'string' === typeof orphan ? orphan : false;
			orphan = dataSource ? false : orphan;
			switch ( orphan ) {
				case true: {
					expect( entity.state, 'Entity should be orphan' ).to.equal( 'orphan' );
				} break;

				case false: {
					expect( entity.state, 'Entity should not be orphan' ).to.not.equal( 'orphan' );
				} break;
			}
			if ( orphan ) {
				expect( entity.lastDataSource, 'Orphans should not have a last data source' ).to.be.eql( null );
				expect( entity.attributes, 'id should be an undefined value or key on orphans' ).to.not.have.property( 'id' );
				expect( entity.attributes, 'idHash should be an undefined value or key on orphans' ).to.not.have.property( 'idHash' );
			} else if ( null !== orphan ) {
				if ( dataSource ) {
					expect( entity.lastDataSource ).to.be.eql( dataSource );
				} else {
					expect( entity.lastDataSource, 'Non orphans should have a last data source' ).to.be.not.eql( null );
				}
				const lds = entity.lastDataSource;
				expect( entity.dataSources[lds], 'id should be a defined value on non-orphan last data source' ).to.be.an( 'object' ).that.have.property( 'id' );
				expect( entity.dataSources[lds], 'idHash should be a hash on non-orphan last data source' ).to.be.an( 'object' ).that.have.property( 'idHash' ).that.is.an( 'object' );
				expect( entity.attributes, 'id should not be copied in model\'s value' ).to.be.an( 'object' ).that.have.not.property( 'id' );
				expect( entity.attributes, 'idHash should be a hash on non-orphan model' ).to.be.an( 'object' ).that.have.property( 'idHash' ).that.is.an( 'object' );
			}
			expect( entity ).to.respondTo( 'persist' );
			expect( entity ).to.respondTo( 'fetch' );
			expect( entity ).to.respondTo( 'destroy' );
			expect( entity ).to.respondTo( 'toObject' );
			const toObj = entity.toObject();
			l.forEach( props, ( val, key ) => {
				if ( c.undefined( val )) {
					expect( toObj ).to.satisfy( obj => {
						return c.undefined( obj[key]) || !obj.hasOwnProperty( key );
					});
				} else {
					expect( toObj ).to.have.property( key, val );
				}
			});
		};
		let errorOut;
		if ( collection ) {
			if ( c.array( properties ) && properties.length === data.length ) {
				data.forEach(( entity, index ) => {
					errorOut = check( entity, properties[index]);
					return !errorOut;
				});
			} else {
				data.forEach( entity => {
					errorOut = check( entity, properties );
					return !errorOut;
				});
			}
		} else {
			errorOut = check( data, properties );
		}
		this.assert(
			!errorOut,
			`expected #{this} to be a${ collection ? ' collection of' : 'n' } Entity: failed because of ${ errorOut }`,
			`expected #{this} to not be a${ collection ? ' collection of' : 'n' } Entity: failed because of ${ errorOut }`
		);
	});
}) */
