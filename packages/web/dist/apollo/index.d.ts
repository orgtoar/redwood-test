/// <reference types="react" />
import type { ApolloClientOptions, setLogVerbosity, ApolloCache } from '@apollo/client';
import * as apolloClient from '@apollo/client';
import type { F } from 'ts-toolbelt';
import type { AuthContextInterface } from '@redwoodjs/auth';
import './typeOverride';
export declare type ApolloClientCacheConfig = apolloClient.InMemoryCacheConfig;
export declare type GraphQLClientConfigProp = Omit<ApolloClientOptions<unknown>, 'cache' | 'link'> & {
    cache?: ApolloCache<unknown>;
    /**
     * Configuration for Apollo Client's `InMemoryCache`.
     * See https://www.apollographql.com/docs/react/caching/cache-configuration/.
     */
    cacheConfig?: ApolloClientCacheConfig;
    /**
     * Configuration for the terminating `HttpLink`.
     * See https://www.apollographql.com/docs/react/api/link/apollo-link-http/#httplink-constructor-options.
     *
     * For example, you can use this prop to set the credentials policy so that cookies can be sent to other domains:
     *
     * ```js
     * <RedwoodApolloProvider graphQLClientConfig={{
     *   httpLinkConfig: { credentials: 'include' }
     * }}>
     * ```
     */
    httpLinkConfig?: apolloClient.HttpOptions;
    /**
     * Extend or overwrite `RedwoodApolloProvider`'s Apollo Link.
     *
     * To overwrite Redwood's Apollo Link, just provide your own `ApolloLink`.
     *
     * To extend Redwood's Apollo Link, provide a function—it'll get passed an array of Redwood's Apollo Links:
     *
     * ```js
     * const link = (rwLinks) => {
     *   const consoleLink = new ApolloLink((operation, forward) => {
     *     console.log(operation.operationName)
     *     return forward(operation)
     *   })
     *
     *   return ApolloLink.from([consoleLink, ...rwLinks])
     * }
     * ```
     *
     * If you do this, there's several things you should keep in mind:
     * - your function should return a single link (e.g., using `ApolloLink.from`; see https://www.apollographql.com/docs/react/api/link/introduction/#additive-composition)
     * - the `HttpLink` should come last (https://www.apollographql.com/docs/react/api/link/introduction/#the-terminating-link)
     */
    link?: apolloClient.ApolloLink | ((rwLinks: [
        apolloClient.ApolloLink,
        apolloClient.ApolloLink,
        apolloClient.ApolloLink,
        apolloClient.HttpLink
    ]) => apolloClient.ApolloLink);
};
export declare type UseAuthProp = () => AuthContextInterface;
export declare const RedwoodApolloProvider: React.FunctionComponent<{
    graphQLClientConfig?: GraphQLClientConfigProp;
    useAuth?: UseAuthProp;
    logLevel?: F.Return<typeof setLogVerbosity>;
}>;
//# sourceMappingURL=index.d.ts.map