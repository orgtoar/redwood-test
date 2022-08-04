/**
 * A route path parser with positional information.
 * Used to enable decorations
 * @param route
 */
export declare function advanced_path_parser(route: string): {
    punctuationIndexes: number[];
    slashIndexes: number[];
    paramRanges: [number, number][];
    paramTypeRanges: [number, number][];
};
//# sourceMappingURL=advanced_path_parser.d.ts.map