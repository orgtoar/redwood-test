export declare const findCells: (cwd?: string) => string[];
export declare const findPages: (cwd?: string) => string[];
export declare const findDirectoryNamedModules: (cwd?: string) => string[];
export declare const findGraphQLSchemas: (cwd?: string) => string[];
export declare const findApiFiles: (cwd?: string) => string[];
export declare const findWebFiles: (cwd?: string) => string[];
export declare const findApiServerFunctions: (cwd?: string) => string[];
export declare const findApiDistFunctions: (cwd?: string) => string[];
export declare const findPrerenderedHtml: (cwd?: string) => string[];
export declare const isCellFile: (p: string) => boolean;
export declare const findScripts: (cwd?: string) => string[];
export declare const isPageFile: (p: string) => boolean;
export declare const isDirectoryNamedModuleFile: (p: string) => boolean;
export declare const isGraphQLSchemaFile: (p: string) => boolean;
/**
 * The following patterns are supported for api functions:
 *
 * 1. a module at the top level: `/graphql.js`
 * 2. a module in a folder with a module of the same name: `/health/health.js`
 * 3. a module in a folder named index: `/x/index.js`
 */
export declare const isApiFunction: (p: string, functionsPath: string) => boolean;
export declare const isFileInsideFolder: (filePath: string, folderPath: string) => boolean;
//# sourceMappingURL=files.d.ts.map