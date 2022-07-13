import { FileNode } from '../ide';
import { RWProject } from './RWProject';
export declare class RWTOML extends FileNode {
    filePath: string;
    parent: RWProject;
    constructor(filePath: string, parent: RWProject);
    get parsedTOML(): any;
    get web_includeEnvironmentVariables(): string[] | undefined;
    diagnostics(): Generator<import("../x/vscode-languageserver-types").ExtendedDiagnostic, void, unknown>;
}
//# sourceMappingURL=RWTOML.d.ts.map