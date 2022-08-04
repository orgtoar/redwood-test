"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detectPrerenderRoutes = void 0;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

var _paths = require("@redwoodjs/internal/dist/paths");

var _structure = require("@redwoodjs/structure");

const detectPrerenderRoutes = () => {
  const rwProject = (0, _structure.getProject)((0, _paths.getPaths)().base);
  const routes = rwProject.getRouter().routes;
  const prerenderRoutes = routes.filter(route => route.prerender) // only select routes with prerender prop
  .map(route => {
    var _route$page;

    return {
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
      filePath: (_route$page = route.page) === null || _route$page === void 0 ? void 0 : _route$page.filePath
    };
  });
  return prerenderRoutes;
};

exports.detectPrerenderRoutes = detectPrerenderRoutes;