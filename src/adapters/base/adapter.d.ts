import * as Diaspora from '../../';

declare module '../../' {
	export namespace Adapters {
		export namespace BaseAdapter {
			export class Adapter {
				constructor(classEntity: typeof AdapterEntity);

				remapInput(table: string, entity: AdapterEntity<any>): AdapterEntity<any>;
				remapOutput(table: string, entity: AdapterEntity<any>): AdapterEntity<any>;

				normalizeOptions(optionsObject: object): object;
				normalizeQuery(queryObject: object, optionsObject: object): object;

				public name: string;
				private classEntity: typeof AdapterEntity;
			}
		}
	}
}
