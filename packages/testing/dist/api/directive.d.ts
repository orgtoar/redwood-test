import { A } from 'ts-toolbelt';
import type { DirectiveParams, ValidatorDirective, TransformerDirective } from '@redwoodjs/graphql-server';
export { getDirectiveName } from '@redwoodjs/graphql-server';
interface DirectiveMocker {
    (directive: ValidatorDirective, executionMock: A.Compute<Omit<Partial<DirectiveParams>, 'resolvedValue'>>): any;
}
declare type TransformerMock = A.Compute<Omit<Partial<DirectiveParams>, 'resolvedValue'>> & {
    mockedResolvedValue: any;
};
interface DirectiveMocker {
    (directive: TransformerDirective, executionMock: TransformerMock): any;
}
/**
 * @description
 *
 * Used for writing both synchronous and asynchronous directive tests e.g.
 *
 * - Transformer directives can be passed mockedResolvedValue
 * - Validator directives should check for errors thrown in certain situations
 *
 * @example
 *
 * Synchronous transformer directive:
 *
 * ```ts
 * const mockExecution = mockRedwoodDirective(myTransformer, {
 *   context: currentUser,
 *   mockedResolvedValue: 'Original Value',
 * })
 *
 * expect(mockExecution).not.toThrow()
 * expect(mockExecution()).toEqual('Transformed Value')
 * ```ts
 *
 * @example
 *
 * Asynchronous transformer directive:
 *
 * ```ts
 * const mockExecution = mockRedwoodDirective(myTransformer, {
 *   context: currentUser,
 *   mockedResolvedValue: 'Original Value',
 * })
 *
 * await expect(mockExecution).resolves.not.toThrow()
 * await expect(mockExecution()).resolves.toEqual('Transformed Value')
 * ```
 */
export declare const mockRedwoodDirective: DirectiveMocker;
//# sourceMappingURL=directive.d.ts.map