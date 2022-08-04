import React, { ReactElement, ReactNode } from 'react';
/** Create a React Context with the given name. */
export declare const createNamedContext: <T>(name: string, defaultValue?: T | undefined) => React.Context<T | undefined>;
/**
 * Get param name, type, and match for a route.
 *
 *  '/blog/{year}/{month}/{day:Int}/{filePath...}'
 *   => [
 *        ['year',     'String', '{year}'],
 *        ['month',    'String', '{month}'],
 *        ['day',      'Int',    '{day:Int}'],
 *        ['filePath', 'Glob',   '{filePath...}']
 *      ]
 *
 * Only exported to be able to test it
 */
export declare const paramsForRoute: (route: string) => string[][];
export declare type TrailingSlashesTypes = 'never' | 'always' | 'preserve';
export interface ParamType {
    match?: RegExp;
    parse?: (value: any) => unknown;
}
/**
 * Determine if the given route is a match for the given pathname. If so,
 * extract any named params and return them in an object.
 *
 * route         - The route path as specified in the <Route path={...} />
 * pathname      - The pathname from the window.location.
 * allParamTypes - The object containing all param type definitions.
 *
 * Examples:
 *
 *  matchPath('/blog/{year}/{month}/{day}', '/blog/2019/12/07')
 *  => { match: true, params: { year: '2019', month: '12', day: '07' }}
 *
 *  matchPath('/about', '/')
 *  => { match: false }
 *
 *  matchPath('/post/{id:Int}', '/post/7')
 *  => { match: true, params: { id: 7 }}
 */
export declare const matchPath: (route: string, pathname: string, paramTypes?: Record<string, ParamType>) => {
    match: boolean;
    params?: undefined;
} | {
    match: boolean;
    params: Record<string, unknown>;
};
/**
 * Parse the given search string into key/value pairs and return them in an
 * object.
 *
 * Examples:
 *
 *  parseSearch('?key1=val1&key2=val2')
 *  => { key1: 'val1', key2: 'val2' }
 *
 * @fixme
 * This utility ignores keys with multiple values such as `?foo=1&foo=2`.
 */
export declare const parseSearch: (search: string | string[][] | Record<string, string> | URLSearchParams | undefined) => {};
/**
 * Validate a path to make sure it follows the router's rules. If any problems
 * are found, a descriptive Error will be thrown, as problems with routes are
 * critical enough to be considered fatal.
 */
export declare const validatePath: (path: string) => void;
/**
 * Take a given route path and replace any named parameters with those in the
 * given args object. Any extra params not used in the path will be appended
 * as key=value pairs in the search part.
 *
 * Examples:
 *
 *   replaceParams('/tags/{tag}', { tag: 'code', extra: 'foo' })
 *   => '/tags/code?extra=foo
 */
export declare const replaceParams: (route: string, args?: Record<string, unknown>) => string;
export declare function isReactElement(node: ReactNode): node is ReactElement;
export declare function flattenAll(children: ReactNode): ReactNode[];
/**
 *
 * @param {string} queryString
 * @returns {Array<string | Record<string, any>>} A flat array of search params
 *
 * useMatch hook options searchParams requires a flat array
 *
 * Examples:
 *
 *  parseSearch('?key1=val1&key2=val2')
 *  => { key1: 'val1', key2: 'val2' }
 *
 * flattenSearchParams(parseSearch('?key1=val1&key2=val2'))
 * => [ { key1: 'val1' }, { key2: 'val2' } ]
 *
 */
export declare function flattenSearchParams(queryString: string): Array<string | Record<string, any>>;
export interface Spec {
    name: string;
    loader: () => Promise<{
        default: React.ComponentType<unknown>;
    }>;
}
export declare function isSpec(specOrPage: Spec | React.ComponentType): specOrPage is Spec;
/**
 * Pages can be imported automatically or manually. Automatic imports are actually
 * objects and take the following form (which we call a 'spec'):
 *
 *   const WhateverPage = {
 *     name: 'WhateverPage',
 *     loader: () => import('src/pages/WhateverPage')
 *   }
 *
 * Manual imports simply load the page:
 *
 *   import WhateverPage from 'src/pages/WhateverPage'
 *
 * Before passing a "page" to the PageLoader, we will normalize the manually
 * imported version into a spec.
 */
export declare function normalizePage(specOrPage: Spec | React.ComponentType<unknown>): Spec;
//# sourceMappingURL=util.d.ts.map