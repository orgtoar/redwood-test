import { CodeAction } from 'vscode-languageserver-types';
import { CodeLensX, FileNode } from '../ide';
import { ExtendedDiagnostic } from '../x/vscode-languageserver-types';
import { RWProject } from './RWProject';
import { RWRoute } from './RWRoute';
/**
 * one per Routes.js
 */
export declare class RWRouter extends FileNode {
    filePath: string;
    parent: RWProject;
    constructor(filePath: string, parent: RWProject);
    getFilePathForRoutePath(routePath: string): string | undefined;
    getRoutePathForFilePath(filePath: string): string | undefined;
    /**
     * the `<Router>` tag
     */
    private get jsxNode();
    /**
     * One per `<Route>`
     */
    get routes(): RWRoute[];
    private get numNotFoundPages();
    ideInfo(): Generator<CodeLensX, void, unknown>;
    get quickFix_addNotFoundpage(): CodeAction | undefined;
    diagnostics(): Generator<ExtendedDiagnostic, void, unknown>;
    children(): RWRoute[];
}
//# sourceMappingURL=RWRouter.d.ts.map