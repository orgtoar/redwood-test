import React, { ReactElement, ReactNode } from 'react';
declare type WrapperType<WTProps> = (props: WTProps & {
    children: ReactNode;
}) => ReactElement | null;
declare type SetProps<P> = P & {
    wrap?: WrapperType<P> | WrapperType<P>[];
    /**
     * `Routes` nested in a `<Set>` with `private` specified require
     * authentication. When a user is not authenticated and attempts to visit
     * the wrapped route they will be redirected to `unauthenticated` route.
     */
    private?: boolean;
    /** The page name where a user will be redirected when not authenticated */
    unauthenticated?: string;
    /** Route is permitted when authenticated and use has any of the provided roles such as "admin" or ["admin", "editor"] */
    roles?: string | string[];
    /** Prerender all pages in the set */
    prerender?: boolean;
    children: ReactNode;
    /** Loading state for auth to distinguish with whileLoading */
    whileLoadingAuth?: () => React.ReactElement | null;
};
export declare function Set<WrapperProps>(props: SetProps<WrapperProps>): JSX.Element | null;
declare type PrivateProps<P> = Omit<SetProps<P>, 'private' | 'unauthenticated' | 'wrap'> & {
    /** The page name where a user will be redirected when not authenticated */
    unauthenticated: string;
    wrap?: WrapperType<P> | WrapperType<P>[];
};
export declare function Private<WrapperProps>(props: PrivateProps<WrapperProps>): JSX.Element;
export {};
//# sourceMappingURL=Set.d.ts.map