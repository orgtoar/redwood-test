"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.detectPrerenderRoutes = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _paths = require("@redwoodjs/internal/dist/paths");

var _structure = require("@redwoodjs/structure");

const detectPrerenderRoutes = () => {
  var _context;

  const rwProject = (0, _structure.getProject)((0, _paths.getPaths)().base);
  const routes = rwProject.getRouter().routes;
  const prerenderRoutes = (0, _map.default)(_context = (0, _filter.default)(routes).call(routes, route => route.prerender) // only select routes with prerender prop
  ).call(_context, route => ({
    name: route.isNotFound ? '404' : route.name,
    // `path` will be updated/expanded later where route parameters will be
    // replaced with actual values
    path: route.isNotFound ? '/404' : route.path,
    // `routePath` is always the path specified on the <Route> component
    // (or the special /404 path)
    routePath: route.isNotFound ? '/404' : route.path,
    hasParams: route.hasParameters,
    id: route.id,
    isNotFound: route.isNotFound,
    filePath: route.page?.filePath
  }));
  return prerenderRoutes;
};

exports.detectPrerenderRoutes = detectPrerenderRoutes;