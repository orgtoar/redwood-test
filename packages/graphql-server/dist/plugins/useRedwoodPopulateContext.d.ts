import { Plugin } from '@graphql-yoga/common';
import { RedwoodGraphQLContext, GraphQLHandlerOptions } from '../functions/types';
/**
 * This Envelop plugin enriches the context on a per-request basis
 * by populating it with the results of a custom function
 * @returns
 */
export declare const useRedwoodPopulateContext: (populateContextBuilder: NonNullable<GraphQLHandlerOptions['context']>) => Plugin<RedwoodGraphQLContext>;
//# sourceMappingURL=useRedwoodPopulateContext.d.ts.map