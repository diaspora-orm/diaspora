import * as _ from 'lodash';

import { Adapter } from './adapters';
import AAdapterEntity = Adapter.Base.AAdapterEntity;
import AAdapter = Adapter.Base.AAdapter;
import DataAccessLayer = Adapter.DataAccessLayer;

import { Model } from './model';
import { IEntityAttributes } from './types/entity';

export interface IDataSourceRegistry {
	[key: string]: DataAccessLayer<AAdapterEntity, AAdapter>;
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
