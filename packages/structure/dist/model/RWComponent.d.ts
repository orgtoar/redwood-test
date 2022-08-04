import { FileNode } from '../ide';
import { RWProject } from './RWProject';
export declare class RWComponent extends FileNode {
    filePath: string;
    parent: RWProject;
    constructor(filePath: string, parent: RWProject);
    get hasDefaultExport(): boolean;
    get stories(): never[];
    get exportedSymbols(): Set<string>;
}
//# sourceMappingURL=RWComponent.d.ts.map