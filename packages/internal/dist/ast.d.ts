import { types } from '@babel/core';
export declare const fileToAst: (filePath: string) => types.Node;
interface NamedExports {
    name: string;
    type: 're-export' | 'variable' | 'function' | 'class';
}
/**
 * get all the named exports in a given piece of code.
 */
export declare const getNamedExports: (ast: types.Node) => NamedExports[];
/**
 * get all the gql queries from the supplied code
 */
export declare const getGqlQueries: (ast: types.Node) => string[];
export declare const getCellGqlQuery: (ast: types.Node) => undefined;
export declare const hasDefaultExport: (ast: types.Node) => boolean;
export {};
//# sourceMappingURL=ast.d.ts.map