import type { Auth0, Auth0User } from './auth0';
import type { AzureActiveDirectory, AzureActiveDirectoryUser } from './azureActiveDirectory';
import type { Clerk, ClerkUser } from './clerk';
import type { Custom } from './custom';
import type { DbAuth, DbAuthConfig } from './dbAuth';
import type { Ethereum, EthereumUser } from './ethereum';
import type { FirebaseClient, FirebaseUser } from './firebase';
import type { GoTrue, GoTrueUser } from './goTrue';
import type { MagicLink, MagicUser } from './magicLink';
import type { NetlifyIdentity } from './netlify';
import type { Nhost, NhostUser } from './nhost';
import type { Supabase, SupabaseUser } from './supabase';
import type { SuperTokensUser, SuperTokens } from './supertokens';
declare const typesToClients: {
    netlify: (client: typeof import("netlify-identity-widget")) => AuthClient;
    auth0: (client: Auth0) => AuthClient;
    azureActiveDirectory: (client: AzureActiveDirectory) => AuthClient;
    dbAuth: (_client: DbAuth, config?: DbAuthConfig) => AuthClient;
    goTrue: (client: GoTrue) => import("./goTrue").AuthClientGoTrue;
    magicLink: (client: MagicLink) => import("./magicLink").AuthClientMagicLink;
    firebase: ({ firebaseAuth, firebaseApp, }: FirebaseClient) => AuthClient;
    supabase: (client: import("@supabase/supabase-js").SupabaseClient) => import("./supabase").AuthClientSupabase;
    ethereum: (client: Ethereum) => AuthClient;
    nhost: (client: import("@nhost/nhost-js").NhostClient) => AuthClient;
    clerk: (client: Clerk) => import("./clerk").AuthClientClerk;
    supertokens: (client: {
        authRecipe: {
            redirectToAuth: (input: "signup" | "signin") => void;
        };
        sessionRecipe: {
            signOut: () => Promise<void>;
            doesSessionExist: () => Promise<boolean>;
            getAccessTokenPayloadSecurely: () => Promise<any>;
            getUserId: () => Promise<string>;
        };
    }) => AuthClient;
    /** Don't we support your auth client? No problem, define your own the `custom` type! */
    custom: (authClient: import("./custom").AuthClientCustom) => import("./custom").AuthClientCustom;
};
export declare type SupportedAuthClients = Auth0 | AzureActiveDirectory | DbAuth | GoTrue | NetlifyIdentity | MagicLink | FirebaseClient | Supabase | Clerk | Ethereum | Nhost | SuperTokens | Custom;
export declare type SupportedAuthTypes = keyof typeof typesToClients;
export declare type SupportedAuthConfig = DbAuthConfig;
export type { Auth0User };
export type { AzureActiveDirectoryUser };
export type { DbAuth };
export type { ClerkUser };
export type { FirebaseUser };
export type { GoTrueUser };
export type { MagicUser };
export type { SupabaseUser };
export type { EthereumUser };
export type { NhostUser };
export type { SuperTokensUser };
export declare type SupportedUserMetadata = Auth0User | AzureActiveDirectoryUser | ClerkUser | FirebaseUser | GoTrueUser | MagicUser | SupabaseUser | EthereumUser | NhostUser | SuperTokensUser;
export interface AuthClient {
    restoreAuthState?(): void | Promise<any>;
    login(options?: any): Promise<any>;
    logout(options?: any): void | Promise<any>;
    signup(options?: any): void | Promise<any>;
    getToken(options?: any): Promise<null | string>;
    forgotPassword?(username: string): void | Promise<any>;
    resetPassword?(options?: any): void | Promise<any>;
    validateResetToken?(token: string | null): void | Promise<any>;
    /** The user's data from the AuthProvider */
    getUserMetadata(): Promise<null | SupportedUserMetadata>;
    client: SupportedAuthClients;
    type: SupportedAuthTypes;
}
export declare const createAuthClient: (client: SupportedAuthClients, type: SupportedAuthTypes, config?: SupportedAuthConfig) => AuthClient;
//# sourceMappingURL=index.d.ts.map