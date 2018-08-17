import * as _ from 'lodash';

import { DataAccessLayer } from './adapters/dataAccessLayer';
import { AdapterEntity, Adapter } from './adapters/base';
import { Model } from './model';
import { IEntityAttributes } from './types/entity';

export interface IDataSourceRegistry {
	[key: string]: DataAccessLayer<AdapterEntity, Adapter>;
}
export const dataSourceRegistry: IDataSourceRegistry = {};

export interface IModelRegistry {
	[key: string]: Model<IEntityAttributes>;
}
export const modelRegistry: IModelRegistry = {};

export const namedFunctions = {
	Diaspora: {
		'Date.now()': () => new Date(),
	},
};
