import * as _ from 'lodash';

import { DataAccessLayer } from './adapters/dataAccessLayer';
import { AdapterEntity, Adapter } from './adapters/base';
import { Model } from './model';

export interface IDataSourceRegistry {
	[key: string]: DataAccessLayer<AdapterEntity, Adapter>;
}
export const dataSourceRegistry: IDataSourceRegistry = {};

export interface IModelRegistry {
	[key: string]: Model;
}
export const modelRegistry: IModelRegistry = {};

export const namedFunctions = {
	Diaspora: {
		'Date.now()': () => new Date(),
	},
};

export const getDefaultFunction = ( identifier: string | Function ): Function => {
	if ( _.isString( identifier ) ) {
		const match = identifier.match( /^(.+?)(?:::(.+?))+$/ );
		if ( match ) {
			const parts = identifier.split( '::' );
			const namedFunction = _.get( namedFunctions, parts );
			if ( _.isFunction( namedFunction ) ) {
				return namedFunction();
			}
		}
		return _.identity;
	}
	return identifier;
};
