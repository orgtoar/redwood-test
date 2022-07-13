import { RWLanguageServer } from './RWLanguageServer';
/**
 * A set of custom methods (not included in the LSP spec) exposed to the client
 * via the sendRequest/onRequest mechanism.
 */
export declare class XMethodsManager {
    server: RWLanguageServer;
    constructor(server: RWLanguageServer);
    start(): void;
}
//# sourceMappingURL=xmethods.d.ts.map