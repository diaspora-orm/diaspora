'use strict';

const glob = 'undefined' !== typeof window ? window : global;

if ( 'undefined' === typeof window ) {
	glob.path = require( 'path' );
	glob.projectPath = path.resolve( '../' );
	glob.chalk = require( 'chalk' );

	const stackTrace = require( 'stack-trace' );
	glob.getCurrentDir = () => {
		const stackItem = stackTrace.get()[2];
		return path.dirname( stackItem.getFileName());
	};

	glob.chalk = require( 'chalk' );
	try {
		glob.config = require( './config.js' );
	} catch ( err ) {
		if ( 'MODULE_NOT_FOUND' === err.code ) {
			console.error( 'Missing required file "config.js", please copy "config-sample.js" and edit it.' );
		} else {
			console.error( err );
		}
		process.exit();
	}

} else {
	glob.config = {};
	glob.getCurrentDir = () => {
		return absolute(currentPath, './');
	};
}
/**
 * @see https://stackoverflow.com/a/14780463/4839162
 * @param   {string}   base     [[Description]]
 * @param   {string}   relative [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
function absolute(base, relative) {
	var stack = base.split("/"),
		parts = relative.split("/");
	stack.pop(); // remove current file name (or empty string)
	// (omit if "base" is the current folder without trailing slash)
	for (var i=0; i<parts.length; i++) {
		if (parts[i] == ".")
			continue;
		if (parts[i] == "..")
			stack.pop();
		else
			stack.push(parts[i]);
	}
	return stack.join("/");
}

glob.currentPath = './test/browser/sources/index.js';

glob.getConfig = adapterName => {
	return ( config && config[adapterName]) || {};
};

glob.importTest = ( name, modulePath ) => {
	const fullPath = 'undefined' === typeof window ? path.resolve( getCurrentDir(), modulePath ) : absolute(currentPath, modulePath);
	console.log({fullPath, getCurrentDir: getCurrentDir()})
	describe( name, () => {
		currentPath = fullPath;
		console.log(currentPath);
		require( fullPath );
	});
};

glob.l = require( 'lodash' );
glob.c = require( 'check-types' );
glob.CheckTypes = c;
if(typeof window === 'undefined'){
	const chai = require( 'chai' );
}
glob.assert = chai.assert;
glob.expect = chai.expect;
glob.SequentialEvent = require( 'sequential-event' );
glob.Promise = require( 'bluebird' );

glob.style = {
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
