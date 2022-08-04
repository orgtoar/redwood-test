import type { FirebaseApp } from 'firebase/app';
import type { CustomParameters, User } from 'firebase/auth';
import type FirebaseAuthNamespace from 'firebase/auth';
import { AuthClient } from './';
export declare type FirebaseAuth = typeof FirebaseAuthNamespace;
export declare type FirebaseUser = User;
export declare type oAuthProvider = 'google.com' | 'facebook.com' | 'github.com' | 'twitter.com' | 'microsoft.com' | 'apple.com';
export declare type emailLinkProvider = 'emailLink';
export declare type customTokenProvider = 'customToken';
export declare type Options = {
    providerId?: oAuthProvider | emailLinkProvider | customTokenProvider;
    email?: string;
    emailLink?: string;
    customToken?: string;
    password?: string;
    scopes?: string[];
    customParameters?: CustomParameters;
};
export declare type FirebaseClient = {
    firebaseAuth: FirebaseAuth;
    firebaseApp?: FirebaseApp;
};
export declare const firebase: ({ firebaseAuth, firebaseApp, }: FirebaseClient) => AuthClient;
//# sourceMappingURL=firebase.d.ts.map