import { InitializeParams, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { HostWithDocumentsStore, IDEInfo } from '../ide';
import { RWProject } from '../model';
import { CommandsManager } from './commands';
import { DiagnosticsManager } from './diagnostics';
import { OutlineManager } from './outline';
import { XMethodsManager } from './xmethods';
export declare class RWLanguageServer {
    initializeParams: InitializeParams;
    documents: TextDocuments<TextDocument>;
    get connection(): import("vscode-languageserver").Connection<import("vscode-languageserver")._, import("vscode-languageserver")._, import("vscode-languageserver")._, import("vscode-languageserver")._, import("vscode-languageserver")._, import("vscode-languageserver")._, import("vscode-languageserver/lib/callHierarchy.proposed").CallHierarchy & import("vscode-languageserver/lib/sematicTokens.proposed").SemanticTokens>;
    start(): void;
    get diagnostics(): DiagnosticsManager;
    get commands(): CommandsManager;
    get outline(): OutlineManager;
    get xmethods(): XMethodsManager;
    get host(): HostWithDocumentsStore;
    projectRoot: string | undefined;
    getProject(): RWProject | undefined;
    get vscodeWindowMethods(): import("../x/vscode").VSCodeWindowMethods;
    collectIDEInfo(uri?: string): Promise<IDEInfo[]>;
    info<T extends IDEInfo['kind']>(uri: string, kind: T): Promise<(IDEInfo & {
        kind: T;
    })[]>;
    get hasWorkspaceFolderCapability(): boolean;
}
//# sourceMappingURL=RWLanguageServer.d.ts.map