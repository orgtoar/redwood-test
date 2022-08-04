"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Route = Route;
exports.Router = void 0;
exports.isRoute = isRoute;
exports.routes = void 0;

var _react = _interopRequireDefault(require("react"));

var _activeRouteLoader = require("./active-route-loader");

var _ActivePageContext = require("./ActivePageContext");

var _links = require("./links");

var _location = require("./location");

var _params = require("./params");

var _routerContext = require("./router-context");

var _splashPage = require("./splash-page");

var _util = require("./util");

// namedRoutes is populated at run-time by iterating over the `<Route />`
// components, and appending them to this object.
const namedRoutes = {};
exports.routes = namedRoutes;

function Route(props) {
  return /*#__PURE__*/_react.default.createElement(InternalRoute, props);
}

const InternalRoute = _ref => {
  var _activePageContext$lo, _activePageContext$lo2;

  let {
    path,
    page,
    name,
    redirect,
    notfound
  } = _ref;
  const routerState = (0, _routerContext.useRouterState)();
  const activePageContext = (0, _ActivePageContext.useActivePageContext)();

  if (notfound) {
    // The "notfound" route is handled by <NotFoundChecker>
    return null;
  }

  if (!path) {
    throw new Error("Route \"".concat(name, "\" needs to specify a path"));
  } // Check for issues with the path.


  (0, _util.validatePath)(path);
  const location = (_activePageContext$lo = activePageContext.loadingState[path]) === null || _activePageContext$lo === void 0 ? void 0 : _activePageContext$lo.location;

  if (!location) {
    throw new Error("No location for route \"".concat(name, "\""));
  }

  const {
    params: pathParams
  } = (0, _util.matchPath)(path, location.pathname, routerState.paramTypes);
  const searchParams = (0, _util.parseSearch)(location.search);
  const allParams = { ...searchParams,
    ...pathParams
  };

  if (redirect) {
    const newPath = (0, _util.replaceParams)(redirect, allParams);
    return /*#__PURE__*/_react.default.createElement(_links.Redirect, {
      to: newPath
    });
  }

  if (!page || !name) {
    throw new Error("A route that's not a redirect or notfound route needs to specify " + 'both a `page` and a `name`');
  }

  const Page = ((_activePageContext$lo2 = activePageContext.loadingState[path]) === null || _activePageContext$lo2 === void 0 ? void 0 : _activePageContext$lo2.page) || (() => null); // Level 3/3 (InternalRoute)


  return /*#__PURE__*/_react.default.createElement(Page, allParams);
};

function isRoute(node) {
  return (0, _util.isReactElement)(node) && node.type === Route;
}

const Router = _ref2 => {
  let {
    useAuth,
    paramTypes,
    pageLoadingDelay,
    trailingSlashes = 'never',
    children
  } = _ref2;
  return (
    /*#__PURE__*/
    // Level 1/3 (outer-most)
    _react.default.createElement(_location.LocationProvider, {
      trailingSlashes: trailingSlashes
    }, /*#__PURE__*/_react.default.createElement(LocationAwareRouter, {
      useAuth: useAuth,
      paramTypes: paramTypes,
      pageLoadingDelay: pageLoadingDelay
    }, children))
  );
};

exports.Router = Router;

const LocationAwareRouter = _ref3 => {
  let {
    useAuth,
    paramTypes,
    pageLoadingDelay,
    children
  } = _ref3;
  const location = (0, _location.useLocation)();
  const flatChildArray = (0, _util.flattenAll)(children);
  const hasHomeRoute = flatChildArray.some(child => {
    if (isRoute(child)) {
      return child.props.path === '/';
    }

    return false;
  }); // The user has not generated routes
  // if the only route that exists is
  // is the not found page

  const hasGeneratedRoutes = !(flatChildArray.length === 1 && isRoute(flatChildArray[0]) && flatChildArray[0].props.notfound);
  const shouldShowSplash = !hasHomeRoute && location.pathname === '/' || !hasGeneratedRoutes;
  flatChildArray.forEach(child => {
    if (isRoute(child)) {
      const {
        name,
        path
      } = child.props;

      if (path) {
        // Check for issues with the path.
        (0, _util.validatePath)(path);

        if (name && path) {
          namedRoutes[name] = function () {
            let args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return (0, _util.replaceParams)(path, args);
          };
        }
      }
    }
  });

  if (shouldShowSplash && typeof _splashPage.SplashPage !== 'undefined') {
    return /*#__PURE__*/_react.default.createElement(_splashPage.SplashPage, {
      hasGeneratedRoutes: hasGeneratedRoutes,
      routes: flatChildArray
    });
  }

  const {
    root,
    activeRoute,
    NotFoundPage
  } = analyzeRouterTree(children, location.pathname, paramTypes);

  if (!activeRoute) {
    if (NotFoundPage) {
      return /*#__PURE__*/_react.default.createElement(_routerContext.RouterContextProvider, {
        useAuth: useAuth,
        paramTypes: paramTypes
      }, /*#__PURE__*/_react.default.createElement(_params.ParamsProvider, null, /*#__PURE__*/_react.default.createElement(_activeRouteLoader.ActiveRouteLoader, {
        spec: (0, _util.normalizePage)(NotFoundPage),
        delay: pageLoadingDelay,
        path: location.pathname
      })));
    }

    return null;
  }

  const {
    path,
    page,
    name,
    redirect,
    whileLoadingPage
  } = activeRoute.props;

  if (!path) {
    throw new Error("Route \"".concat(name, "\" needs to specify a path"));
  } // Check for issues with the path.


  (0, _util.validatePath)(path);
  const {
    params: pathParams
  } = (0, _util.matchPath)(path, location.pathname, paramTypes);
  const searchParams = (0, _util.parseSearch)(location.search);
  const allParams = { ...searchParams,
    ...pathParams
  }; // Level 2/3 (LocationAwareRouter)

  return /*#__PURE__*/_react.default.createElement(_routerContext.RouterContextProvider, {
    useAuth: useAuth,
    paramTypes: paramTypes
  }, redirect && /*#__PURE__*/_react.default.createElement(_links.Redirect, {
    to: (0, _util.replaceParams)(redirect, allParams)
  }), !redirect && page && /*#__PURE__*/_react.default.createElement(_activeRouteLoader.ActiveRouteLoader, {
    path: path,
    spec: (0, _util.normalizePage)(page),
    delay: pageLoadingDelay,
    params: allParams,
    whileLoadingPage: whileLoadingPage
  }, root));
};
/**
 * This function analyzes the routes and returns info pertaining to what to
 * render.
 *  - root: The element to render, i.e. the active route or the <Set>(s)
 *    wrapping it
 *  - activeRoute: The route we should render (same as root for flat routes)
 *  - NotFoundPage: The NotFoundPage, if we find any. Even if there is a
 *    NotFoundPage specified we might not find it, but only if we first find
 *    the active route, and in that case we don't need the NotFoundPage, so it
 *    doesn't matter.
 */


function analyzeRouterTree(children, pathname, paramTypes) {
  let NotFoundPage = undefined;
  let activeRoute = undefined;

  function isActiveRoute(route) {
    if (route.props.path) {
      const {
        match
      } = (0, _util.matchPath)(route.props.path, pathname, paramTypes);

      if (match) {
        return true;
      }
    }

    return false;
  }

  function analyzeRouterTreeInternal(children) {
    return _react.default.Children.toArray(children).reduce((previousValue, child) => {
      if (previousValue) {
        return previousValue;
      }

      if (isRoute(child)) {
        if (child.props.notfound && child.props.page) {
          NotFoundPage = child.props.page;
        } // We have a <Route ...> element, let's check if it's the one we should
        // render (i.e. the active route)


        if (isActiveRoute(child)) {
          // All <Route>s have a key that React has generated for them.
          // Something like '.1', '.2', etc
          // But we know we'll only ever render one <Route>, so we can give
          // all of them the same key. This will make React re-use the element
          // between renders, which helps get rid of "white flashes" when
          // navigating between pages. (The other half of that equation is in
          // PageLoader)
          const childWithKey = /*#__PURE__*/_react.default.cloneElement(child, { ...child.props,
            key: '.rw-route'
          });

          activeRoute = childWithKey;
          return childWithKey;
        }
      } else if ((0, _util.isReactElement)(child) && child.props.children) {
        // We have a child element that's not a <Route ...>, and that has
        // children. It's probably a <Set>. Recurse down one level
        const nestedActive = analyzeRouterTreeInternal(child.props.children);

        if (nestedActive) {
          // We found something we wanted to keep. So let's return it
          return /*#__PURE__*/_react.default.cloneElement(child, child.props, nestedActive);
        }
      }

      return previousValue;
    }, undefined);
  }

  const root = analyzeRouterTreeInternal(children);
  return {
    root,
    activeRoute,
    NotFoundPage
  };
}