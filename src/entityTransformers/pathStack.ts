import { IEntityAttributes } from './../types/entity';
import * as _ from 'lodash';
import { _ModelDescription } from '../types/modelDescription';

/**
 * The PathStack class allows model validation to follow different paths in model description & entity.
 */
export class PathStack {
	public segmentsEntity: string[];
	public segmentsValidation: string[];
	
	public constructor( segments?: string[] );
	/**
	 * Constructs a pathstack.
	 *
	 * @author gerkin
	 */
	public constructor( segmentsEntity?: string[], segmentsValidation?: string[] ) {
		if ( _.isNil( segmentsEntity ) ) {
			segmentsEntity = [];
		}
		if ( _.isNil( segmentsValidation ) ) {
			segmentsValidation = segmentsEntity;
		}
		
		this.segmentsEntity = segmentsEntity;
		this.segmentsValidation = segmentsValidation;
	}
	
	/**
	 * Add a path segment for entity navigation.
	 *
	 * @param   prop - Properties to add.
	 * @returns Returns `this`.
	 */
	public pushEntityProp( ...prop: string[] ): this {
		this.segmentsEntity = _.chain( this.segmentsEntity )
		.concat( _.flattenDeep( prop ) )
		.reject( _.isNil )
		.value();
		return this;
	}
	
	/**
	 * Add a path segment for model description navigation.
	 *
	 * @param   prop - Properties to add.
	 * @returns Returns `this`.
	 */
	public pushValidationProp( ...prop: string[] ): this {
		this.segmentsValidation = _.chain( this.segmentsValidation )
		.concat( prop )
		.reject( _.isNil )
		.value();
		return this;
	}
	
	/**
	 * Add a path segment for both entity & model description navigation.
	 *
	 * @param   prop - Properties to add.
	 * @returns Returns `this`.
	 */
	public pushProp( ...prop: string[] ): this {
		return this.pushEntityProp( ...prop ).pushValidationProp( ...prop );
	}
	
	/**
	 * Get a string version of entity segments.
	 *
	 * @returns String representation of path in entity.
	 */
	public toValidatePath(): string {
		return this.segmentsEntity.join( '.' );
	}
	
	/**
	 * Cast this PathStack to its representing arrays.
	 */
	public toArray(): string[][] {
		return [this.segmentsEntity.slice(), this.segmentsValidation.slice()];
	}
	
	/**
	 * Duplicate this PathStack, detaching its state from the new.
	 *
	 * @returns Clone of caller PathStack.
	 */
	public clone(): PathStack {
		return new PathStack( ...this.toArray() );
	}
	
	/**
	 * Applies the path stack to retrieve the attribute description in the provided attributes description
	 * 
	 * @author gerkin
	 * @param desc - Attributes description to retrieve field from
	 */
	public getDesc( desc: _ModelDescription.AttributesDescription ){
		return this.segmentsValidation.length > 0 ? _.get( desc, this.segmentsValidation ) : desc;
	}
	
	/**
	 * Applies the path stack to retrieve the field in the provided entity attributes
	 * 
	 * @author gerkin
	 * @param entity - Entity to retrieve field from
	 */
	public getProp( entity: IEntityAttributes ){
		return this.segmentsEntity.length > 0 ? _.get( entity, this.segmentsEntity ) : entity;
	}
}
