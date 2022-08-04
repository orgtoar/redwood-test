import { FileNode } from '../ide';
import { RWProject } from './RWProject';
export declare class RWPage extends FileNode {
    const_: string;
    path: string;
    parent: RWProject;
    constructor(const_: string, path: string, parent: RWProject);
    get filePath(): string;
    get route(): import("./RWRoute").RWRoute | undefined;
    get layoutName(): string | undefined;
    get actionRemove(): Map<any, any>;
}
//# sourceMappingURL=RWPage.d.ts.map