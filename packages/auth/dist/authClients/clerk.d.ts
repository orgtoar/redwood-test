import { UserResource as ClerkUserResource, Clerk, SignOut } from '@clerk/types';
import type { AuthClient } from '.';
export interface AuthClientClerk extends AuthClient {
    logout: SignOut;
}
export type { Clerk };
export declare type ClerkUser = ClerkUserResource & {
    roles: string[] | null;
};
export declare const clerk: (client: Clerk) => Promise<AuthClientClerk>;
//# sourceMappingURL=clerk.d.ts.map