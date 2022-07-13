import type { PrismaClient } from '@prisma/client';
import type { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda';
import CryptoJS from 'crypto-js';
import { CorsConfig, CorsContext, CorsHeaders } from '../../cors';
interface DbAuthHandlerOptions {
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
    forgotPassword: {
        handler: (user: Record<string, unknown>) => Promise<any>;
        errors?: {
            usernameNotFound?: string;
            usernameRequired?: string;
        };
        expires: number;
    };
    /**
     * Object containing login options
     */
    login: {
        /**
         * Anything you want to happen before logging the user in. This can include
         * throwing an error to prevent login. If you do want to allow login, this
         * function must return an object representing the user you want to be logged
         * in, containing at least an `id` field (whatever named field was provided
         * for `authFields.id`). For example: `return { id: user.id }`
         */
        handler: (user: Record<string, unknown>) => Promise<any>;
        /**
         * Object containing error strings
         */
        errors?: {
            usernameOrPasswordMissing?: string;
            usernameNotFound?: string;
            incorrectPassword?: string;
        };
        /**
         * How long a user will remain logged in, in seconds
         */
        expires: number;
    };
    /**
     * Object containing reset password options
     */
    resetPassword: {
        handler: (user: Record<string, unknown>) => Promise<any>;
        allowReusedPassword: boolean;
        errors?: {
            resetTokenExpired?: string;
            resetTokenInvalid?: string;
            resetTokenRequired?: string;
            reusedPassword?: string;
        };
    };
    /**
     * Object containing login options
     */
    signup: {
        /**
         * Whatever you want to happen to your data on new user signup. Redwood will
         * check for duplicate usernames before calling this handler. At a minimum
         * you need to save the `username`, `hashedPassword` and `salt` to your
         * user table. `userAttributes` contains any additional object members that
         * were included in the object given to the `signUp()` function you got
         * from `useAuth()`
         */
        handler: (signupHandlerOptions: SignupHandlerOptions) => Promise<any>;
        /**
         * Object containing error strings
         */
        errors?: {
            fieldMissing?: string;
            usernameTaken?: string;
        };
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
    userAttributes?: any;
}
interface SessionRecord {
    id: string | number;
}
declare type AuthMethodNames = 'forgotPassword' | 'getToken' | 'login' | 'logout' | 'resetPassword' | 'signup' | 'validateResetToken';
declare type Params = {
    username?: string;
    password?: string;
    method: AuthMethodNames;
    [key: string]: unknown;
};
export declare class DbAuthHandler {
    event: APIGatewayProxyEvent;
    context: LambdaContext;
    options: DbAuthHandlerOptions;
    cookie: string | undefined;
    params: Params;
    db: PrismaClient;
    dbAccessor: any;
    headerCsrfToken: string | undefined;
    hasInvalidSession: boolean;
    session: SessionRecord | undefined;
    sessionCsrfToken: string | undefined;
    corsContext: CorsContext | undefined;
    futureExpiresDate: string;
    static get METHODS(): AuthMethodNames[];
    static get VERBS(): {
        forgotPassword: string;
        getToken: string;
        login: string;
        logout: string;
        resetPassword: string;
        signup: string;
        validateResetToken: string;
    };
    static get PAST_EXPIRES_DATE(): string;
    static get CSRF_TOKEN(): string;
    get _deleteSessionHeader(): {
        'Set-Cookie': string;
    };
    constructor(event: APIGatewayProxyEvent, context: LambdaContext, options: DbAuthHandlerOptions);
    invoke(): Promise<{
        headers: {
            [x: string]: string;
        };
        body?: string | undefined;
        statusCode: number;
    }>;
    forgotPassword(): Promise<(string | {
        'Set-Cookie': string;
    })[]>;
    getToken(): Promise<any[]>;
    login(): Promise<({
        id: any;
    } | {
        "Set-Cookie": string;
        'csrf-token': string;
        statusCode?: undefined;
    } | {
        statusCode: number;
    })[]>;
    logout(): [string, Record<"Set-Cookie", string>];
    resetPassword(): Promise<[string, Record<"Set-Cookie", string>] | ({
        id: any;
    } | {
        "Set-Cookie": string;
        'csrf-token': string;
        statusCode?: undefined;
    } | {
        statusCode: number;
    })[]>;
    signup(): Promise<({
        id: any;
    } | {
        "Set-Cookie": string;
        'csrf-token': string;
        statusCode?: undefined;
    } | {
        statusCode: number;
    })[] | (string | {
        statusCode?: undefined;
    } | {
        statusCode: number;
    })[]>;
    validateResetToken(): Promise<(string | {
        'Set-Cookie': string;
    })[]>;
    _validateOptions(): void;
    _sanitizeUser(user: Record<string, unknown>): any;
    _parseBody(): any;
    _cookieAttributes({ expires }: {
        expires?: 'now' | 'future';
    }): (string | null)[];
    _encrypt(data: string): CryptoJS.lib.CipherParams;
    _createSessionHeader(data: SessionRecord, csrfToken: string): Record<'Set-Cookie', string>;
    _validateCsrf(): boolean;
    _findUserByToken(token: string): Promise<any>;
    _clearResetToken(user: Record<string, unknown>): Promise<void>;
    _verifyUser(username: string | undefined, password: string | undefined): Promise<any>;
    _getCurrentUser(): Promise<any>;
    _createUser(): Promise<any>;
    _hashPassword(text: string, salt?: string): string[];
    _getAuthMethod(): AuthMethodNames;
    _validateField(name: string, value: string | undefined): value is string;
    _loginResponse(user: Record<string, any>, statusCode?: number): ({
        id: any;
    } | {
        "Set-Cookie": string;
        'csrf-token': string;
        statusCode?: undefined;
    } | {
        statusCode: number;
    })[];
    _logoutResponse(response?: Record<string, unknown>): [string, Record<'Set-Cookie', string>];
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