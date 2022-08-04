"use strict";

var _context, _context2, _context3;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  navigate: true,
  back: true,
  Link: true,
  NavLink: true,
  useMatch: true,
  Redirect: true,
  useLocation: true,
  LocationProvider: true,
  usePageLoadingContext: true,
  PageLoadingContextProvider: true,
  useParams: true,
  ParamsProvider: true,
  ParamsContext: true,
  Router: true,
  Route: true,
  routes: true,
  RouteAnnouncement: true,
  RouteFocus: true,
  parseSearch: true,
  matchPath: true,
  SkipNavLink: true,
  SkipNavContent: true
};

_Object$defineProperty(exports, "Link", {
  enumerable: true,
  get: function () {
    return _links.Link;
  }
});

_Object$defineProperty(exports, "LocationProvider", {
  enumerable: true,
  get: function () {
    return _location.LocationProvider;
  }
});

_Object$defineProperty(exports, "NavLink", {
  enumerable: true,
  get: function () {
    return _links.NavLink;
  }
});

_Object$defineProperty(exports, "PageLoadingContextProvider", {
  enumerable: true,
  get: function () {
    return _PageLoadingContext.PageLoadingContextProvider;
  }
});

_Object$defineProperty(exports, "ParamsContext", {
  enumerable: true,
  get: function () {
    return _params.ParamsContext;
  }
});

_Object$defineProperty(exports, "ParamsProvider", {
  enumerable: true,
  get: function () {
    return _params.ParamsProvider;
  }
});

_Object$defineProperty(exports, "Redirect", {
  enumerable: true,
  get: function () {
    return _links.Redirect;
  }
});

_Object$defineProperty(exports, "Route", {
  enumerable: true,
  get: function () {
    return _router.Route;
  }
});

_Object$defineProperty(exports, "RouteAnnouncement", {
  enumerable: true,
  get: function () {
    return _routeAnnouncement.default;
  }
});

_Object$defineProperty(exports, "RouteFocus", {
  enumerable: true,
  get: function () {
    return _routeFocus.default;
  }
});

_Object$defineProperty(exports, "Router", {
  enumerable: true,
  get: function () {
    return _router.Router;
  }
});

_Object$defineProperty(exports, "SkipNavContent", {
  enumerable: true,
  get: function () {
    return _skipNav.SkipNavContent;
  }
});

_Object$defineProperty(exports, "SkipNavLink", {
  enumerable: true,
  get: function () {
    return _skipNav.SkipNavLink;
  }
});

_Object$defineProperty(exports, "back", {
  enumerable: true,
  get: function () {
    return _history.back;
  }
});

_Object$defineProperty(exports, "matchPath", {
  enumerable: true,
  get: function () {
    return _util.matchPath;
  }
});

_Object$defineProperty(exports, "navigate", {
  enumerable: true,
  get: function () {
    return _history.navigate;
  }
});

_Object$defineProperty(exports, "parseSearch", {
  enumerable: true,
  get: function () {
    return _util.parseSearch;
  }
});

_Object$defineProperty(exports, "routes", {
  enumerable: true,
  get: function () {
    return _router.routes;
  }
});

_Object$defineProperty(exports, "useLocation", {
  enumerable: true,
  get: function () {
    return _location.useLocation;
  }
});

_Object$defineProperty(exports, "useMatch", {
  enumerable: true,
  get: function () {
    return _links.useMatch;
  }
});

_Object$defineProperty(exports, "usePageLoadingContext", {
  enumerable: true,
  get: function () {
    return _PageLoadingContext.usePageLoadingContext;
  }
});

_Object$defineProperty(exports, "useParams", {
  enumerable: true,
  get: function () {
    return _params.useParams;
  }
});

var _history = require("./history");

var _links = require("./links");

var _location = require("./location");

var _PageLoadingContext = require("./PageLoadingContext");

var _params = require("./params");

var _router = require("./router");

var _Set = require("./Set");

_forEachInstanceProperty(_context = _Object$keys(_Set)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _Set[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Set[key];
    }
  });
});

var _routeAnnouncement = _interopRequireWildcard(require("./route-announcement"));

_forEachInstanceProperty(_context2 = _Object$keys(_routeAnnouncement)).call(_context2, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _routeAnnouncement[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _routeAnnouncement[key];
    }
  });
});

var _routeFocus = _interopRequireWildcard(require("./route-focus"));

_forEachInstanceProperty(_context3 = _Object$keys(_routeFocus)).call(_context3, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _routeFocus[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _routeFocus[key];
    }
  });
});

var _util = require("./util");

var _skipNav = require("@reach/skip-nav");