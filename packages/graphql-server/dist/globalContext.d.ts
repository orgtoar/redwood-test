/// <reference types="node" />
import { AsyncLocalStorage } from 'async_hooks';
export interface GlobalContext extends Record<string, unknown> {
}
export declare const shouldUseLocalStorageContext: () => boolean;
/**
 * This returns a AsyncLocalStorage instance, not the actual store
 */
export declare const getAsyncStoreInstance: () => AsyncLocalStorage<Map<string, GlobalContext>>;
export declare const createContextProxy: () => GlobalContext;
export declare let context: GlobalContext;
/**
 * Set the contents of the global context object.
 */
export declare const setContext: (newContext: GlobalContext) => GlobalContext;
//# sourceMappingURL=globalContext.d.ts.map