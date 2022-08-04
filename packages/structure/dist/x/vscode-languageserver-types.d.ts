import * as tsm from 'ts-morph';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeAction, CodeActionContext, Diagnostic, DiagnosticSeverity, DocumentUri, Location, Position, Range, WorkspaceEdit } from 'vscode-languageserver-types';
export declare function Range_contains(range: Range, pos: Position): boolean;
export declare function Range_overlaps(range1: Range, range2: Range, consider0000: boolean): boolean;
/**
 * p1 is greater|smaller|equal than/to p2
 * @param p1
 * @param p2
 */
export declare function Position_compare(p1: Position, p2: Position): 'greater' | 'smaller' | 'equal';
/**
 * Create a new position relative to this position.
 *
 * @param lineDelta Delta value for the line value, default is `0`.
 * @param characterDelta Delta value for the character value, default is `0`.
 * @return A position which line and character is the sum of the current line and
 * character and the corresponding deltas.
 */
export declare function Position_translate(pos: Position, lineDelta?: number, characterDelta?: number): Position;
export declare function Range_fromNode(node: tsm.Node): Range;
export declare function Location_fromNode(node: tsm.Node): Location;
export declare function Location_fromFilePath(filePath: string): Location;
/**
 * returns vscode-terminal-friendly (clickable) link with line/column information
 * ex: "file:///foo.ts:2:3"
 * @param loc
 */
export declare function LocationLike_toTerminalLink(loc: LocationLike): string;
/**
 * returns vscode-terminal-friendly (clickable) link with line/column information
 * ex: "file:///foo.ts:2:3"
 * @param loc
 */
export declare function LocationLike_toHashLink(loc: LocationLike): string;
export declare type LocationLike = tsm.Node | string | Location | ExtendedDiagnostic;
export declare function LocationLike_toLocation(x: LocationLike): Location;
export declare function Location_overlaps(loc1: Location, loc2: Location, consider0000?: boolean): boolean;
export declare function ExtendedDiagnostic_is(x: any): x is ExtendedDiagnostic;
export declare function ExtendedDiagnostic_groupByUri(ds: ExtendedDiagnostic[]): {
    [uri: string]: Diagnostic[];
};
export declare function ExtendedDiagnostic_findRelevantQuickFixes(xd: ExtendedDiagnostic, context: CodeActionContext): Promise<CodeAction[]>;
export declare function Position_fromTSMorphOffset(offset: number, sf: tsm.SourceFile): Position;
export declare function Position_fromOffset(offset: number, text: string): Position | undefined;
export declare function Position_fromOffsetOrFail(offset: number, text: string): Position;
/**
 * The Diagnostic interface defined in vscode-languageserver-types
 * does not include the document URI.
 * This interface adds that, and a few other things.
 */
export interface ExtendedDiagnostic {
    uri: DocumentUri;
    diagnostic: Diagnostic;
    /**
     * A function that returns a quickfix associated to this diagnostic.
     */
    quickFix?: () => Promise<CodeAction | undefined>;
}
/**
 * Helper method to create diagnostics
 * @param node
 * @param message
 */
export declare function err(loc: LocationLike, message: string, code?: number | string): ExtendedDiagnostic;
export declare function Diagnostic_compare(d1: Diagnostic, d2: Diagnostic): boolean;
export declare function Range_equals(r1: Range, r2: Range): boolean;
declare function DiagnosticSeverity_getLabel(severity?: DiagnosticSeverity): string;
export declare type GetSeverityLabelFunction = typeof DiagnosticSeverity_getLabel;
interface ExtendedDiagnosticFormatOpts {
    cwd?: string;
    getSeverityLabel?: GetSeverityLabelFunction;
}
/**
 * Returns a string representation of a diagnostic.
 * TSC style single-line errors:
 * ex: "b.ts:1:2: error: this is a message"
 * ex: "/path/to/app/b.ts:1:2: info: this is a message"
 */
export declare function ExtendedDiagnostic_format(d: ExtendedDiagnostic, opts?: ExtendedDiagnosticFormatOpts): string;
/**
 * a value of "null" means this file needs to be deleted
 */
export declare type FileSet = {
    [fileURI: string]: string | null;
};
export declare function FileSet_fromTextDocuments(documents: TextDocuments<TextDocument>): FileSet;
export declare function WorkspaceEdit_fromFileSet(files: FileSet, getExistingFileText?: (fileURI: string) => string | undefined): WorkspaceEdit;
export declare function Range_full(text: string, cr?: string): Range;
export {};
//# sourceMappingURL=vscode-languageserver-types.d.ts.map