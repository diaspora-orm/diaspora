import { BrowserLogger } from './browserLogger';
import { NodeLogger } from './nodeLogger';

/**
 * Reference to the static logger instance for Diaspora.
 */
export const logger = process.browser ? new BrowserLogger() : new NodeLogger();
