import { DMMF } from '@prisma/generator-helper';
import { Host } from '../hosts';
import { BaseNode } from '../ide';
import { RWCell } from './RWCell';
import { RWComponent } from './RWComponent';
import { RWEnvHelper } from './RWEnvHelper';
import { RWFunction } from './RWFunction';
import { RWLayout } from './RWLayout';
import { RWPage } from './RWPage';
import { RWRouter } from './RWRouter';
import { RWSDL } from './RWSDL';
import { RWService } from './RWService';
import { RWTOML } from './RWTOML';
export interface RWProjectOptions {
    projectRoot: string;
    host: Host;
}
/**
 * Represents a Redwood project.
 * This is the root node.
 */
export declare class RWProject extends BaseNode {
    opts: RWProjectOptions;
    constructor(opts: RWProjectOptions);
    parent: undefined;
    get host(): Host;
    get projectRoot(): string;
    get id(): string;
    children(): (RWComponent | RWTOML | RWPage | RWRouter | RWService | RWSDL | RWLayout | RWEnvHelper)[];
    /**
     * Path constants that are relevant to a Redwood project.
     */
    get pathHelper(): import("@redwoodjs/internal").Paths;
    /**
     * Checks for the presence of a tsconfig.json at the root.
     */
    get isTypeScriptProject(): boolean;
    prismaDMMF(): Promise<DMMF.Document | undefined>;
    prismaDMMFModelNames(): Promise<string[]>;
    get redwoodTOML(): RWTOML;
    private get processPagesDir();
    get pages(): RWPage[];
    get router(): RWRouter;
    getRouter: () => RWRouter;
    servicesFilePath(name: string): string;
    get defaultNotFoundPageFilePath(): string;
    get services(): RWService[];
    get sdls(): RWSDL[];
    get layouts(): RWLayout[];
    get functions(): RWFunction[];
    get components(): RWComponent[];
    get sides(): string[];
    get mocks(): string[];
    /**
     * A "Cell" is a component that ends in `Cell.{js, jsx, tsx}`, but does not
     * have a default export AND does not export `QUERY`
     **/
    get cells(): RWCell[];
    get envHelper(): RWEnvHelper;
}
//# sourceMappingURL=RWProject.d.ts.map