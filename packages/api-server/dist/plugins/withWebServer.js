"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.getFallbackIndexPath = exports.default = void 0;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _static = _interopRequireDefault(require("@fastify/static"));

var _internal = require("@redwoodjs/internal");

const getFallbackIndexPath = () => {
  const prerenderIndexPath = _path.default.join((0, _internal.getPaths)().web.dist, '/200.html'); // If 200 exists: project has been prerendered
  // If 200 doesn't exist: fallback to default index.html


  if (_fs.default.existsSync(prerenderIndexPath)) {
    return '200.html';
  } else {
    return 'index.html';
  }
};

exports.getFallbackIndexPath = getFallbackIndexPath;

const withWebServer = app => {
  var _context;

  const prerenderedFiles = (0, _internal.findPrerenderedHtml)();
  const indexPath = getFallbackIndexPath(); // Serve prerendered HTML directly, instead of the index

  (0, _forEach.default)(_context = (0, _filter.default)(prerenderedFiles).call(prerenderedFiles, filePath => filePath !== 'index.html') // remove index.html
  ).call(_context, filePath => {
    const pathName = filePath.split('.html')[0];
    app.get(`/${pathName}`, (_, reply) => {
      reply.header('Content-Type', 'text/html; charset=UTF-8');
      reply.sendFile(filePath);
    });
  }); // Serve other non-html assets

  app.register(_static.default, {
    root: (0, _internal.getPaths)().web.dist
  }); // For SPA routing fallback on unmatched routes
  // And let JS routing take over

  app.setNotFoundHandler({}, function (_, reply) {
    reply.header('Content-Type', 'text/html; charset=UTF-8');
    reply.sendFile(indexPath);
  });
  return app;
};

var _default = withWebServer;
exports.default = _default;