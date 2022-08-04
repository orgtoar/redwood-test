import * as tsm from 'ts-morph';
import { FileNode } from '../ide';
import { RWProject } from './RWProject';
import { RWSDLField } from './RWSDLField';
export declare class RWSDL extends FileNode {
    filePath: string;
    parent: RWProject;
    constructor(filePath: string, parent: RWProject);
    /**
     * The Template Literal node (string) that contains the schema
     */
    get schemaStringNode(): tsm.NoSubstitutionTemplateLiteral | undefined;
    get schemaString(): string | undefined;
    get serviceFilePath(): string;
    get service(): import("./RWService").RWService | undefined;
    get name(): string;
    get implementableFields(): RWSDLField[];
    children(): RWSDLField[];
    diagnostics(): Generator<import("../x/vscode-languageserver-types").ExtendedDiagnostic, void, unknown>;
}
//# sourceMappingURL=RWSDL.d.ts.map