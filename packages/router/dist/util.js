"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNamedContext = void 0;
exports.flattenAll = flattenAll;
exports.flattenSearchParams = flattenSearchParams;
exports.isReactElement = isReactElement;
exports.isSpec = isSpec;
exports.matchPath = void 0;
exports.normalizePage = normalizePage;
exports.validatePath = exports.replaceParams = exports.parseSearch = exports.paramsForRoute = void 0;

var _matchAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/match-all"));

var _react = _interopRequireWildcard(require("react"));

/** Create a React Context with the given name. */
const createNamedContext = (name, defaultValue) => {
  const Ctx = /*#__PURE__*/_react.default.createContext(defaultValue);

  Ctx.displayName = name;
  return Ctx;
};
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


exports.createNamedContext = createNamedContext;

const paramsForRoute = route => {
  // Match the strings between `{` and `}`.
  const params = [...(0, _matchAll.default)(route).call(route, /\{([^}]+)\}/g)];
  return params.map(match => match[1]).map(match => {
    const parts = match.split(':'); // Normalize the name

    let name = parts[0];

    if (name.slice(-3) === '...') {
      // Globs have their ellipsis removed
      name = name.slice(0, -3);
    } // Determine the type


    let type = parts[1];

    if (!type) {
      // Strings and Globs are implicit in the syntax
      type = match.slice(-3) === '...' ? 'Glob' : 'String';
    }

    return [name, type, "{".concat(match, "}")];
  });
};

exports.paramsForRoute = paramsForRoute;

/** Definitions of the core param types. */
const coreParamTypes = {
  String: {
    match: /[^/]+/
  },
  Int: {
    match: /\d+/,
    parse: Number
  },
  Float: {
    match: /[-+]?(?:\d*\.?\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/,
    parse: Number
  },
  Boolean: {
    match: /true|false/,
    parse: boolAsString => boolAsString === 'true'
  },
  Glob: {
    match: /.*/
  }
};

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
const matchPath = (route, pathname, paramTypes) => {
  // Get the names and the transform types for the given route.
  const routeParams = paramsForRoute(route);
  const allParamTypes = { ...coreParamTypes,
    ...paramTypes
  };
  let typeMatchingRoute = route; // Map all params from the route to their type `match` regexp to create a
  // "type-matching route" regexp

  for (const [_name, type, match] of routeParams) {
    var _allParamTypes;

    // `undefined` matcher if `type` is not supported
    const matcher = (_allParamTypes = allParamTypes[type]) === null || _allParamTypes === void 0 ? void 0 : _allParamTypes.match; // Get the regex as a string, or default regexp if `match` is not specified

    const typeRegexp = (matcher === null || matcher === void 0 ? void 0 : matcher.source) || '[^/]+';
    typeMatchingRoute = typeMatchingRoute.replace(match, "(".concat(typeRegexp, ")"));
  } // Does the `pathname` match the route?


  const matches = [...(0, _matchAll.default)(pathname).call(pathname, new RegExp("^".concat(typeMatchingRoute, "$"), 'g'))];

  if (matches.length === 0) {
    return {
      match: false
    };
  } // Map extracted values to their param name, casting the value if needed


  const providedParams = matches[0].slice(1);
  const params = providedParams.reduce((acc, value, index) => {
    const [name, transformName] = routeParams[index];
    const typeInfo = allParamTypes[transformName];
    let transformedValue = value;

    if (typeof (typeInfo === null || typeInfo === void 0 ? void 0 : typeInfo.parse) === 'function') {
      transformedValue = typeInfo.parse(value);
    }

    return { ...acc,
      [name]: transformedValue
    };
  }, {});
  return {
    match: true,
    params
  };
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


exports.matchPath = matchPath;

const parseSearch = search => {
  const searchParams = new URLSearchParams(search);
  return [...searchParams.keys()].reduce((params, key) => ({ ...params,
    [key]: searchParams.get(key)
  }), {});
};
/**
 * Validate a path to make sure it follows the router's rules. If any problems
 * are found, a descriptive Error will be thrown, as problems with routes are
 * critical enough to be considered fatal.
 */


exports.parseSearch = parseSearch;

const validatePath = path => {
  // Check that path begins with a slash.
  if (!path.startsWith('/')) {
    throw new Error("Route path does not begin with a slash: \"".concat(path, "\""));
  }

  if (path.indexOf(' ') >= 0) {
    throw new Error("Route path contains spaces: \"".concat(path, "\""));
  } // Check for duplicate named params.


  const matches = (0, _matchAll.default)(path).call(path, /\{([^}]+)\}/g);
  const memo = {};

  for (const match of matches) {
    // Extract the param's name to make sure there aren't any duplicates
    const param = match[1].split(':')[0];

    if (memo[param]) {
      throw new Error("Route path contains duplicate parameter: \"".concat(path, "\""));
    } else {
      memo[param] = true;
    }
  }
};
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


exports.validatePath = validatePath;

const replaceParams = function (route) {
  let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const params = paramsForRoute(route);
  let path = route; // Replace all params in the route with their values

  params.forEach(param => {
    const [name, _type, match] = param;
    const value = args[name];

    if (value !== undefined) {
      path = path.replace(match, value);
    } else {
      throw new Error("Missing parameter '".concat(name, "' for route '").concat(route, "' when generating a navigation URL."));
    }
  });
  const paramNames = params.map(param => param[0]);
  const extraArgKeys = Object.keys(args).filter(x => !paramNames.includes(x)); // Prepare any unnamed params to be be appended as search params.

  const queryParams = [];
  extraArgKeys.forEach(key => {
    queryParams.push("".concat(key, "=").concat(args[key]));
  }); // Append any unnamed params as search params.

  if (queryParams.length) {
    path += "?".concat(queryParams.join('&'));
  }

  return path;
};

exports.replaceParams = replaceParams;

function isReactElement(node) {
  return node !== undefined && node !== null && node.type !== undefined;
}

function flattenAll(children) {
  const childrenArray = _react.Children.toArray(children);

  return childrenArray.flatMap(child => {
    if (isReactElement(child) && child.props.children) {
      return [child, ...flattenAll(child.props.children)];
    }

    return [child];
  });
}
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


function flattenSearchParams(queryString) {
  const searchParams = [];

  for (const [key, value] of Object.entries(parseSearch(queryString))) {
    searchParams.push({
      [key]: value
    });
  }

  return searchParams;
}

function isSpec(specOrPage) {
  return specOrPage.loader !== undefined;
}
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


function normalizePage(specOrPage) {
  if (isSpec(specOrPage)) {
    // Already a spec, just return it.
    return specOrPage;
  } // Wrap the Page in a fresh spec, and put it in a promise to emulate
  // an async module import.


  return {
    name: specOrPage.name,
    loader: async () => ({
      default: specOrPage
    })
  };
}