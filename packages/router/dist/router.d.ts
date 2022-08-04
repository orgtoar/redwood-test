import React from 'react';
import { RouterContextProviderProps } from './router-context';
import { TrailingSlashesTypes, Spec } from './util';
import type { AvailableRoutes } from './index';
declare const namedRoutes: AvailableRoutes;
declare type PageType = Spec | React.ComponentType<any> | ((props: any) => JSX.Element);
interface RouteProps {
    path: string;
    page: PageType;
    name: string;
    prerender?: boolean;
    whileLoadingPage?: () => React.ReactElement | null;
}
interface RedirectRouteProps {
    path: string;
    redirect: string;
}
interface NotFoundRouteProps {
    notfound: boolean;
    page: PageType;
    prerender?: boolean;
}
export declare type InternalRouteProps = Partial<RouteProps & RedirectRouteProps & NotFoundRouteProps>;
declare function Route(props: RouteProps): JSX.Element;
declare function Route(props: RedirectRouteProps): JSX.Element;
declare function Route(props: NotFoundRouteProps): JSX.Element;
declare function isRoute(node: React.ReactNode): node is React.ReactElement<InternalRouteProps>;
interface RouterProps extends RouterContextProviderProps {
    trailingSlashes?: TrailingSlashesTypes;
    pageLoadingDelay?: number;
}
declare const Router: React.FC<RouterProps>;
export { Router, Route, namedRoutes as routes, isRoute, PageType };
//# sourceMappingURL=router.d.ts.map