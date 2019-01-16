import * as _ from 'lodash';
import { resolve, basename } from 'path';

import { Adapter } from './adapters';
import { Model } from './model';
import {
	IDataSourceRegistry,
	dataSourceRegistry,
	modelRegistry,
	IModelRegistry
} from './staticStores';
import { logger } from './logger';
import { BrowserLogger } from './logger/browserLogger';
import { NodeLogger } from './logger/nodeLogger';
import { ModelDescription } from './types/modelDescription';

interface IAdapterRegistry {
	[key: string]: Adapter.IAdapterCtr;
}

/**
 * Diaspora main namespace
 *
 * @author gerkin
 */
export class DiasporaStatic {
	public static get instance() {
		return new this();
	}
	/**
	 * This class is a singleton: the constructor may return the already created instance
	 */
	private constructor() {
		if ( DiasporaStatic._instance ) {
			return DiasporaStatic._instance;
		} else {
			DiasporaStatic._instance = this;
		}
	}
	
	private static _instance: DiasporaStatic;
	
	/**
	 * Logger used by Diaspora and its adapters.
	 *
	 * @author gerkin
	 */
	public get logger(): BrowserLogger | NodeLogger {
		return logger;
	}
	
	/**
	 * Returns a copy of available data sources. Data sources are adapters already instanciated & registered in Diaspora.
	 *
	 * @author gerkin
	 */
	public get dataSources() {
		return _.assign( {}, this._dataSources );
	}
	
	public get models() {
		return _.assign( {}, this._models );
	}
	
	/**
	 * Hash containing all available adapters. The only universal adapter is `inMemory`.
	 *
	 * @author gerkin
	 * @see Use {@link Diaspora.registerAdapter} to add adapters.
	 */
	private readonly adapters: IAdapterRegistry = {};
	
	/**
	 * Hash containing all available data sources.
	 *
	 * @author gerkin
	 * @see Use {@link Diaspora.createNamedDataSource} or {@link Diaspora.registerDataSource} to make data sources available for models.
	 */
	private readonly _dataSources: IDataSourceRegistry = dataSourceRegistry;
	
	/**
	 * Hash containing all available models.
	 *
	 * @author gerkin
	 * @see Use {@link Diaspora.declareModel} to add models.
	 */
	private readonly _models: IModelRegistry = modelRegistry;
	
	// tslint:disable-next-line:comment-format
	//#if !_BROWSER
	/**
	 * Get the name of the closest function caller in another file
	 *
	 * @see https://stackoverflow.com/a/29581862/4839162
	 */
	private static getCallerFile() {
		const originalFunc = Error.prepareStackTrace;
		try {
			const err = new Error();
			let callerfile: string | undefined;
			
			Error.prepareStackTrace = function( er: Error, stack: any ) {
				return stack;
			};
			
			const stack = err.stack as any;
			
			const currentfile = stack.shift().getFileName();
			do {
				callerfile = stack.shift().getFileName();
				
				if ( currentfile !== callerfile ) {
					return callerfile;
				}
			} while ( stack.length );
		} finally {
			Error.prepareStackTrace = originalFunc;
		}
		return undefined;
	}
	// tslint:disable-next-line:comment-format
	//#endif
	
	/**
	 * Import the desired adapter after having auto-resolved it, then register it
	 *
	 * @param adapterLabel - Name of the adapter to import
	 * @throws {Error} if the module does not exists or does not inherit the base Adapter class.
	 */
	private loadAdapter( adapterLabel: string ): string {
		/*#if _BROWSER
		throw new Error(`Could't load dynamically the adapter ${adapterLabel} in browser build`);
		//#else */
		const moduleName = adapterLabel.match( /^\.{1,2}[/\\].+/ )
		? // If relative path (typically starting with `./` or `../`)
		resolve( DiasporaStatic.getCallerFile() || __dirname, '..', adapterLabel )
		: // If node_module
		`adapter-${adapterLabel}`;
		try {
			try {
				require.resolve( moduleName );
			} catch ( e ) {
				const adapterKeys = Object.keys( this.adapters ).join( ', ' );
				throw new Error(
					`Unknown adapter "${adapterLabel}" (expected in module "${moduleName}"). Available currently are ${adapterKeys}. Additionnaly, an error was thrown: ${e}`
				);
			}
			const requiredAdapter = require( moduleName );
			const adapterLabelNormalized = basename( adapterLabel.replace( /\.\w{2,3}$/, '' ) );
			this.registerAdapter( adapterLabelNormalized, requiredAdapter );
			return adapterLabelNormalized;
		} catch ( e ) {
			throw new Error(
				`Could not load adapter "${adapterLabel}" (expected in module "${moduleName}"), an error was thrown: ${e}`
			);
		}
		// tslint:disable-next-line:comment-format
		//#endif
	}
	
	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   adapterLabel - Label of the adapter used to create the data source.
	 * @param   config       - Adapter specific configuration. Check your adapter's doc
	 * @returns New adapter spawned.
	 */
	private createDataSource(
		adapterLabel: string,
		sourceName?: string,
		...config: any[]
	) {
		if ( !this.adapters.hasOwnProperty( adapterLabel ) ) {
			adapterLabel = this.loadAdapter( adapterLabel );
		}
		const adapterCtr = this.adapters[adapterLabel];
		const baseAdapter = new adapterCtr( sourceName || adapterLabel, ...config );
		const newDataSource = new Adapter.DataAccessLayer( baseAdapter );
		return newDataSource;
	}
	
	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   sourceName   - Name associated with this datasource.
	 * @param   adapterLabel - Label of the adapter used to create the data source.
	 * @param   configHash   - Configuration hash. This configuration hash depends on the adapter we want to use.
	 * @returns New adapter spawned.
	 */
	public createNamedDataSource(
		sourceName: string,
		adapterLabel: string,
		...otherConfig: any[]
	) {
		const dataSource = this.createDataSource(
			adapterLabel,
			sourceName,
			...otherConfig
		);
		if ( this._dataSources.hasOwnProperty( sourceName ) ) {
			throw new Error( `DataSource name already used, had "${sourceName}"` );
		}
		this._dataSources[sourceName] = dataSource;
		return dataSource;
	}
	
	/**
	 * Create a new Model with provided description.
	 *
	 * @author gerkin
	 * @param   name      - Name associated with this datasource.
	 * @param   modelDesc - Description of the model to define.
	 * @returns Model created.
	 */
	public declareModel<TEntity>( name: string, modelDesc: ModelDescription.IModelDescription ) {
		const model = new Model<TEntity>( name, modelDesc );
		this._models[name] = model;
		return model;
	}
	
	/**
	 * Register a new adapter and make it available to use by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if an adapter already exists with same label.
	 * @throws  {TypeError} Thrown if adapter does not extends {@link Adapters.DiasporaAdapter}.
	 * @param   label   - Label of the adapter to register.
	 * @param   adapter - The adapter to register.
	 * @returns This function does not return anything.
	 */
	public registerAdapter( label: string, adapter: Adapter.IAdapterCtr ) {
		if ( !( adapter.prototype instanceof Adapter.Base.AAdapter ) ) {
			throw new TypeError(
				'Required adapter does not extends the base Adapter type'
			);
		}
		if ( this.adapters.hasOwnProperty( label ) ) {
			throw new Error( `Adapter with label "${label}" already exists.` );
		}
		this.adapters[label] = adapter;
	}
}

export const Diaspora = DiasporaStatic.instance;


// ## Register adapters
Diaspora.registerAdapter( 'inMemory', Adapter.InMemory.InMemoryAdapter );

/*#ifset _BROWSER
// If browser, will be BrowserWebApiAdapter. If node, will be NodeWebApiAdapter
Diaspora.registerAdapter( 'webApi', Adapter.WebApi.WebApiAdapter );

// tslint:disable-next-line:comment-format
//#if _BROWSER
Diaspora.registerAdapter( 'webStorage', Adapter.WebStorage.WebStorageAdapter );
// tslint:disable-next-line:comment-format
//#endif

// If we are in unbuilt state (like for unit tests), include all adapters aliased if required
//#else //*/
Diaspora.registerAdapter( 'webStorage', Adapter.WebStorage.WebStorageAdapter );

Diaspora.registerAdapter( 'webApiBrowser', Adapter.WebApi.BrowserWebApiAdapter );
Diaspora.registerAdapter( 'webApiNode', Adapter.WebApi.NodeWebApiAdapter );
// tslint:disable-next-line:comment-format
//#endif
