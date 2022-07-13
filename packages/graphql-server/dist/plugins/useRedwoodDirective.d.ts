import { Plugin } from '@envelop/types';
import { DirectiveNode, DocumentNode, GraphQLFieldConfig, GraphQLResolveInfo } from 'graphql';
import { GlobalContext } from '../index';
export interface DirectiveParams<FieldType = any> {
    root: unknown;
    args: Record<string, unknown>;
    context: GlobalContext;
    info: GraphQLResolveInfo;
    directiveNode?: DirectiveNode;
    directiveArgs: Record<string, any>;
    resolvedValue: FieldType;
}
/**
 * Write your validation logic inside this function.
 * Validator directives do not have access to the field value, i.e. they are called before resolving the value
 *
 * - Throw an error, if you want to stop executing e.g. not sufficient permissions
 * - Validator directives can be async or sync
 * - Returned value will be ignored
 */
export declare type ValidatorDirectiveFunc<FieldType = any> = (args: Omit<DirectiveParams<FieldType>, 'resolvedValue'>) => Promise<void> | void;
/**
 * Write your transformation logic inside this function.
 * Transformer directives run **after** resolving the value
 *
 * - You can also throw an error, if you want to stop executing, but note that the value has already been resolved
 * - Transformer directives **must** be synchonous, and return a value
 *
 */
export declare type TransformerDirectiveFunc<FieldType = any> = (args: DirectiveParams<FieldType>) => FieldType;
export declare enum DirectiveType {
    VALIDATOR = "VALIDATOR_DIRECTIVE",
    TRANSFORMER = "TRANSFORMER_DIRECTIVE"
}
export declare type RedwoodDirective = ValidatorDirective | TransformerDirective;
export interface ValidatorDirective extends ValidatorDirectiveOptions {
    schema: DocumentNode;
}
export interface TransformerDirective extends TransformerDirectiveOptions {
    schema: DocumentNode;
}
interface ValidatorDirectiveOptions {
    onResolverCalled: ValidatorDirectiveFunc;
    type: DirectiveType.VALIDATOR;
    name: string;
}
interface TransformerDirectiveOptions {
    onResolverCalled: TransformerDirectiveFunc;
    type: DirectiveType.TRANSFORMER;
    name: string;
}
export declare type DirectivePluginOptions = ValidatorDirectiveOptions | TransformerDirectiveOptions;
export declare function hasDirective(info: GraphQLResolveInfo): boolean;
export declare function getDirectiveByName(fieldConfig: GraphQLFieldConfig<any, any, any>, directiveName: string): null | DirectiveNode;
export declare function isPromise(value: any): value is Promise<unknown>;
export declare const useRedwoodDirective: (options: DirectivePluginOptions) => Plugin<{
    onResolverCalled: ValidatorDirectiveFunc | TransformerDirectiveFunc;
}>;
export {};
//# sourceMappingURL=useRedwoodDirective.d.ts.map