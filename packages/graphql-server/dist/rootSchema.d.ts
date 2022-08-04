import { BigIntResolver, DateResolver, TimeResolver, DateTimeResolver, JSONResolver, JSONObjectResolver } from 'graphql-scalars';
/**
 * This adds scalar types for dealing with Date, Time, DateTime, and JSON.
 * This also adds a root Query type which is needed to start the GraphQL server on a fresh install.
 *
 * NOTE: When you add a new Scalar type you must add it to
 * "generateTypeDefGraphQL" in @redwoodjs/internal.
 */
export declare const schema: import("graphql").DocumentNode;
export interface Resolvers {
    BigInt: typeof BigIntResolver;
    Date: typeof DateResolver;
    Time: typeof TimeResolver;
    DateTime: typeof DateTimeResolver;
    JSON: typeof JSONResolver;
    JSONObject: typeof JSONObjectResolver;
    Query: Record<string, unknown>;
}
export declare const resolvers: Resolvers;
//# sourceMappingURL=rootSchema.d.ts.map