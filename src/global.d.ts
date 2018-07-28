import { LoDashStatic } from 'lodash';

declare global {
	namespace NodeJS {
		// tslint:disable interface-name
		interface Process {
			browser: boolean;
		}
		// tslint:disable interface-name
		interface Global {
			_?: LoDashStatic;
			SequentialEvent?: any;
		}
	}
}
