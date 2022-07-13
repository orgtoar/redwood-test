export interface NodeTargetPaths {
    base: string;
    dataMigrations: string;
    directives: string;
    db: string;
    dbSchema: string;
    src: string;
    functions: string;
    graphql: string;
    lib: string;
    generators: string;
    services: string;
    config: string;
    dist: string;
    types: string;
    models: string;
}
export interface BrowserTargetPaths {
    base: string;
    src: string;
    app: string;
    generators: string;
    index: string | null;
    routes: string;
    pages: string;
    components: string;
    layouts: string;
    config: string;
    webpack: string;
    postcss: string;
    storybookConfig: string;
    storybookPreviewConfig: string;
    storybookManagerConfig: string;
    dist: string;
    types: string;
}
export interface Paths {
    base: string;
    generated: {
        base: string;
        schema: string;
        types: {
            includes: string;
            mirror: string;
        };
        prebuild: string;
    };
    web: BrowserTargetPaths;
    api: NodeTargetPaths;
    scripts: string;
}
export interface PagesDependency {
    /** the variable to which the import is assigned */
    importName: string;
    /** @alias importName */
    const: string;
    /** absolute path without extension */
    importPath: string;
    /** absolute path with extension */
    path: string;
    /** const ${importName} = { ...data structure for async imports... } */
    importStatement: string;
}
/**
 * Search the parent directories for the Redwood configuration file.
 */
export declare const getConfigPath: (cwd?: string) => string;
/**
 * The Redwood config file is used as an anchor for the base directory of a project.
 */
export declare const getBaseDir: (configPath?: string) => string;
export declare const getBaseDirFromFile: (file: string) => string;
/**
 * Use this to resolve files when the path to the file is known,
 * but the extension is not.
 */
export declare const resolveFile: (filePath: string, extensions?: string[]) => string | null;
/**
 * Path constants that are relevant to a Redwood project.
 */
export declare const getPaths: (BASE_DIR?: string) => Paths;
/**
 * Process the pages directory and return information useful for automated imports.
 *
 * Note: glob.sync returns posix style paths on Windows machines
 * @deprecated I will write a seperate method that use `getFiles` instead. This
 * is used by structure, babel auto-importer and the eslint plugin.
 */
export declare const processPagesDir: (webPagesDir?: string) => Array<PagesDependency>;
/**
 * Converts Windows-style paths to Posix-style
 * C:\Users\Bob\dev\Redwood -> /c/Users/Bob/dev/Redwood
 *
 * The conversion only happens on Windows systems, and only for paths that are
 * not already Posix-style
 *
 * @param path Filesystem path
 */
export declare const ensurePosixPath: (path: string) => string;
/**
 * Switches backslash to regular slash on Windows so the path works in
 * import statements
 * C:\Users\Bob\dev\Redwood\UserPage\UserPage ->
 * C:/Users/Bob/dev/Redwood/UserPage/UserPage
 *
 * @param path Filesystem path
 */
export declare const importStatementPath: (path: string) => string;
//# sourceMappingURL=paths.d.ts.map