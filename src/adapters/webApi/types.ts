import { _QueryLanguage } from '../../types/queryLanguage';
import { IEntityAttributes, IEntityProperties } from '../../types/entity';

export interface IXhrResponse extends XMLHttpRequest {
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

export interface IWebApiAdapterInternalConfig extends IWebApiAdapterConfig {
	host: string | false;
	scheme: string | false;
	port: number | false;
	path: string;
	pluralApis?: { [key: string]: string };
	baseEndPoint?: string;
}

export type IEventProviderFactory = ( ...args: any[] ) => IEventProvider;
export interface IEventProvider {}

/**
 * Defines the HTTP verbs usable by a query.
 *
 * @author Gerkin
 */
export enum EHttpVerb {
	GET = 'GET',
	POST = 'POST',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}
export interface IApiDescription {
	method: EHttpVerb;
	endPoint: string;
	body: object;
	queryString: object;
}

export interface IErrorMessage {
	message?: string;
}
export type TEntitiesJsonResponse =
| IEntityProperties
| IEntityProperties[]
| undefined;

export interface IQueryDescriptor {
	queryType: 'find' | 'update' | 'delete' | 'insert';
	queryNum: 'one' | 'many';
	modelName: string;
	select: _QueryLanguage.SelectQueryOrCondition;
	update?: IEntityAttributes;
	options: QueryOptions;
	apiDesc: IApiDescription;
}
export interface IQueryDescriptorRaw {
	queryType: 'find' | 'update' | 'delete' | 'insert';
	queryNum: 'one' | 'many';
	modelName: string;
	select: _QueryLanguage.SelectQueryOrCondition;
	update?: IEntityAttributes;
	options: _QueryLanguage.IQueryOptions;
	apiDesc: IApiDescription;
}

export type QueryOptions = {
	skip?: number;
	limit?: number;
} | {
	limit: number;
	page: number;
};
