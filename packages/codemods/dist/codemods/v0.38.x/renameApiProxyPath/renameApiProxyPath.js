"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameApiProxyPath = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

const renameApiProxyPath = () => {
  const redwoodTOMLPath = _path.default.join((0, _getRWPaths.default)().base, 'redwood.toml');

  let redwoodTOML = _fs.default.readFileSync(redwoodTOMLPath, 'utf8');

  redwoodTOML = redwoodTOML.replace('apiProxyPath', 'apiUrl');

  _fs.default.writeFileSync(redwoodTOMLPath, redwoodTOML);
};

exports.renameApiProxyPath = renameApiProxyPath;