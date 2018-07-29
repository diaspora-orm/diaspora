export { ELoggingLevel } from './logger';

/**
 * Reference to the static logger instance for Diaspora.
 */
/*#if _BROWSER
import { BrowserLogger } from './browserLogger';
export const logger = new BrowserLogger();
//#else // */
import { NodeLogger } from './nodeLogger';
export const logger = new NodeLogger();
// tslint:disable-next-line:comment-format
//#endif

