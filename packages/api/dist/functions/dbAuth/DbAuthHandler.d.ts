import type { PrismaClient } from '@prisma/client';
import type { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda';
import CryptoJS from 'crypto-js';
import { CorsConfig, CorsContext, CorsHeaders } from '../../cors';
declare type SetCookieHeader = {
    'set-cookie': string;
};
declare type CsrfTokenHeader = {
    'csrf-token': string;
};
interface SignupFlowOptions {
    /**
     * Allow users to sign up. Defaults to true.
     * Needs to be explicitly set to false to disable the flow
     */
    enabled?: boolean;
    /**
     * Whatever you want to happen to your data on new user signup. Redwood will
     * check for duplicate usernames before calling this handler. At a minimum
     * you need to save the `username`, `hashedPassword` and `salt` to your
     * user table. `userAttributes` contains any additional object members that
     * were included in the object given to the `signUp()` function you got
     * from `useAuth()`
     */
    handler: (signupHandlerOptions: SignupHandlerOptions) => any;
    /**
     * Object containing error strings
     */
    errors?: {
        fieldMissing?: string;
        usernameTaken?: string;
        flowNotEnabled?: string;
    };
}
interface ForgotPasswordFlowOptions<TUser = Record<string | number, any>> {
    /**
     * Allow users to request a new password via a call to forgotPassword. Defaults to true.
     * Needs to be explicitly set to false to disable the flow
     */
    enabled?: boolean;
    handler: (user: TUser) => any;
    errors?: {
        usernameNotFound?: string;
        usernameRequired?: string;
        flowNotEnabled?: string;
    };
    expires: number;
}
interface LoginFlowOptions<TUser = Record<string | number, any>> {
    /**
     * Allow users to login. Defaults to true.
     * Needs to be explicitly set to false to disable the flow
     */
    enabled?: boolean;
    /**
     * Anything you want to happen before logging the user in. This can include
     * throwing an error to prevent login. If you do want to allow login, this
     * function must return an object representing the user you want to be logged
     * in, containing at least an `id` field (whatever named field was provided
     * for `authFields.id`). For example: `return { id: user.id }`
     */
    handler: (user: TUser) => any;
    /**
     * Object containing error strings
     */
    errors?: {
        usernameOrPasswordMissing?: string;
        usernameNotFound?: string;
        incorrectPassword?: string;
        flowNotEnabled?: string;
    };
    /**
     * How long a user will remain logged in, in seconds
     */
    expires: number;
}
interface ResetPasswordFlowOptions<TUser = Record<string | number, any>> {
    /**
     * Allow users to reset their password via a code from a call to forgotPassword. Defaults to true.
     * Needs to be explicitly set to false to disable the flow
     */
    enabled?: boolean;
    handler: (user: TUser) => boolean;
    allowReusedPassword: boolean;
    errors?: {
        resetTokenExpired?: string;
        resetTokenInvalid?: string;
        resetTokenRequired?: string;
        reusedPassword?: string;
        flowNotEnabled?: string;
    };
}
interface WebAuthnFlowOptions {
    enabled: boolean;
    expires: number;
    name: string;
    domain: string;
    origin: string;
    timeout?: number;
    type: 'any' | 'platform' | 'cross-platform';
    credentialFields: {
        id: string;
        userId: string;
        publicKey: string;
        transports: string;
        counter: string;
    };
}
export interface DbAuthHandlerOptions<TUser = Record<string | number, any>> {
    /**
     * Provide prisma db client
     */
    db: PrismaClient;
    /**
     * The name of the property you'd call on `db` to access your user table.
     * ie. if your Prisma model is named `User` this value would be `user`, as in `db.user`
     */
    authModelAccessor: keyof PrismaClient;
    /**
     * The name of the property you'd call on `db` to access your user credentials table.
     * ie. if your Prisma model is named `UserCredential` this value would be `userCredential`, as in `db.userCredential`
     */
    credentialModelAccessor?: keyof PrismaClient;
    /**
     *  A map of what dbAuth calls a field to what your database calls it.
     * `id` is whatever column you use to uniquely identify a user (probably
     * something like `id` or `userId` or even `email`)
     */
    authFields: {
        id: string;
        username: string;
        hashedPassword: string;
        salt: string;
        resetToken: string;
        resetTokenExpiresAt: string;
        challenge?: string;
    };
    /**
     * Object containing cookie config options
     */
    cookie?: {
        Path?: string;
        HttpOnly?: boolean;
        Secure?: boolean;
        SameSite?: string;
        Domain?: string;
    };
    /**
     * Object containing forgot password options
     */
    forgotPassword: ForgotPasswordFlowOptions<TUser> | {
        enabled: false;
    };
    /**
     * Object containing login options
     */
    login: LoginFlowOptions<TUser> | {
        enabled: false;
    };
    /**
     * Object containing reset password options
     */
    resetPassword: ResetPasswordFlowOptions<TUser> | {
        enabled: false;
    };
    /**
     * Object containing login options
     */
    signup: SignupFlowOptions | {
        enabled: false;
    };
    /**
     * Object containing WebAuthn options
     */
    webAuthn?: WebAuthnFlowOptions | {
        enabled: false;
    };
    /**
     * CORS settings, same as in createGraphqlHandler
     */
    cors?: CorsConfig;
}
interface SignupHandlerOptions {
    username: string;
    hashedPassword: string;
    salt: string;
    userAttributes?: Record<string, string>;
}
export declare type AuthMethodNames = 'forgotPassword' | 'getToken' | 'login' | 'logout' | 'resetPassword' | 'signup' | 'validateResetToken' | 'webAuthnRegOptions' | 'webAuthnRegister' | 'webAuthnAuthOptions' | 'webAuthnAuthenticate';
declare type Params = {
    username?: string;
    password?: string;
    method: AuthMethodNames;
    [key: string]: any;
};
/**
 * To use in src/lib/auth#getCurrentUser
 *
 * Use this type to tell the getCurrentUser function what the type of session is
 * @example
 * import {User} from '@prisma/client'
 *
 * //  key being used in dbAccessor in src/functions/auth.ts 👇
 * const getCurrentUser = async (session: DbAuthSession<User['id']>)
 */
export interface DbAuthSession<TIdType = unknown> {
    id: TIdType;
}
export declare class DbAuthHandler<TUser extends Record<string | number, any>> {
    event: APIGatewayProxyEvent;
    context: LambdaContext;
    options: DbAuthHandlerOptions<TUser>;
    cookie: string | undefined;
    params: Params;
    db: PrismaClient;
    dbAccessor: any;
    dbCredentialAccessor: any;
    headerCsrfToken: string | undefined;
    hasInvalidSession: boolean;
    session: DbAuthSession | undefined;
    sessionCsrfToken: string | undefined;
    corsContext: CorsContext | undefined;
    sessionExpiresDate: string;
    webAuthnExpiresDate: string;
    static get METHODS(): AuthMethodNames[];
    static get VERBS(): {
        forgotPassword: string;
        getToken: string;
        login: string;
        logout: string;
        resetPassword: string;
        signup: string;
        validateResetToken: string;
        webAuthnRegOptions: string;
        webAuthnRegister: string;
        webAuthnAuthOptions: string;
        webAuthnAuthenticate: string;
    };
    static get PAST_EXPIRES_DATE(): string;
    static get CSRF_TOKEN(): string;
    static get AVAILABLE_WEBAUTHN_TRANSPORTS(): string[];
    /**
     * The header keys are case insensitive, but Fastify prefers these to be lowercase.
     * Therefore, we want to ensure that the headers are always lowercase and unique
     * for compliance with HTTP/2.
     *
     * @see: https://www.rfc-editor.org/rfc/rfc7540#section-8.1.2
     */
    get _deleteSessionHeader(): {
        'set-cookie': string;
    };
    constructor(event: APIGatewayProxyEvent, context: LambdaContext, options: DbAuthHandlerOptions<TUser>);
    invoke(): Promise<{
        headers: {
            [x: string]: string;
        };
        body?: string | undefined;
        statusCode: number;
    }>;
    forgotPassword(): Promise<(string | {
        'set-cookie': string;
    })[]>;
    getToken(): Promise<any[]>;
    login(): Promise<[{
        id: string;
    }, SetCookieHeader & CsrfTokenHeader, {
        statusCode: number;
    }]>;
    logout(): [string, SetCookieHeader];
    resetPassword(): Promise<[string, SetCookieHeader] | [{
        id: string;
    }, SetCookieHeader & CsrfTokenHeader, {
        statusCode: number;
    }]>;
    signup(): Promise<[{
        id: string;
    }, SetCookieHeader & CsrfTokenHeader, {
        statusCode: number;
    }] | (string | {
        statusCode?: undefined;
    } | {
        statusCode: number;
    })[]>;
    validateResetToken(): Promise<(string | {
        'set-cookie': string;
    })[]>;
    webAuthnAuthenticate(): Promise<(boolean | {
        'set-cookie': string[];
    })[]>;
    webAuthnAuthOptions(): Promise<any[]>;
    webAuthnRegOptions(): Promise<any[]>;
    webAuthnRegister(): Promise<(true | {
        'set-cookie': string;
    })[]>;
    _validateOptions(): void;
    _saveChallenge(userId: string | number, value: string | null): Promise<void>;
    _webAuthnCookie(id: string, expires: string): string;
    _sanitizeUser(user: Record<string, unknown>): any;
    _parseBody(): any;
    _cookieAttributes({ expires, options, }: {
        expires?: 'now' | string;
        options?: DbAuthHandlerOptions['cookie'];
    }): (string | null)[];
    _encrypt(data: string): CryptoJS.lib.CipherParams;
    _createSessionHeader(data: DbAuthSession, csrfToken: string): SetCookieHeader;
    _validateCsrf(): boolean;
    _findUserByToken(token: string): Promise<any>;
    _clearResetToken(user: Record<string, unknown>): Promise<void>;
    _verifyUser(username: string | undefined, password: string | undefined): Promise<any>;
    _getCurrentUser(): Promise<any>;
    _createUser(): Promise<any>;
    _hashPassword(text: string, salt?: string): string[];
    _getAuthMethod(): AuthMethodNames;
    _validateField(name: string, value: string | undefined): value is string;
    _loginResponse(user: Record<string, any>, statusCode?: number): [
        {
            id: string;
        },
        SetCookieHeader & CsrfTokenHeader,
        {
            statusCode: number;
        }
    ];
    _logoutResponse(response?: Record<string, unknown>): [string, SetCookieHeader];
    _ok(body: string, headers?: {}, options?: {
        statusCode: number;
    }): {
        statusCode: number;
        body: string;
        headers: {
            'Content-Type': string;
        };
    };
    _notFound(): {
        statusCode: number;
    };
    _badRequest(message: string): {
        statusCode: number;
        body: string;
        headers: {
            'Content-Type': string;
        };
    };
    _buildResponseWithCorsHeaders(response: {
        body?: string;
        statusCode: number;
        headers?: Record<string, string>;
    }, corsHeaders: CorsHeaders): {
        headers: {
            [x: string]: string;
        };
        body?: string | undefined;
        statusCode: number;
    };
}
export {};
//# sourceMappingURL=DbAuthHandler.d.ts.map