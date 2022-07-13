import yargs_parser from 'yargs-parser';
/**
 * A value class wrapping a Redwood command string.
 * - perform basic validation on construction
 * - used throughout the package to representa a command (instead of using 'string')
 */
export declare class RedwoodCommandString {
    original: string;
    isComplete: boolean;
    /**
     * this is what we can pass down to the actual CLI
     * it doesn't include "yarn redwood"
     * ex: "generate page Foo /foo"
     */
    processed: string;
    constructor(original: string);
    get parsed(): yargs_parser.Arguments;
    get isInterceptable(): boolean;
}
//# sourceMappingURL=RedwoodCommandString.d.ts.map