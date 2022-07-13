"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.detectPrerenderRoutes = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _internal = require("@redwoodjs/internal");

var _structure = require("@redwoodjs/structure");

const detectPrerenderRoutes = () => {
  var _context, _context2;

  const rwProject = (0, _structure.getProject)((0, _internal.getPaths)().base);
  const routes = rwProject.getRouter().routes;
  const prerenderRoutes = (0, _map.default)(_context = (0, _filter.default)(_context2 = (0, _filter.default)(routes).call(routes, route => !route.hasParameters) // ignore routes that take params
  ).call(_context2, route => route.prerender) // only select routes with prerender prop
  ).call(_context, route => {
    var _route$page;

    return {
      name: route.isNotFound ? '404' : route.name,
      path: route.isNotFound ? '/404' : route.path,
      hasParams: route.hasParameters,
      id: route.id,
      isNotFound: route.isNotFound,
      filePath: (_route$page = route.page) === null || _route$page === void 0 ? void 0 : _route$page.filePath
    };
  });
  return prerenderRoutes;
};

exports.detectPrerenderRoutes = detectPrerenderRoutes;