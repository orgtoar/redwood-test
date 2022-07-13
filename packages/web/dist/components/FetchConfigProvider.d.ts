/// <reference types="react" />
import type { AuthContextInterface, SupportedAuthTypes } from '@redwoodjs/auth';
export declare const getApiGraphQLUrl: () => string;
export interface FetchConfig {
    uri: string;
    headers?: {
        'auth-provider'?: SupportedAuthTypes;
        authorization?: string;
    };
}
export declare const FetchConfigContext: React.Context<FetchConfig>;
declare type UseAuthType = () => AuthContextInterface;
/**
 * The `FetchConfigProvider` understands Redwood's Auth and determines the
 * correct request-headers based on a user's authentication state.
 * Note that the auth bearer token is now passed in packages/web/src/apollo/index.tsx
 * as the token is retrieved async
 */
export declare const FetchConfigProvider: React.FunctionComponent<{
    useAuth?: UseAuthType;
}>;
export declare const useFetchConfig: () => FetchConfig;
export {};
//# sourceMappingURL=FetchConfigProvider.d.ts.map