import * as esbuild from 'esbuild';
export declare const buildApi: () => esbuild.BuildResult;
export declare const cleanApiBuild: () => void;
/**
 * Remove RedwoodJS "magic" from a user's code leaving JavaScript behind.
 */
export declare const prebuildApiFiles: (srcFiles: string[]) => (string | undefined)[];
export declare const transpileApi: (files: string[], options?: {}) => esbuild.BuildResult;
//# sourceMappingURL=api.d.ts.map