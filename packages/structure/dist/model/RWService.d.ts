import { FileNode } from '../ide';
import { RWProject } from './RWProject';
import { RWSDL } from './RWSDL';
import { RWServiceFunction } from './RWServiceFunction';
export declare class RWService extends FileNode {
    filePath: string;
    parent: RWProject;
    constructor(filePath: string, parent: RWProject);
    /**
     * The name of this service:
     * services/todos/todos.js --> todos
     */
    get name(): string;
    /**
     * Returns the SDL associated with this service (if any).
     * Match is performed by name.
     */
    get sdl(): RWSDL | undefined;
    children(): RWServiceFunction[];
    /**
     * All the exported functions declared in this service file.
     * They can be both ArrowFunctions (with name) or FunctionDeclarations (with name)
     */
    get funcs(): RWServiceFunction[];
}
//# sourceMappingURL=RWService.d.ts.map