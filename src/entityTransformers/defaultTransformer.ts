import * as _ from 'lodash';

import { EntityTransformer } from './entityTransformer';
import { PathStack } from './pathStack';
import { FieldDescriptor, EType } from '../types/modelDescription';
import { getDefaultValue } from '../utils';
import { IEntityAttributes } from '../types/entity';

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
	public apply( entity: IEntityAttributes ) {
		// Apply method `defaultField` on each field described
		return _.defaults( entity, _.omitBy(
			_.chain( this._modelAttributes ).mapValues( ( fieldDesc, field ) =>
			this.applyField( entity, new PathStack().pushProp( field ), {
				getProps: true,
			} ) ) .value(),
			_.isUndefined
		) );
	}
	
	/**
	 * Set the default on a single field according to its description.
	 *
	 * @author gerkin
	 * @param   value     - Value to default.
	 * @param   fieldDesc - Description of the field to default.
	 * @returns Defaulted value.
	 */
	public applyField(
		value: any,
		keys: PathStack | string[],
		options: { getProps: boolean } = { getProps: false }
	): any {
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
		const valOrBaseDefault = _.isNil( val )
		? getDefaultValue( fieldDesc.default )
		: val;
		
		// Recurse if we are defaulting an object
		if (
			fieldDesc.type === EType.OBJECT &&
			_.keys( fieldDesc.attributes ).length > 0 &&
			!_.isNil( valOrBaseDefault )
		) {
			return _.merge(
				valOrBaseDefault,
				_.omitBy(
					_.chain( fieldDesc.attributes )
					.mapValues( ( fieldDesc, key ) => {
						const defaulted = this.applyField(
							value,
							( keys as PathStack ).clone().pushProp( key )
						);
						return _.omitBy( defaulted, _.isNil );
					} )
					.value(),
					_.isUndefined
				)
			);
		} else {
			return valOrBaseDefault;
		}
	}
}
