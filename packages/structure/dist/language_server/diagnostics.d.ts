import { RWLanguageServer } from './RWLanguageServer';
export declare class DiagnosticsManager {
    server: RWLanguageServer;
    constructor(server: RWLanguageServer);
    start(): void;
    private previousURIs;
    private refreshDiagnostics;
    private getDiagnosticsGroupedByUri;
}
//# sourceMappingURL=diagnostics.d.ts.map