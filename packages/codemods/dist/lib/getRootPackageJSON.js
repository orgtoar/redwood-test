"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _getRWPaths = _interopRequireDefault(require("./getRWPaths"));

const getRootPackageJSON = () => {
  const rootPackageJSONPath = _path.default.join((0, _getRWPaths.default)().base, 'package.json');

  const rootPackageJSON = JSON.parse(_fs.default.readFileSync(rootPackageJSONPath, 'utf8'));
  return [rootPackageJSON, rootPackageJSONPath];
};

var _default = getRootPackageJSON;
exports.default = _default;