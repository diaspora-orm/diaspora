import * as _ from 'lodash';

import { Adapter, QueryLanguage, IRawAdapterEntityAttributes } from '../base';
import { WebApiEntity } from './entity';
import { IRawEntityAttributes } from '../../entityFactory';
import { DefaultQueryTransformerFactory } from './defaultQueryTransformer';
import { logger } from '../../logger';

interface IXhrResponse extends XMLHttpRequest {
	response: {
		message?: string;
	};
}

export interface IWebApiAdapterConfig {
	/**
	 * Hostname of the endpoint. On server environment, this parameter is *required*.
	 */
	host?: string | false;
	/**
	 * Scheme to use. On server environment, this parameter is *required*. On browser environment, it defaults to a relative scheme (IE ``). Note that it will be suffixed with `//`.
	 */
	scheme?: string | false;
	/**
	 * Port of the endpoint.
	 */
	port?: number | false;
	/**
	 * Path to the endpoint.
	 */
	path: string;
	/**
	 * Hash with keys being the singular name of the endpoint, and values being the associated plural name of the same endpoint.
	 */
	pluralApis?: { [key: string]: string };
}
export interface INodeWebApiAdapterConfig extends IWebApiAdapterConfig {
	/**
	 * Hostname of the endpoint. On server environment, this parameter is *required*.
	 */
	host: string;
	/**
	 * Scheme to use. On server environment, this parameter is *required*. On browser environment, it defaults to a relative scheme (IE ``). Note that it will be suffixed with `//`.
	 */
	scheme: string;
	/**
	 * Port of the endpoint.
	 */
	port?: number | false;
	/**
	 * Path to the endpoint.
	 */
	path: string;
	/**
	 * Hash with keys being the singular name of the endpoint, and values being the associated plural name of the same endpoint.
	 */
	pluralApis?: { [key: string]: string };
}

export interface IEventProviderFactory {
	(...args: any[]): IEventProvider;
}
export interface IEventProvider {}

export enum EHttpVerb {
	GET = 'GET',
	POST = 'POST',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}
interface PluralEndpoint extends String {}
interface IApiDescription {
	method: EHttpVerb;
	endPoint: string;
	body: object;
	queryString: object;
}

type TEntitiesJsonResponse =
	| IRawAdapterEntityAttributes
	| IRawAdapterEntityAttributes[]
	| undefined;

/**
 * Adapter for RESTful HTTP APIs.
 *
 * @see https://www.npmjs.com/package/diaspora-server Diaspora-Server: Package built on Diaspora & Express.js to easily configure HTTP APIs compatible with this adapter.
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
export class WebApiAdapter extends Adapter<WebApiEntity> {
	private baseEndPoint: string;

	/**
	 * Hash mapping singular API names to plural API names
	 *
	 * @author Gerkin
	 */
	private pluralApis: { [key: string]: string };

	/**
	 * Create a new instance of web api adapter.
	 *
	 * @param config         - Configuration of this adapter.
	 * @param eventProviders -
	 * @author gerkin
	 */
	constructor(
		dataSourceName: string,
		config: IWebApiAdapterConfig = { path: '' },
		eventProviders: IEventProvider[] = [DefaultQueryTransformerFactory()]
	) {
		super(WebApiEntity, dataSourceName);

		const defaultedConfig = _.defaults(config, {
			scheme: false,
			host: false,
			port: false,
			path: '',
			pluralApis: {},
		});
		WebApiAdapter.checkWebApiAdapterConfig(defaultedConfig);
		if (process.browser && false === defaultedConfig.host) {
			// Endpoint is an absolute url
			this.baseEndPoint = defaultedConfig.path;
		} else {
			const portString = defaultedConfig.port ? `:${defaultedConfig.port}` : '';
			const schemeString = defaultedConfig.scheme
				? `${defaultedConfig.scheme}:`
				: '';
			this.baseEndPoint = `${schemeString}//${defaultedConfig.host}${portString}${
				defaultedConfig.path
			}`;
		}
		this.pluralApis = defaultedConfig.pluralApis;

		// Bind lifecycle events
		_.map(eventProviders, eventProvider =>
			_.forIn(eventProvider, (listener, event) => this.on(event, listener))
		);

		if (this.has('initialize')) {
			this.emit('initialize')
				.then(() => this.emit('ready'))
				.catch(err => this.emit('error', err));
		} else {
			this.emit('ready');
		}
	}

	private static httpErrorFactories = {
		400: (xhr: IXhrResponse) =>
			new Error(
				`Posted data through HTTP is invalid; message ${WebApiAdapter.getMessage(
					xhr
				)}`
			),
		404: (xhr: IXhrResponse) =>
			new Error(`Reached 404, message is ${WebApiAdapter.getMessage(xhr)}`),
		_: (xhr: IXhrResponse) =>
			new Error(
				`Unhandled HTTP error with status code ${
					xhr.status
				} & message ${WebApiAdapter.getMessage(xhr)}`
			),
	};

	private async sendRequest(
		verb: EHttpVerb,
		endPoint: string,
		body?: object,
		queryString?: object
	) {
		logger.verbose(`Sending ${verb} HTTP request to "${endPoint}" with data:`, {
			body,
			queryString,
		});
		const response = await WebApiAdapter.httpRequest(
			verb,
			endPoint,
			body,
			queryString
		);
		logger.silly('HTTP Request response:', response);
		return response;
	}

	private getPluralEndpoint(table: string): PluralEndpoint {
		return _.get(this.pluralApis, table, table + 's');
	}

	private static queryObjectToString(queryObject?: QueryLanguage.SelectQuery) {
		return (
			_.chain(queryObject)
				.tap(_.cloneDeep)
				.omitBy(val => _.isObject(val) && _.isEmpty(val))
				// { foo: 1, bar: { baz: 2 } }
				.mapValues(JSON.stringify)
				// { foo: '1', bar: '{"baz": "2"}' }
				.toPairs()
				// [ [ 'foo', '1' ], [ 'bar', '{"baz":2}' ] ]
				.map(_.partial(_.map, _, encodeURIComponent))
				// [ [ 'foo', '1' ], [ 'bar', '%7B%22baz%22%3A2%7D' ] ]
				.map(arr => `${arr[0]}=${arr[1]}`)
				// [ 'foo=1', 'bar=%7B%22baz%22%3A2%7D' ]
				.join('&')
		);
	}

	private static getMessage(xhr: IXhrResponse) {
		return _.get(xhr, 'response.message')
			? `"${(xhr as { response: { message: string } }).response.message}"`
			: 'NULL';
	}

	/**
	 * Binds `resolve` & `reject` to XHR events.
	 *
	 * @param	xhr		- XHR request to bind
	 * @param	resolve	- Promise resolution function that will be triggered if `onload` is ran & the status is a 2xx.
	 * @param	reject	- Promise rejection function to trigger if `onerror` is ran, or a non 2xx status is returned.
	 * @returns XHR with resolution bound to a promise.
	 */
	private static defineXhrEvents(
		xhr: XMLHttpRequest,
		resolve: (
			thenableOrResult?:
				| TEntitiesJsonResponse
				| PromiseLike<TEntitiesJsonResponse>
				| undefined
		) => void,
		reject: (thenableOrResult?: {} | PromiseLike<any> | undefined) => void
	) {
		xhr.onload = () => {
			if (_.inRange(xhr.status, 200, 299)) {
				return resolve(xhr.response);
			} else {
				// Retrieve the function that will generate the error
				const errorBuilder = _.get(
					WebApiAdapter.httpErrorFactories,
					xhr.status,
					WebApiAdapter.httpErrorFactories._
				);
				return reject(errorBuilder(xhr));
			}
		};
		xhr.onerror = () => {
			return reject(WebApiAdapter.httpErrorFactories._(xhr));
		};
		return xhr;
	}

	private static async httpRequest(
		method: EHttpVerb,
		endPoint: string,
		data?: object | true,
		queryObject?: object
	): Promise<TEntitiesJsonResponse> {
		if (!process.browser) {
			if (_.isNil(data)) {
				data = true;
			}
			return await require('request-promise')[method.toLowerCase()](endPoint, {
				json: data,
				qs: _.mapValues(
					queryObject,
					data => (typeof data === 'object' ? JSON.stringify(data) : data)
				),
			});
		} else {
			return new Promise(
				(
					resolve: (
						value?: TEntitiesJsonResponse | PromiseLike<TEntitiesJsonResponse>
					) => void,
					reject
				) => {
					/* globals XMLHttpRequest: false */
					const xhr = WebApiAdapter.defineXhrEvents(
						new XMLHttpRequest(),
						resolve,
						reject
					);
					const queryString = WebApiAdapter.queryObjectToString(queryObject);
					xhr.responseType = 'json';
					xhr.open(method, `${endPoint}${queryString ? `?${queryString}` : ''}`);
					xhr.setRequestHeader('Content-Type', 'application/json');
					xhr.send(_.isNil(data) ? undefined : JSON.stringify(data));
				}
			);
		}
	}

	private static getQueryObject(
		queryFind: QueryLanguage.SelectQueryRemapped,
		options: QueryLanguage.QueryOptions
	) {
		if (0 === options.skip) {
			delete options.skip;
		}

		return _.assign({}, _.omit(options, ['remapInput', 'remapOutput']), {
			where: queryFind,
		});
	}

	private static maybeAddIdHashToEntities(
		entities: IRawEntityAttributes[],
		adapter: WebApiAdapter
	) {
		return _.map(entities, entity => WebApiEntity.setId(entity, adapter));
	}

	private static checkWebApiAdapterConfig(config: IWebApiAdapterConfig) {
		if (!process.browser) {
			if (!_.isString(config.host)) {
				throw new Error(
					`"config.host" is not defined, or is not a string: had "${config.host}"`
				);
			}
			if (!_.isString(config.scheme)) {
				throw new Error(
					`"config.scheme" is not defined, or is not a string: had "${
						config.scheme
					}"`
				);
			}
		}
	}

	/**
	 * Send an http query to the targeted `endPoint` using `method` as verb.
	 *
	 * @async
	 * @param   verb        - Valid HTTP verb. This adapter uses `GET`, `POST`, `PATCH` & `DELETE`.
	 * @param   endPoint    - Name of the endpoint to interact with. It will be prepended with {@link Adapters.WebApiDiasporaAdapter#baseEndPoint}.
	 * @param   data        - Optionnal data to send within the body of the request.
	 * @param   queryObject - Optionnal query object to send along with the request.
	 * @returns Promise resolved with the resulting data.
	 */
	private apiQuery(
		verb: EHttpVerb,
		endPoint: string,
		data?: object,
		queryObject?: object
	): Promise<IRawAdapterEntityAttributes | undefined>;
	private apiQuery(
		verb: EHttpVerb,
		endPoint: PluralEndpoint,
		data?: object,
		queryObject?: object
	): Promise<IRawAdapterEntityAttributes[]>;
	private apiQuery(
		verb: EHttpVerb,
		endPoint: string,
		data?: object,
		queryObject?: object
	): Promise<TEntitiesJsonResponse> {
		return this.sendRequest(
			verb,
			`${this.baseEndPoint}/${endPoint.toLowerCase()}`,
			data,
			queryObject
		);
	}

	// -----
	// ### Insert

	/**
	 * Insert a single entity through an HTTP API.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for use of web api.
	 * @author gerkin
	 * @param   table  - Name of the table to insert data in.
	 * @param   entity - Hash representing the entity to insert.
	 * @returns Promise resolved once insertion is done. Called with (*{@link WebApiEntity}* `entity`).
	 */
	async insertOne(
		table: string,
		entity: IRawEntityAttributes
	): Promise<IRawAdapterEntityAttributes | undefined> {
		let newEntity = await this.apiQuery(EHttpVerb.POST, table, entity);
		if (!_.isNil(newEntity)) {
			return WebApiEntity.setId(newEntity, this);
		} else {
			return undefined;
		}
	}

	/**
	 * Insert several entities through an HTTP API.
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for use of web api.
	 * @author gerkin
	 * @param   table    - Name of the table to insert data in.
	 * @param   entities - Hash representing entities to insert.
	 * @returns Promise resolved once insertion is done. Called with (*{@link WebApiEntity[]}* `entities`).
	 */
	async insertMany(
		table: string,
		entities: IRawEntityAttributes[]
	): Promise<IRawAdapterEntityAttributes[]> {
		let newEntities = await this.apiQuery(
			EHttpVerb.POST,
			this.getPluralEndpoint(table),
			entities
		);
		newEntities = WebApiAdapter.maybeAddIdHashToEntities(newEntities, this);
		return newEntities || [];
	}

	// -----
	// ### Find

	/**
	 *
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for use of web api.
	 * @author gerkin
	 * @param   table     - Name of the table to retrieve data from.
	 * @param   queryFind - Hash representing the entity to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	async findOne(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<IRawAdapterEntityAttributes | undefined> {
		const apiDesc: IApiDescription = await this.emit(
			'beforeQuery',
			'find',
			'one',
			table,
			queryFind,
			null,
			options
		);
		const newEntity = await this.apiQuery(
			apiDesc.method,
			apiDesc.endPoint,
			apiDesc.body,
			apiDesc.queryString
		);
		if (!_.isNil(newEntity)) {
			return WebApiEntity.setId(newEntity, this);
		} else {
			return newEntity;
		}
	}

	/**
	 *
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for use of web api.
	 * @author gerkin
	 * @param   table     - Name of the table to retrieve data from.
	 * @param   queryFind - Hash representing entities to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
	 */
	async findMany(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<IRawAdapterEntityAttributes[]> {
		const apiDesc = await this.emit(
			'beforeQuery',
			'find',
			'many',
			table,
			queryFind,
			null,
			options
		);
		let newEntities = await this.apiQuery(
			apiDesc.method,
			apiDesc.endPoint as PluralEndpoint,
			apiDesc.body,
			apiDesc.queryString
		);
		newEntities = WebApiAdapter.maybeAddIdHashToEntities(newEntities, this);
		return newEntities || [];
	}

	// -----
	// ### Update

	/**
	 *
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for use of web api.
	 * @author gerkin
	 * @param   table     - Name of the table to update data in.
	 * @param   queryFind - Hash representing the entity to find.
	 * @param   update    - Object properties to set.
	 * @param   options   - Hash of options.
	 * @returns  Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	async updateOne(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<IRawAdapterEntityAttributes | undefined> {
		let entity = await this.apiQuery(
			EHttpVerb.PATCH,
			table,
			update,
			WebApiAdapter.getQueryObject(queryFind, options)
		);
		if (!_.isNil(entity)) {
			entity.idHash = {
				[this.name]: entity.id,
			};
		}
		return entity;
	}

	/**
	 *
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for use of web api.
	 * @author gerkin
	 * @param   table     - Name of the table to update data in.
	 * @param   queryFind - Hash representing entities to find.
	 * @param   update    - Object properties to set.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
	 */
	async updateMany(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		update: IRawEntityAttributes,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<IRawAdapterEntityAttributes[]> {
		let entities = await this.apiQuery(
			EHttpVerb.PATCH,
			this.getPluralEndpoint(table),
			update,
			WebApiAdapter.getQueryObject(queryFind, options)
		);
		entities = WebApiAdapter.maybeAddIdHashToEntities(entities, this);
		return entities || [];
	}

	// -----
	// ### Delete

	/**
	 *
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for use of web api.
	 * @author gerkin
	 * @param   table     - Name of the table to delete data from.
	 * @param   queryFind - Hash representing the entity to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once item is found. Called with (*undefined*).
	 */
	async deleteOne(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<void> {
		await this.apiQuery(
			EHttpVerb.DELETE,
			table,
			undefined,
			WebApiAdapter.getQueryObject(queryFind, options)
		);
	}

	/**
	 *
	 *
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for use of web api.
	 * @author gerkin
	 * @param   table     - Name of the table to delete data from.
	 * @param   queryFind - Hash representing entities to find.
	 * @param   options   - Hash of options.
	 * @returns Promise resolved once items are deleted. Called with (*undefined*).
	 */
	async deleteMany(
		table: string,
		queryFind: QueryLanguage.SelectQuery,
		options: QueryLanguage.QueryOptions = this.normalizeOptions()
	): Promise<void> {
		await this.apiQuery(
			EHttpVerb.DELETE,
			this.getPluralEndpoint(table),
			undefined,
			WebApiAdapter.getQueryObject(queryFind, options)
		);
	}
}
