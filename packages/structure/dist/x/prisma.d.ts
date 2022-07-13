import { Location, Range } from 'vscode-languageserver';
/**
 * find "env()" expressions in a prisma file using regex
 * @param prismaSchemaFilePath
 */
export declare function prisma_parseEnvExpressionsInFile(prismaSchemaFilePath: string): Generator<{
    location: Location;
    key: any;
}, never[] | undefined, unknown>;
/**
 * find "env()" expressions in a prisma file using regex
 * @param src
 */
export declare function prisma_parseEnvExpressions(src: string): Generator<{
    range: Range;
    key: any;
}, void, unknown>;
//# sourceMappingURL=prisma.d.ts.map