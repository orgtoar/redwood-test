/**
 * Generate all the types for a RedwoodJS project
 * and return the generated path to files, so they're logged
 */
export declare const generateTypeDefs: () => Promise<string[]>;
export declare const generateMirrorDirectoryNamedModules: () => string[];
export declare const mirrorPathForDirectoryNamedModules: (p: string, rwjsPaths?: import("../paths").Paths) => string[];
export declare const generateMirrorDirectoryNamedModule: (p: string, rwjsPaths?: import("../paths").Paths) => string;
export declare const generateMirrorCells: () => string[];
export declare const mirrorPathForCell: (p: string, rwjsPaths?: import("../paths").Paths) => string[];
export declare const generateMirrorCell: (p: string, rwjsPaths?: import("../paths").Paths) => string;
export declare const generateTypeDefRouterRoutes: () => string[];
export declare const generateTypeDefRouterPages: () => string[];
export declare const generateTypeDefCurrentUser: () => string[];
export declare const generateTypeDefScenarios: () => string[];
export declare const generateTypeDefTestMocks: () => string[];
export declare const generateTypeDefGlobImports: () => string[];
export declare const generateTypeDefGlobalContext: () => string[];
//# sourceMappingURL=typeDefinitions.d.ts.map