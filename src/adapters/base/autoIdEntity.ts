import * as _ from 'lodash';

import { AdapterEntity, Adapter, IRawAdapterEntityAttributes } from '../base';
import { IRawEntityAttributes, EntityUid } from '../../entities/entityFactory';
import { generateUUID } from '../../utils';
import { Constructable } from './adapter-utils';

export const AutoIdAdapterEntity = <T extends Constructable<AdapterEntity>>(
	adapterEntity: T
): T => {
	return class AutoIdAdapterEntity extends adapterEntity {
		public static setId(
			attributes: IRawEntityAttributes,
			adapter: Adapter,
			propName: string = 'id',
			id: EntityUid = _.get( attributes, 'id', generateUUID() )
		): IRawAdapterEntityAttributes {
			const adapterEntityAttributes = _.merge( attributes, {
				id,
				idHash: {
					[adapter.name]: attributes[propName],
				},
			} );
			return adapterEntityAttributes;
		}

		protected setId(
			adapter: Adapter,
			propName: string = 'id',
			id: EntityUid = _.get( this, 'attributes.id', generateUUID() )
		): this {
			this._attributes = AutoIdAdapterEntity.setId(
				this.attributes,
				adapter,
				propName,
				id
			);
			return this;
		}
	};
};
