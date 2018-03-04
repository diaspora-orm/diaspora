import { LoDashStatic } from 'lodash';

declare global {
	namespace NodeJS {
		interface Process {
			browser: boolean;
		}
		interface Global {
			_?: LoDashStatic;
			SequentialEvent?: any;
		}
	}
}
