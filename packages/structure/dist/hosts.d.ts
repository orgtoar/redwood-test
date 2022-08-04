import { Paths } from '@redwoodjs/internal';
/**
 * The host interface allows us to decouple the "model/*"
 * classes from access to the file system.
 * This is critical for editor support (ex: showing diagnostics on unsaved files)
 */
export interface Host {
    existsSync(path: string): boolean;
    readFileSync(path: string): string;
    readdirSync(path: string): string[];
    globSync(pattern: string): string[];
    writeFileSync(path: string, contents: string): void;
    paths: Paths;
}
export declare class DefaultHost implements Host {
    existsSync(path: string): boolean;
    readFileSync(path: string): string;
    readdirSync(path: string): string[];
    globSync(pattern: string): string[];
    writeFileSync(path: string, contents: string): void;
    get paths(): Paths;
}
//# sourceMappingURL=hosts.d.ts.map