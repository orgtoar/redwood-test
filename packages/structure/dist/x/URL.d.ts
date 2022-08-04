/**
 * Creates a file:// URL
 * Works with linux and windows paths
 * If the passed in value is already as file:// URL, it returns that same value
 * TOOD: rename to URL_fromFile
 * @param filePath
 */
export declare function URL_file(filePath: string, ...parts: string[]): string;
/**
 *
 * @param uriOrFilePath
 * @param sep separator string, defaults to `require('path').sep`
 */
export declare function URL_toFile(uriOrFilePath: string, sep?: string): string;
//# sourceMappingURL=URL.d.ts.map