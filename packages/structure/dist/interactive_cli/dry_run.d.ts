import { RedwoodCommandString } from './RedwoodCommandString';
export declare type FileSet = {
    [filePath: string]: string | null;
};
interface Opts {
    /**
     * redwood project root (filepath)
     */
    cwd: string;
    /**
     * Command to execute
     */
    cmd: RedwoodCommandString;
    /**
     * Files to override
     */
    fileOverrides?: FileSet;
    /**
     * directory to store the temporary generated JS script
     */
    tmpdir?: string;
}
export declare function redwood_gen_dry_run(opts: Opts): Promise<{
    stdout: string;
    files: FileSet;
}>;
export {};
//# sourceMappingURL=dry_run.d.ts.map