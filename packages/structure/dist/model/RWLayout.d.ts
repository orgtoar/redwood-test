import { FileNode } from '../ide';
import { RWProject } from './RWProject';
/**
 * layouts live in the src/layouts folder
 */
export declare class RWLayout extends FileNode {
    filePath: string;
    parent: RWProject;
    constructor(filePath: string, parent: RWProject);
}
//# sourceMappingURL=RWLayout.d.ts.map