import * as _ from 'lodash';

import { EntityTransformer } from './entityTransformer';
import { IRawEntityAttributes } from '../entities/entityFactory';
import { PathStack } from './pathStack';
import { FieldDescriptor, FieldDescriptorTypeChecks } from '../types/modelDescription';
import { getDefaultValue } from '../utils';

/**
 * The Validator class is used to check an entity or its fields against a model description.
 */
export class DefaultTransformer extends EntityTransformer {
	/**
	 * Set default values if required.
	 *
	 * @author gerkin
	 * @param   entity    - Entity to set defaults in.
	 * @param   modelDesc - Model description.
	 * @returns  Entity merged with default values.
	 */
	public async apply( entity: IRawEntityAttributes ) {
		// Apply method `defaultField` on each field described
		return _.defaults(
			entity,
			_.omitBy(
				await _.chain( this._modelAttributes )
				.mapValues( ( fieldDesc, field ) =>
					this.applyField( entity, new PathStack().pushProp( field ), {
						getProps: true,
					} )
				)
				.thru( async promises => _.zipObject( _.keys( promises ), await Promise.all( _.values( promises ) ) ) )
				.value(),
				_.isUndefined
			)
		);
	}

	/**
	 * Set the default on a single field according to its description.
	 *
	 * @author gerkin
	 * @param   value     - Value to default.
	 * @param   fieldDesc - Description of the field to default.
	 * @returns Defaulted value.
	 */
	public async applyField(
		value: any,
		keys: PathStack | string[],
		options: { getProps: boolean } = { getProps: false }
	): Promise<any> {
		_.defaults( options, { getProps: true } );
		if ( !( keys instanceof PathStack ) ) {
			keys = new PathStack( keys );
		}

		const val = options.getProps ? _.get( value, keys.segmentsEntity ) : value;
		const fieldDesc = _.get(
			this.modelAttributes,
			keys.segmentsValidation
		) as FieldDescriptor;

		// Return the `default` if value is undefined
		const valOrBaseDefault =
			val || await getDefaultValue( fieldDesc.default );

		// Recurse if we are defaulting an object
		if (
			FieldDescriptorTypeChecks.isObjectFieldDescriptor( fieldDesc ) &&
			_.keys( fieldDesc.attributes ).length > 0 &&
			!_.isNil( valOrBaseDefault )
		) {
			return _.merge(
				valOrBaseDefault,
				_.omitBy(
					await _.chain( fieldDesc.attributes )
					.mapValues( async ( fieldDesc, key ) => {
						const defaulted = await this.applyField(
							value,
							( keys as PathStack ).clone().pushProp( key )
						);
						return _.omitBy( defaulted, _.isNil );
					} )
					.thru( async promises => _.zipObject( _.keys( promises ), await Promise.all( _.values( promises ) ) ) )
					.value(),
					_.isUndefined
				)
			);
		} else {
			return valOrBaseDefault;
		}
	}
}
