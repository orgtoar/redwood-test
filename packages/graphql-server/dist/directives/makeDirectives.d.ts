import { DocumentNode } from 'graphql';
import { RedwoodDirective, TransformerDirective, TransformerDirectiveFunc, ValidatorDirective, ValidatorDirectiveFunc } from '../plugins/useRedwoodDirective';
export declare type DirectiveGlobImports = Record<string, any>;
export declare const makeDirectivesForPlugin: (directiveGlobs: DirectiveGlobImports) => RedwoodDirective[];
export declare const getDirectiveName: (schema: DocumentNode) => string | undefined;
export declare const createValidatorDirective: (schema: DocumentNode, directiveFunc: ValidatorDirectiveFunc) => ValidatorDirective;
export declare const createTransformerDirective: (schema: DocumentNode, directiveFunc: TransformerDirectiveFunc) => TransformerDirective;
//# sourceMappingURL=makeDirectives.d.ts.map