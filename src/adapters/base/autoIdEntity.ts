import * as _ from 'lodash';

import { AdapterEntity, Adapter, IRawAdapterEntityAttributes } from '../base';
import { IRawEntityAttributes, EntityUid } from '../../entity/entityFactory';
import { generateUUID } from '../../utils';
import { Constructable } from './adapter-utils';

export interface IAutoIdAdapterEntityStatic {
	new (...args: any[]): AdapterEntity;
	setId(
		attributes: IRawEntityAttributes,
		adapter: Adapter,
		propName: string,
		id: EntityUid
	): IRawAdapterEntityAttributes;
}

/**
 * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
 */
export type Built<T extends Constructable<AdapterEntity>> = T &
	IAutoIdAdapterEntityStatic;

export const AutoIdAdapterEntity = <T extends Constructable<AdapterEntity>>(
	adapterEntity: T
): Built<T> => {
	return class AutoIdAdapterEntity extends adapterEntity {
		protected setId(
			adapter: Adapter,
			propName: string = 'id',
			id: EntityUid = _.get(this, 'attributes.id', generateUUID())
		): this {
			this._attributes = AutoIdAdapterEntity.setId(
				this.attributes,
				adapter,
				propName,
				id
			);
			return this;
		}

		public static setId(
			attributes: IRawEntityAttributes,
			adapter: Adapter,
			propName: string = 'id',
			id: EntityUid = _.get(attributes, 'id', generateUUID())
		): IRawAdapterEntityAttributes {
			const adapterEntityAttributes = _.merge(attributes, {
				id,
				idHash: {
					[adapter.name]: attributes[propName],
				},
			});
			return adapterEntityAttributes;
		}
	};
};
