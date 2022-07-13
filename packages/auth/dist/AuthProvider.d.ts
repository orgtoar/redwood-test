import React from 'react';
import type { AuthClient, SupportedAuthTypes, SupportedAuthConfig, SupportedAuthClients, SupportedUserMetadata } from './authClients';
export interface CurrentUser {
    roles?: Array<string> | string;
}
export interface AuthContextInterface {
    loading: boolean;
    isAuthenticated: boolean;
    currentUser: null | CurrentUser;
    userMetadata: null | SupportedUserMetadata;
    logIn(options?: unknown): Promise<any>;
    logOut(options?: unknown): Promise<any>;
    signUp(options?: unknown): Promise<any>;
    /**
     * Clients should always return null or string
     * It is expected that they catch any errors internally
     */
    getToken(): Promise<null | string>;
    /**
     * Fetches the "currentUser" from the api side,
     * but does not update the current user state.
     **/
    getCurrentUser(): Promise<null | CurrentUser>;
    /**
     * Checks if the "currentUser" from the api side
     * is assigned a role or one of a list of roles.
     * If the user is assigned any of the provided list of roles,
     * the hasRole is considered to be true.
     **/
    hasRole(rolesToCheck: string | string[]): boolean;
    /**
     * Redetermine authentication state and update the state.
     */
    reauthenticate(): Promise<void>;
    forgotPassword(username: string): Promise<any>;
    resetPassword(options?: unknown): Promise<any>;
    validateResetToken(resetToken: string | null): Promise<any>;
    /**
     * A reference to the client that you passed into the `AuthProvider`,
     * which is useful if we do not support some specific functionality.
     */
    client?: SupportedAuthClients;
    type?: SupportedAuthTypes;
    hasError: boolean;
    error?: Error;
}
export declare const AuthContext: React.Context<AuthContextInterface>;
declare type AuthProviderProps = {
    client: SupportedAuthClients;
    type: Omit<SupportedAuthTypes, 'dbAuth' | 'clerk'>;
    config?: never;
    skipFetchCurrentUser?: boolean;
} | {
    client?: never;
    type: 'clerk';
    config?: never;
    skipFetchCurrentUser?: boolean;
} | {
    client?: never;
    type: 'dbAuth';
    config?: SupportedAuthConfig;
    skipFetchCurrentUser?: boolean;
};
declare type AuthProviderState = {
    loading: boolean;
    isAuthenticated: boolean;
    userMetadata: null | Record<string, any>;
    currentUser: null | CurrentUser;
    hasError: boolean;
    error?: Error;
};
/**
 * @example
 * ```js
 *  const client = new Auth0Client(options)
 *  // ...
 *  <AuthProvider client={client} type="auth0" skipFetchCurrentUser={true}>
 *    {children}
 *  </AuthProvider>
 * ```
 */
export declare class AuthProvider extends React.Component<AuthProviderProps, AuthProviderState> {
    static defaultProps: {
        skipFetchCurrentUser: boolean;
    };
    state: AuthProviderState;
    rwClient: AuthClient;
    constructor(props: AuthProviderProps);
    componentDidMount(): Promise<void>;
    getApiGraphQLUrl: () => string;
    getCurrentUser: () => Promise<Record<string, unknown>>;
    /**
     * @example
     * ```js
     *  hasRole("editor")
     *  hasRole(["editor"])
     *  hasRole(["editor", "author"])
     * ```
     *
     * Checks if the "currentUser" from the api side
     * is assigned a role or one of a list of roles.
     * If the user is assigned any of the provided list of roles,
     * the hasRole is considered to be true.
     */
    hasRole: (rolesToCheck: string | string[]) => boolean;
    /**
     * Clients should always return null or token string.
     * It is expected that they catch any errors internally.
     * This catch is a last resort effort in case any errors are
     * missed or slip through.
     */
    getToken: () => Promise<string | null>;
    reauthenticate: () => Promise<void>;
    logIn: (options?: any) => Promise<any>;
    logOut: (options?: any) => Promise<void>;
    signUp: (options?: any) => Promise<any>;
    forgotPassword: (username: string) => Promise<any>;
    resetPassword: (options?: any) => Promise<any>;
    validateResetToken: (resetToken: string | null) => Promise<any>;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=AuthProvider.d.ts.map