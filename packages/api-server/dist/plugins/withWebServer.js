"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFallbackIndexPath = exports.default = void 0;

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.filter.js");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _static = _interopRequireDefault(require("@fastify/static"));

var _files = require("@redwoodjs/internal/dist/files");

var _paths = require("@redwoodjs/internal/dist/paths");

var _fastify = require("../fastify");

const getFallbackIndexPath = () => {
  const prerenderIndexPath = _path.default.join((0, _paths.getPaths)().web.dist, '/200.html'); // If 200 exists: project has been prerendered
  // If 200 doesn't exist: fallback to default index.html


  if (_fs.default.existsSync(prerenderIndexPath)) {
    return '200.html';
  } else {
    return 'index.html';
  }
};

exports.getFallbackIndexPath = getFallbackIndexPath;

const withWebServer = async (fastify, options) => {
  const prerenderedFiles = (0, _files.findPrerenderedHtml)();
  const indexPath = getFallbackIndexPath(); // Serve prerendered HTML directly, instead of the index

  prerenderedFiles.filter(filePath => filePath !== 'index.html') // remove index.html
  .forEach(filePath => {
    const pathName = filePath.split('.html')[0];
    fastify.get(`/${pathName}`, (_, reply) => {
      reply.header('Content-Type', 'text/html; charset=UTF-8');
      reply.sendFile(filePath);
    });
  });
  const {
    configureFastify
  } = (0, _fastify.loadFastifyConfig)();

  if (configureFastify) {
    await configureFastify(fastify, {
      side: 'web',
      ...options
    });
  } // Serve other non-html assets


  fastify.register(_static.default, {
    root: (0, _paths.getPaths)().web.dist
  }); // For SPA routing fallback on unmatched routes
  // And let JS routing take over

  fastify.setNotFoundHandler({}, function (_, reply) {
    reply.header('Content-Type', 'text/html; charset=UTF-8');
    reply.sendFile(indexPath);
  });
  return fastify;
};

var _default = withWebServer;
exports.default = _default;