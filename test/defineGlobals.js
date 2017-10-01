if ( 'undefined' === typeof window ) {
	path = require( 'path' );
	projectPath = path.resolve( '../' );
	chalk = require( 'chalk' );

	const stackTrace = require( 'stack-trace' );
	getCurrentDir = () => {
		const stackItem = stackTrace.get()[2];
		return path.dirname( stackItem.getFileName());
	};

	chalk = require( 'chalk' );
	try {
		config = require( './config.js' );
	} catch ( err ) {
		if ( 'MODULE_NOT_FOUND' === err.code ) {
			console.error( 'Missing required file "config.js", please copy "config-sample.js" and edit it.' );
		} else {
			console.error( err );
		}
		process.exit();
	}

} else {
	getCurrentDir = () => {
		return '';
		var scriptPath = '';
		try {
			//Throw an error to generate a stack trace
			throw new Error();
		} catch ( e ) {
			console.log( e, e.stack );
			//Split the stack trace into each line
			var stackLines = e.stack.split( '\n' );
			console.log( stackLines );
			var callerIndex = 0;
			//Now walk though each line until we find a path reference
			for ( var i in stackLines ) {
				if ( !stackLines[i].match( /(?:https?|file):\/\// )) {
					continue; 
				}
				//We skipped all the lines with out an http so we now have a script reference
				//This one is the class constructor, the next is the getScriptPath() call
				//The one after that is the user code requesting the path info (so offset by 2)
				callerIndex = Number( i ) + 2;
				break;
			}
			//Now parse the string for each section we want to return
			pathParts = stackLines[callerIndex].match( /((?:https?|file):\/\/.+\/)([^\/]+\.js)/ );
			return pathParts[1];
		}
	};
}

getConfig = adapterName => {
	return ( config && config[adapterName]) || {};
};

importTest = ( name, modulePath ) => {
	const fullPath = 'undefined' === typeof window ? path.resolve( getCurrentDir(), modulePath ) : modulePath;
	describe( name, () => {
		require( fullPath );
	});
};

l = require( 'lodash' );
c = require( 'check-types' );
CheckTypes = c;
const chai = require( 'chai' );
assert = chai.assert;
expect = chai.expect;
SequentialEvent = require( 'sequential-event' );
Promise = require( 'bluebird' );

style = {
	white: 'undefined' === typeof window ? chalk.underline.white : v => v,
	bold:  'undefined' === typeof window ? chalk.bold : v => v,
};

chai.use( function( _chai, utils ) {
	utils.addProperty( chai.Assertion.prototype, 'set', function() {
		var obj = utils.flag( this, 'object' );
		const assert = this.assert(
			c.array( this._obj ),
			'expected #{this} to be a collection',
			'expected #{this} to not be a collection' );
		utils.flag( this, 'collection', true );
	});
	utils.addProperty( chai.Assertion.prototype, 'of', function() {});
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
					expect( entity.constructor.name, 'Entity Class name does not comply to naming convention' ).to.equal( `${ adapter.baseName }Entity` );
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
			try {
				expect( entity.model ).to.equal( model );
				var dataSource = 'string' === typeof orphan ? orphan : false;
				orphan = dataSource ? false : orphan;
				switch ( orphan ) {
					case true: {
						expect( entity.getState(), 'Entity should be orphan' ).to.equal( 'orphan' );
					} break;

					case false: {
						expect( entity.getState(), 'Entity should not be orphan' ).to.not.equal( 'orphan' );
					} break;

					case null: {
					} break;
				}
				if ( orphan ) {
					expect( entity.getLastDataSource(), 'Orphans should not have a last data source' ).to.be.eql( null );
					expect( entity, 'id should be an undefined value or key on orphans' ).to.not.have.property( 'id' );
					expect( entity, 'idHash should be an undefined value or key on orphans' ).to.not.have.property( 'idHash' );
				} else if ( null !== orphan ) {
					if ( dataSource ) {
						expect( entity.getLastDataSource()).to.be.eql( dataSource );
					} else {
						expect( entity.getLastDataSource(), 'Non orphans should have a last data source' ).to.be.not.eql( null );
					}
					const lds = entity.getLastDataSource();
					expect( entity.dataSources[lds], 'id should be a defined value on non-orphan last data source' ).to.be.an( 'object' ).that.have.property( 'id' );
					expect( entity.dataSources[lds], 'idHash should be a hash on non-orphan last data source' ).to.be.an( 'object' ).that.have.property( 'idHash' ).that.is.an( 'object' );
					expect( entity, 'id should not be copied in model\'s value' ).to.be.an( 'object' ).that.have.not.property( 'id' );
					expect( entity, 'idHash should be a hash on non-orphan model' ).to.be.an( 'object' ).that.have.property( 'idHash' ).that.is.an( 'object' );
				}
				expect( entity ).to.respondTo( 'persist' );
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
			`expected #{this} to be a${ collection ? ' collection of' : 'n' } Entity: failed because of ${ errorOut }`,
			`expected #{this} to not be a${ collection ? ' collection of' : 'n' } Entity: failed because of ${ errorOut }`
		);
	});
});
