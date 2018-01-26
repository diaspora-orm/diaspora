import * as Diaspora from '../..';

declare module '../..' {
	export namespace Adapters {
		export namespace BaseAdapter {
			class AdapterEntity<T extends Adapter> {
				constructor(baseEntity: object, adapter: T);
			}
		}
	}
}
