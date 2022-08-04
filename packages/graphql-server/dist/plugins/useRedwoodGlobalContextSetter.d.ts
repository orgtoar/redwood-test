import { Plugin } from '@graphql-yoga/common';
import { RedwoodGraphQLContext } from '../functions/types';
/**
 * This Envelop plugin waits until the GraphQL context is done building and sets the
 * Redwood global context which can be imported with:
 * // import { context } from '@redwoodjs/graphql-server'
 * @returns
 */
export declare const useRedwoodGlobalContextSetter: () => Plugin<RedwoodGraphQLContext>;
//# sourceMappingURL=useRedwoodGlobalContextSetter.d.ts.map