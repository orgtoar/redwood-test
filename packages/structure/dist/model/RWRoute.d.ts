import * as tsm from 'ts-morph';
import { Location } from 'vscode-languageserver-types';
import { BaseNode, Decoration, Definition, DocumentLinkX, HoverX } from '../ide';
import { RWRouter } from './RWRouter';
export declare class RWRoute extends BaseNode {
    /**
     * the <Route> tag
     */
    jsxNode: tsm.JsxSelfClosingElement;
    parent: RWRouter;
    constructor(
    /**
     * the <Route> tag
     */
    jsxNode: tsm.JsxSelfClosingElement, parent: RWRouter);
    get id(): string;
    get location(): Location;
    get isPrivate(): boolean;
    get hasParameters(): boolean;
    get hasPrerender(): boolean;
    get hasPreRenderInfo(): boolean;
    get outlineLabel(): string;
    get outlineDescription(): string | undefined;
    get outlineLink(): string;
    /**
     * The associated Redwood Page node, if any
     */
    get page(): import("./RWPage").RWPage | undefined;
    /**
     * <Route path="" page={THIS_IDENTIFIER}/>
     */
    private get page_identifier();
    get page_identifier_str(): string | undefined;
    get name(): string | undefined;
    get path_errorMessage(): string | undefined;
    get path(): string | undefined;
    get prerender(): boolean;
    get path_literal_node(): tsm.StringLiteral | undefined;
    get isNotFound(): boolean;
    diagnostics(): Generator<import("../x/vscode-languageserver-types").ExtendedDiagnostic, void, unknown>;
    ideInfo(): Generator<Definition | HoverX | Decoration | DocumentLinkX, void, unknown>;
    private get hasPathCollision();
    private getBoolAttr;
    private getStringAttr;
    get parsedPath(): {
        punctuationIndexes: number[];
        slashIndexes: number[];
        paramRanges: [number, number][];
        paramTypeRanges: [number, number][];
    } | undefined;
    private decorations;
    get sampleLocalPreviewURL(): string | undefined;
}
//# sourceMappingURL=RWRoute.d.ts.map