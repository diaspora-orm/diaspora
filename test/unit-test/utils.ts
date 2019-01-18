import * as _ from 'lodash';
import { resolve } from 'path';
import * as chalk from 'chalk';

import { Adapter } from '../../src/adapters';
import AAdapter = Adapter.Base.AAdapter;
import AAdapterEntity = Adapter.Base.AAdapterEntity;
import DataAccessLayer = Adapter.DataAccessLayer;

import { Model } from '../../src/model';
import { Entity, Set } from '../../src/entities';
import { Diaspora } from '../../src/diaspora';
import { IEntityAttributes } from '../../src/types/entity';

process.on( 'unhandledRejection', r => console.log( r ) );
const projectPath = resolve( '../' );
let config;
try {
	config = require( './config.js' );
} catch ( err ) {
	if ( 'MODULE_NOT_FOUND' === err.code ) {
		console.error(
			'Missing required file "config.js", please copy "config-sample.js" and edit it.'
		);
	} else {
		console.error( err );
	}
	process.exit();
}

export const conf = config;

export const dataSources: { [key: string]: DataAccessLayer<AAdapterEntity, AAdapter> } = {};

const styles =
'undefined' === typeof window
? {
	category: ( chalk as any ).bold.underline.blue,
	taskCategory: ( chalk as any ).underline.white,
	bold: ( chalk as any ).bold,
	adapter: ( chalk as any ).bold.red,
	model: ( chalk as any ).bold.red,
}
: {};

export const getStyle = ( styleName: string, text: string ) => {
	const styleFct = styles[styleName];
	if ( _.isFunction( styleFct ) ) {
		return styleFct( text );
	}
	return text;
};

export const getConfig = ( adapterName: string ): object =>
	( config && config[adapterName] ) || {};

export const importTest = ( name: string, modulePath: string ) => {
	describe( name, () => {
		require( modulePath );
	} );
};

const hasOwnMethod = ( received: any, methodName: string ) =>
	!!( received && _.isFunction( received[methodName] ) );

expect.extend( {
	toImplementMethod( received: any, methodName: string ) {
		const pass = hasOwnMethod( received, methodName );
		return {
			message: () =>
			`Expected to implement method ${this.utils.printExpected( methodName )}`,
			pass: pass,
		};
	},
	toImplementOneOfMethods( received: any, methodNames: string[] ) {
		const pass =
		received &&
		_.some( methodNames, methodName => hasOwnMethod( received, methodName ) );
		return {
			message: () =>
			`Expected to implement one of methods ${this.utils.printExpected(
				methodNames.join( ', ' )
			)}`,
			pass: pass,
		};
	},
	toMatchWithUndefined( received: any, expected: any ) {
		_.forEach( expected, ( val, key ) => {
			if ( _.isUndefined( val ) ) {
				expect( received ).not.toHaveProperty( key );
			} else {
				expect( received ).toHaveProperty( key, val );
			}
		} );
		return {
			message: () => '',
			pass: true,
		};
	},
	toBeAnEntity<TEntity extends IEntityAttributes>(
		received: any,
		expectedModel: Model<TEntity>,
		expectedAttributes?: Partial<TEntity>,
		expectedOrphan?: boolean | string
	) {
		expect( received ).toBeInstanceOf( Entity );
		expect( received.ctor.model ).toEqual( expectedModel );
		const dataSourceName = 'string' === typeof expectedOrphan ? expectedOrphan : undefined;
		const orphanState = dataSourceName ? false : expectedOrphan;
		switch ( orphanState ) {
			case true:
			{
				expect( received.state ).toEqual( 'orphan' );
			}
			break;
			
			case false:
			{
				expect( received.state ).not.toEqual( 'orphan' );
			}
			break;
		}
		expect( received.attributes ).toEqual( received.getAttributes() );
		if ( orphanState ) {
			expect( received.lastDataSource ).toEqual( null );
			if ( _.isUndefined( expectedAttributes ) ){
				expect( received.attributes ).toBe( null );
			} else {
				expect( received.attributes ).toBeInstanceOf( Object );
				expect( received.attributes ).not.toHaveProperty( 'id' );
				expect( received.attributes ).not.toHaveProperty( 'idHash' );
			}
			expect( received.attributes ).toEqual( received.getAttributes() );
		} else if ( null !== orphanState ) {
			const lds = received.lastDataSource;
			if ( dataSourceName ) {
				expect( lds ).toEqual( Diaspora.dataSources[dataSourceName] );
			} else {
				expect( lds ).not.toEqual( null );
			}
			
			// Check dataSources weakmap
			expect( received.dataSources ).toBeInstanceOf( WeakMap );
			expect( received.dataSources.get( lds ) ).toBeAnAdapterEntity( lds );
			
			expect( received.attributes ).toBeInstanceOf( Object );
			expect( received.attributes ).not.toHaveProperty( 'id' );
			expect( received.attributes ).not.toHaveProperty( 'idHash' );
			expect( received.getAttributes() ).toEqual( received.attributes );

			expect( received.getProperties( dataSourceName ) ).toHaveProperty( 'id' );
			expect( received.getProperties( dataSourceName ) ).toHaveProperty( 'idHash' );
			expect( received.getProperties( dataSourceName ) ).toMatchObject( received.getAttributes( dataSourceName ) );

			expect( received.attributes ).toEqual( received.getAttributes() );
		}
		_.forEach( ['persist', 'fetch', 'destroy' ], word => {
			expect( received ).toImplementMethod( word );
		} );
		expect( received.attributes ).toMatchWithUndefined( expectedAttributes );
		return {
			message: () => '',
			pass: true,
		};
	},
	toBeAnEntitySet<TEntity extends IEntityAttributes>(
		receivedSet: any,
		expectedModel: Model<TEntity>,
		expectedAttributesArray?: Partial<TEntity> | Array<Partial<TEntity>>,
		expectedOrphan?: boolean | string
	) {
		expect( receivedSet ).toBeInstanceOf( Set );
		expect( receivedSet ).toHaveProperty( 'length' );
		if ( _.isArray( expectedAttributesArray ) ) {
			expect( receivedSet ).toHaveLength( expectedAttributesArray.length );
		}
		_.forEach( ['persist', 'fetch', 'destroy' ], word => {
			expect( receivedSet ).toImplementMethod( word );
		} );
		receivedSet.forEach( ( received, index ) => {
			const expectedAttributes = _.isArray( expectedAttributesArray )
			? expectedAttributesArray[index]
			: expectedAttributesArray;
			expect( received ).toBeAnEntity(
				expectedModel,
				expectedAttributes,
				expectedOrphan
			);
		} );
		return {
			message: () => '',
			pass: true,
		};
	},
	toBeAnAdapterEntity(
		received: any,
		expectedDataAccessLayer: DataAccessLayer,
		expectedAttributes?: any
	) {
		expect( received ).toBeInstanceOf( AAdapterEntity );
		const receivedEntity = received as AAdapterEntity;
		const adapter = receivedEntity.dataSource;
		expect( receivedEntity.dataAccessLayer ).toBeInstanceOf( DataAccessLayer );
		expect( receivedEntity.dataAccessLayer ).toEqual( expectedDataAccessLayer );
		expect( receivedEntity.dataSource ).toBeInstanceOf( AAdapter );
		expect( receivedEntity.dataSource ).toEqual( expectedDataAccessLayer.adapter );
		expect( receivedEntity.attributes ).toBeInstanceOf( Object );
		expect( receivedEntity.attributes ).not.toHaveProperty( 'idHash' );
		expect( receivedEntity.attributes ).not.toHaveProperty( 'id' );
		expect( receivedEntity.properties ).toBeInstanceOf( Object );
		expect( receivedEntity.properties ).toHaveProperty( 'id' );
		expect( receivedEntity.properties ).toHaveProperty( 'idHash' );
		expect( receivedEntity.properties.idHash ).toBeInstanceOf( Object );
		expect( receivedEntity.properties.idHash ).toHaveProperty( adapter.name, receivedEntity.properties.id );
		expect( receivedEntity.properties.id ).not.toBeUndefined();
		expect( receivedEntity.properties.id ).not.toBeNull();
		expect( receivedEntity.id ).toEqual( receivedEntity.properties.id );
		expect( receivedEntity.properties ).toMatchObject( receivedEntity.attributes );
		if ( 'undefined' === typeof window ) {
			const baseName = (
				adapter.name[0].toUpperCase() + adapter.name.substr( 1 )
			).replace( /Adapter$/, '' );
			expect( receivedEntity.constructor.name ).toEqual( `${baseName}Entity` );
		}
		expect( receivedEntity.attributes ).toMatchWithUndefined( expectedAttributes );
		return {
			message: () => '',
			pass: true,
		};
	},
	toBeAnAdapterEntitySet(
		receivedArray: any[],
		expectedDataAccessLayer: DataAccessLayer,
		expectedAttributesArray?: any[] | any
	) {
		expect( receivedArray ).toBeInstanceOf( Array );
		_.forEach( receivedArray, ( received, index ) => {
			const expectedAttributes = _.isArray( expectedAttributesArray )
			? expectedAttributesArray[index]
			: expectedAttributesArray;
			expect( received ).toBeAnAdapterEntity( expectedDataAccessLayer, expectedAttributes );
		} );
		return {
			message: () => '',
			pass: true,
		};
	},
} );

declare global {
	namespace jest {
		// tslint:disable-next-line:interface-name
		interface Matchers<R> {
			// Method implementation
			toImplementMethod( methodName: string ): void;
			toImplementOneOfMethods( methodNames: string[] ): void;
			// Matcher
			toMatchWithUndefined( expected: any );
			// Adapter Entity
			toBeAnAdapterEntity( expectedAdapter: DataAccessLayer, expected?: any ): void;
			toBeAnAdapterEntitySet(
				expectedAdapter: DataAccessLayer,
				expectedAttributesArray?: any[] | any
			): void;
			// Entity
			toBeAnEntity<TEntity extends IEntityAttributes>(
				expectedModel: Model<TEntity>,
				expectedAttributes?: Partial<TEntity>,
				expectedOrphan?: boolean | string
			): void;
			toBeAnEntitySet<TEntity extends IEntityAttributes>(
				expectedModel: Model<TEntity>,
				expectedAttributesArray?: Partial<TEntity> | Array<Partial<TEntity>>,
				expectedOrphan?: boolean | string
			): void;
		}
	}
}
