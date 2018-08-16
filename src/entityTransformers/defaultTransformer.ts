import * as _ from 'lodash';

import { EntityTransformer } from './entityTransformer';
import { PathStack } from './pathStack';
import { FieldDescriptor, EFieldType } from '../types/modelDescription';
import { getDefaultValue } from '../utils';
import { IEntityAttributes } from '../types/entity';

/**
 * The DefaultTransformer class is used to apply default values to an entity or its fields against a model description.
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
		if ( fieldDesc.type === EFieldType.OBJECT ){
			if (
				_.keys( fieldDesc.attributes ).length > 0 &&
				!_.isNil( valOrBaseDefault )
			) {
				const childDefaultProps = _.omitBy(
					_.chain( fieldDesc.attributes )
						// Do not default existing fields
						.omit( _.keys( valOrBaseDefault ) )
						.mapValues( ( fieldDesc, key ) => this.applyField(
							value,
							( keys as PathStack ).clone().pushValidationProp( 'attributes' ).pushProp( key ),
							{getProps: true}
						) )
						.value(),
					_.isUndefined
				);
				if ( _.isUndefined( val ) ){
					// If the object does not exist, properties of parent's default will be used instead of children properties.
					return _.assign( childDefaultProps, valOrBaseDefault );
				} else {
					// If the object exists already, merge missing props.
					return _.assign( valOrBaseDefault, childDefaultProps );
				}
			}
		} else if ( fieldDesc.type === EFieldType.ARRAY ){
			if (
				!_.isUndefined( valOrBaseDefault ) &&
				fieldDesc.of &&
				( fieldDesc.of.type === EFieldType.OBJECT || fieldDesc.of.type === EFieldType.ARRAY )
			){
				return ( valOrBaseDefault as any[] ).map( ( child, index ) => this.applyField(
					child,
					( keys as PathStack ).clone().pushValidationProp( 'of' ).pushEntityProp( index + '' )
				) );
			}
		}
		return valOrBaseDefault;
	}
}
