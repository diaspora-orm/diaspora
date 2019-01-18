import { isNil, chain, flattenDeep, get, concat, reject } from 'lodash';

import { IEntityAttributes } from './../types/entity';
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
		if ( isNil( segmentsEntity ) ) {
			segmentsEntity = [];
		}
		if ( isNil( segmentsValidation ) ) {
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
		this.segmentsEntity = reject(
			concat( this.segmentsEntity, flattenDeep( prop ) ),
			isNil
		);
		return this;
	}
	
	/**
	 * Add a path segment for model description navigation.
	 *
	 * @param   prop - Properties to add.
	 * @returns Returns `this`.
	 */
	public pushValidationProp( ...prop: string[] ): this {
		this.segmentsValidation = reject(
			concat( this.segmentsValidation, flattenDeep( prop ) ),
			isNil
		);
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
		return this.segmentsValidation.length > 0 ? get( desc, this.segmentsValidation ) : desc;
	}
	
	/**
	 * Applies the path stack to retrieve the field in the provided entity attributes
	 * 
	 * @author gerkin
	 * @param entity - Entity to retrieve field from
	 */
	public getProp( entity: IEntityAttributes ){
		return this.segmentsEntity.length > 0 ? get( entity, this.segmentsEntity ) : entity;
	}
}
