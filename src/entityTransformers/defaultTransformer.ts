import { defaults, omitBy, chain, isUndefined, isNil, assign, keys, mapValues, first, omit } from 'lodash';

import { EntityTransformers as EntityTransformers_EntityTransformer } from './entityTransformer';
import EntityTransformer = EntityTransformers_EntityTransformer.AEntityTransformer;
import { PathStack } from './pathStack';
import { _ModelDescription, EFieldType } from '../types/modelDescription';
import { getDefaultValue } from '../utils';
import { IEntityAttributes } from '../types/entity';

export namespace EntityTransformers{
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
			return defaults( entity, omitBy(
				mapValues( this._modelAttributes, ( fieldDesc, field ) => this.applyField( entity, new PathStack().pushProp( field ), {
					getProps: true,
				} ) ),
				isUndefined
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
			propPath: PathStack | string[],
			options: { getProps: boolean } = { getProps: false }
		): any {
			defaults( options, { getProps: true } );
			const keysPathStack = propPath instanceof PathStack ? propPath : new PathStack( propPath );
			
			const val = options.getProps ? keysPathStack.getProp( value ) : value;
			const fieldDesc = keysPathStack.getDesc( this.modelAttributes );
			
			// Return the `default` if value is undefined
			const valOrBaseDefault = isNil( val )
				? getDefaultValue( fieldDesc.default )
				: val;
			
			// Recurse if we are defaulting an object
			if ( fieldDesc.type === EFieldType.OBJECT ){
				if (
					fieldDesc.attributes.length > 0 &&
					keys( fieldDesc.attributes[0] ).length > 0 &&
					!isNil( valOrBaseDefault )
				) {
					const childDefaultProps = omitBy(
						mapValues(
							// Do not default existing fields
							omit(
								// Get the first definition
								first( fieldDesc.attributes ),
								keys( valOrBaseDefault ) ),
							// Apply defaults on each non-attributed fields
							( fieldDesc, key ) => this.applyField(
								value,
								keysPathStack.clone().pushValidationProp( 'attributes', '0' ).pushProp( key ),
								{getProps: true} ) ),
						isUndefined
					);
					if ( isUndefined( val ) ){
						// If the object does not exist, properties of parent's default will be used instead of children properties.
						return assign( childDefaultProps, valOrBaseDefault );
					} else {
						// If the object exists already, merge missing props.
						return assign( valOrBaseDefault, childDefaultProps );
					}
				}
			} else if ( fieldDesc.type === EFieldType.ARRAY ){
				if (
					!isUndefined( valOrBaseDefault ) &&
					fieldDesc.of.length > 0 &&
					( fieldDesc.of[0].type === EFieldType.OBJECT || fieldDesc.of[0].type === EFieldType.ARRAY )
				){
					return ( valOrBaseDefault as any[] ).map( ( child, index ) => this.applyField(
						child,
						keysPathStack.clone().pushValidationProp( 'of', '0' ).pushEntityProp( String( index ) )
					) );
				}
			}
			return valOrBaseDefault;
		}
	}
}
