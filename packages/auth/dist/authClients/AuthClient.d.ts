import { SupportedAuthClients, SupportedAuthConfig, SupportedAuthTypes, SupportedUserMetadata } from './SupportedAuthClients';
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
    /** Hooks for managing the hosting AuthProvider's life-cycle */
    /** An optional hook to listen for updates from the 3rd party provider */
    useListenForUpdates?(handlers: {
        reauthenticate: () => Promise<void>;
    }): void;
    client: SupportedAuthClients;
    type: SupportedAuthTypes;
}
export declare const createAuthClient: (client: SupportedAuthClients, type: SupportedAuthTypes, config?: SupportedAuthConfig) => Promise<AuthClient>;
//# sourceMappingURL=AuthClient.d.ts.map