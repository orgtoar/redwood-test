import { AuthClient } from './index';
export interface LoginAttributes {
    username: string;
    password: string;
}
export interface ResetPasswordAttributes {
    token: string;
    password: string;
}
export declare type SignupAttributes = Record<string, unknown> & LoginAttributes;
export declare type DbAuth = () => null;
export declare type DbAuthConfig = {
    fetchConfig: {
        credentials: 'include' | 'same-origin';
    };
};
export declare const dbAuth: (_client: DbAuth, config?: DbAuthConfig) => AuthClient;
//# sourceMappingURL=dbAuth.d.ts.map