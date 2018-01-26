import * as Diaspora from '../..';

declare module '../..' {
	//    * @description Namespace for types with constraints, like <code>[0, Infinity]</code>, <code>]0, Infinity[</code>, etc etc
	export namespace ConstrainedTypes {
		/**
        * @description Integer equal or above 0
        */
		type AbsInt0 = number;

		/**
        * @description Integer above 0
        */
		type AbsInt = number;

		/**
        * @description Integer above 0, may be integer
        */
		type AbsIntInf = number;

		/**
        * @description Integer equal or above 0, may be integer
        */
		type AbsIntInf0 = number;
	}
}
