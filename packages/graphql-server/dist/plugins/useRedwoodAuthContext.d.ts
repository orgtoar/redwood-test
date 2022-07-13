import { Plugin } from '@graphql-yoga/common';
import { RedwoodGraphQLContext, GraphQLHandlerOptions } from '../functions/types';
/**
 * Envelop plugin for injecting the current user into the GraphQL Context,
 * based on custom getCurrentUser function.
 */
export declare const useRedwoodAuthContext: (getCurrentUser: GraphQLHandlerOptions['getCurrentUser']) => Plugin<RedwoodGraphQLContext>;
//# sourceMappingURL=useRedwoodAuthContext.d.ts.map