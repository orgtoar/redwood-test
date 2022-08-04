export declare const clerk: (token: string) => Promise<{
    roles: unknown;
    id: string;
    passwordEnabled: boolean;
    twoFactorEnabled: boolean;
    createdAt: number;
    updatedAt: number;
    profileImageUrl: string;
    gender: string;
    birthday: string;
    primaryEmailAddressId: string | null;
    primaryPhoneNumberId: string | null;
    primaryWeb3WalletId: string | null;
    lastSignInAt: number | null;
    externalId: string | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    publicMetadata: Record<string, unknown>;
    privateMetadata: Record<string, unknown>;
    unsafeMetadata: Record<string, unknown>;
    emailAddresses: import("@clerk/clerk-sdk-node/instance").EmailAddress[];
    phoneNumbers: import("@clerk/clerk-sdk-node/instance").PhoneNumber[];
    web3Wallets: import("@clerk/backend-core/dist/cjs/api/resources/Web3Wallet").Web3Wallet[];
    externalAccounts: import("@clerk/clerk-sdk-node/instance").ExternalAccount[];
}>;
//# sourceMappingURL=clerk.d.ts.map