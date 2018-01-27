import * as Diaspora from '.';

declare module '.' {
	interface RemapIterator {
		(
			entity: Diaspora.Adapters.BaseAdapter.AdapterEntity<
				Diaspora.Adapters.BaseAdapter.Adapter
			>
		): void;
	}
	interface EntityObject {
		[key: string]: any;
	}
	interface IAdapterRegistry {
		[key: string]: Diaspora.Adapters.BaseAdapter.Adapter;
	}
	interface IQueryTypeDescriptor {
		full: string;
		query: string;
		number: string;
	}

	class Diaspora {
		default: any;
		defaultField: any;
		createDataSource: any;
		registerDataSource: any;
		createNamedDataSource: any;
		declareModel: any;
		registerAdapter: any;

		models: any;
		dataSources: any;
		adapters: any;
		dependencies: any;
		logger: any;
		components: any;
		namedFunctions: any;
	}
}
