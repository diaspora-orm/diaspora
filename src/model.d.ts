import * as Diaspora from '.';

declare module '.' {
	export namespace Model {
		export interface FieldDescriptor {
			type?: string;
			validate?: Function | Function[];
			of?: FieldDescriptor | FieldDescriptor[];
			model?: string;
			required?: boolean;
			attributes?: object;
			default?: Function | string;
		}
	}
}
