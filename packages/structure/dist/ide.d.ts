import * as tsm from 'ts-morph';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeLens, DocumentLink, Hover, Location } from 'vscode-languageserver-types';
import { Host, DefaultHost } from './hosts';
import { ArrayLike } from './x/Array';
import { ExtendedDiagnostic } from './x/vscode-languageserver-types';
export declare type NodeID = string;
export declare type IDEInfo = Definition | Implementation | Reference | CodeLensX | HoverX | Decoration | DocumentLinkX;
export interface Definition {
    kind: 'Definition';
    location: Location;
    target: Location;
}
export interface Implementation {
    kind: 'Implementation';
    location: Location;
    target: Location;
}
export interface Reference {
    kind: 'Reference';
    location: Location;
    target: Location;
}
export interface CodeLensX {
    kind: 'CodeLens';
    location: Location;
    codeLens: CodeLens;
}
export interface HoverX {
    kind: 'Hover';
    location: Location;
    hover: Hover;
}
export interface Decoration {
    kind: 'Decoration';
    location: Location;
    style: 'path_punctuation' | 'path_parameter' | 'path_slash' | 'path_parameter_type';
}
export interface DocumentLinkX {
    kind: 'DocumentLink';
    location: Location;
    link: DocumentLink;
}
export declare abstract class BaseNode {
    /**
     * Each node MUST have a unique ID.
     * IDs have meaningful information.
     *
     * examples:
     * - /path/to/project
     * - /path/to/project/web/src/Routes.js
     * - /path/to/project/web/src/Routes.js /route1
     */
    abstract get id(): NodeID;
    abstract get parent(): BaseNode | undefined;
    get host(): Host;
    exists: boolean;
    /**
     * Returns the children of this node.
     * Override this.
     */
    children(): ArrayLike<BaseNode>;
    private _children;
    /**
     * Diagnostics for this node (must not include children's diagnostics).
     * Override this.
     */
    diagnostics(): ArrayLike<ExtendedDiagnostic>;
    private _diagnostics;
    /**
     * IDE info for this node.
     * Override this.
     */
    ideInfo(): ArrayLike<IDEInfo>;
    private _ideInfo;
    collectIDEInfo(uri?: string): Promise<IDEInfo[]>;
    /**
     * Collects diagnostics for this node and all descendants.
     * This is what you'll use to gather all the project diagnostics.
     */
    collectDiagnostics(uri?: string): Promise<ExtendedDiagnostic[]>;
    bailOutOnCollection(uri: string): boolean;
    get closestContainingUri(): string | undefined;
    /**
     * Finds a node by ID.
     * The default algorithm tries to be economic and only create the necessary
     * intermediate nodes.
     * Subclasses can override this to add further optimizations.
     * @param id
     */
    findNode(id: NodeID): Promise<BaseNode | undefined>;
}
export declare abstract class FileNode extends BaseNode {
    abstract get filePath(): string;
    get uri(): string;
    /**
     * the ID of a FileNode is its file:// uri.
     */
    get id(): string;
    get text(): string;
    get fileExists(): boolean;
    /**
     * parsed ts-morph source file
     */
    get sf(): tsm.SourceFile;
    get basenameNoExt(): string;
    get basename(): string;
}
export declare class HostWithDocumentsStore implements Host {
    documents: TextDocuments<TextDocument>;
    defaultHost: DefaultHost;
    constructor(documents: TextDocuments<TextDocument>);
    readFileSync(path: string): string;
    existsSync(path: string): boolean;
    readdirSync(path: string): string[];
    globSync(pattern: string): string[];
    writeFileSync(path: string, contents: string): void;
    get paths(): import("@redwoodjs/internal").Paths;
}
//# sourceMappingURL=ide.d.ts.map