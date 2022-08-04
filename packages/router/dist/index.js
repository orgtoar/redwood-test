"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

Object.defineProperty(exports, "__esModule", {
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
Object.defineProperty(exports, "Link", {
  enumerable: true,
  get: function () {
    return _links.Link;
  }
});
Object.defineProperty(exports, "LocationProvider", {
  enumerable: true,
  get: function () {
    return _location.LocationProvider;
  }
});
Object.defineProperty(exports, "NavLink", {
  enumerable: true,
  get: function () {
    return _links.NavLink;
  }
});
Object.defineProperty(exports, "PageLoadingContextProvider", {
  enumerable: true,
  get: function () {
    return _PageLoadingContext.PageLoadingContextProvider;
  }
});
Object.defineProperty(exports, "ParamsContext", {
  enumerable: true,
  get: function () {
    return _params.ParamsContext;
  }
});
Object.defineProperty(exports, "ParamsProvider", {
  enumerable: true,
  get: function () {
    return _params.ParamsProvider;
  }
});
Object.defineProperty(exports, "Redirect", {
  enumerable: true,
  get: function () {
    return _links.Redirect;
  }
});
Object.defineProperty(exports, "Route", {
  enumerable: true,
  get: function () {
    return _router.Route;
  }
});
Object.defineProperty(exports, "RouteAnnouncement", {
  enumerable: true,
  get: function () {
    return _routeAnnouncement.default;
  }
});
Object.defineProperty(exports, "RouteFocus", {
  enumerable: true,
  get: function () {
    return _routeFocus.default;
  }
});
Object.defineProperty(exports, "Router", {
  enumerable: true,
  get: function () {
    return _router.Router;
  }
});
Object.defineProperty(exports, "SkipNavContent", {
  enumerable: true,
  get: function () {
    return _skipNav.SkipNavContent;
  }
});
Object.defineProperty(exports, "SkipNavLink", {
  enumerable: true,
  get: function () {
    return _skipNav.SkipNavLink;
  }
});
Object.defineProperty(exports, "back", {
  enumerable: true,
  get: function () {
    return _history.back;
  }
});
Object.defineProperty(exports, "matchPath", {
  enumerable: true,
  get: function () {
    return _util.matchPath;
  }
});
Object.defineProperty(exports, "navigate", {
  enumerable: true,
  get: function () {
    return _history.navigate;
  }
});
Object.defineProperty(exports, "parseSearch", {
  enumerable: true,
  get: function () {
    return _util.parseSearch;
  }
});
Object.defineProperty(exports, "routes", {
  enumerable: true,
  get: function () {
    return _router.routes;
  }
});
Object.defineProperty(exports, "useLocation", {
  enumerable: true,
  get: function () {
    return _location.useLocation;
  }
});
Object.defineProperty(exports, "useMatch", {
  enumerable: true,
  get: function () {
    return _links.useMatch;
  }
});
Object.defineProperty(exports, "usePageLoadingContext", {
  enumerable: true,
  get: function () {
    return _PageLoadingContext.usePageLoadingContext;
  }
});
Object.defineProperty(exports, "useParams", {
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

Object.keys(_Set).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _Set[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Set[key];
    }
  });
});

var _routeAnnouncement = _interopRequireWildcard(require("./route-announcement"));

Object.keys(_routeAnnouncement).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _routeAnnouncement[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _routeAnnouncement[key];
    }
  });
});

var _routeFocus = _interopRequireWildcard(require("./route-focus"));

Object.keys(_routeFocus).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _routeFocus[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _routeFocus[key];
    }
  });
});

var _util = require("./util");

var _skipNav = require("@reach/skip-nav");