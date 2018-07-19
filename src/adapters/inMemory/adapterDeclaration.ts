import { InMemoryAdapter } from './adapter';

export const declareInMemory =  ( Diaspora: any ) => Diaspora.registerAdapter( 'inMemory', InMemoryAdapter );
