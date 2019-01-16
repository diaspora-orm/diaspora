import * as _ from 'lodash';

import { Adapter as _Adapter } from '../base';
import AAdapterEntity = _Adapter.Base.AAdapterEntity;
import AAdapter = _Adapter.Base.AAdapter;
import { generateUUID } from '../../utils';
import { Constructor } from './adapter-utils';
import {
	IEntityAttributes,
	EntityUid,
	IEntityProperties
} from '../../types/entity';

export const AutoIdAdapterEntity = <TAdapterEntityCtor extends Constructor<AAdapterEntity>>(
	adapterEntity: TAdapterEntityCtor
): TAdapterEntityCtor =>
class AutoIdAdapterEntity extends adapterEntity {
	/**
	 * This decorator allows to add the ability to the entity to generates its own ID. It should be used when the underlying store objects does not generates IDs itself, like the {@link InMemoryAdapter}.
	 *
	 * @author Gerkin
	 * @param attributes - Attributes of the entity
	 * @param adapter    - Adapter that will persist the entity
	 * @param propName   - Property that should contain the ID
	 * @param id         - Value of the ID
	 */
	
	public static setId(
		attributes: IEntityAttributes,
		adapter: AAdapter,
		id?: EntityUid,
		propName: string = 'id'
	): IEntityProperties {
		const defaultedId = id || _.get( attributes, propName, generateUUID() );
		const adapterEntityAttributes = _.merge( attributes, {
			id: defaultedId,
			idHash: {
				[adapter.name]: defaultedId,
			},
		} );
		return adapterEntityAttributes;
	}
	
	/**
	 * Calls the static equivalient {@link AutoIdAdapterEntity.setId} on the attributes of the current adapter entity.
	 *
	 * @author Gerkin
	 * @param adapter  - Adapter that will persist the entity
	 * @param propName - Property that should contain the ID
	 * @param id       - Value of the ID
	 */
	protected setId(
		adapter: AAdapter,
		propName: string = 'id',
		id: EntityUid = _.get( this, 'attributes.id', generateUUID() )
	): this {
		this._properties = AutoIdAdapterEntity.setId(
			this.attributes,
			adapter,
			id,
			propName
		);
		return this;
	}
};
