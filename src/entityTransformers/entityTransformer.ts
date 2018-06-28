import * as _ from 'lodash';

import { IRawEntityAttributes } from '../entities/entityFactory';
import { FieldDescriptor } from '../types/modelDescription';
import { PathStack } from './pathStack';

/**
 * The Validator class is used to check an entity or its fields against a model description.
 */
export abstract class EntityTransformer {
	/**
	 * Construct a Validator configured for the provided model.
	 *
	 * @param modelAttributes - Model description to validate.
	 */
	public constructor(
		protected readonly _modelAttributes: { [key: string]: FieldDescriptor }
	) {}

	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 */
	public abstract apply( entity: IRawEntityAttributes ) : IRawEntityAttributes;

	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 * @param   value                  - Value to check.
	 * @param   keys                   - Pathstack representing path to this validation.
	 * @param   options                - Hash of options.
	 * @param   options.getProps=false - If `false`, it will use the value directly. If `true`, will try to get the property from value, as if it was an entity.
	 * @returns Hash describing errors.
	 */
	public abstract applyField(
		value: any,
		keys: PathStack | string[],
		options: { getProps: boolean }
	): any;
	
	/**
	 * Get the model description provided in constructor.
	 */
	public get modelAttributes(): object {
		return _.cloneDeep( this._modelAttributes );
	}

	/**
	 * Get the PathStack constructor.
	 */
	public static get PathStack() {
		return PathStack;
	}
}
