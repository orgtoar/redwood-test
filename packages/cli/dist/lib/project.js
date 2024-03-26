"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.sides = exports.serverFileExists = exports.isTypeScriptProject = void 0;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _ = require(".");
const isTypeScriptProject = () => {
  const paths = (0, _.getPaths)();
  return _fsExtra.default.existsSync(_path.default.join(paths.web.base, 'tsconfig.json')) || _fsExtra.default.existsSync(_path.default.join(paths.api.base, 'tsconfig.json'));
};
exports.isTypeScriptProject = isTypeScriptProject;
const sides = () => {
  const paths = (0, _.getPaths)();
  let sides = [];
  if (_fsExtra.default.existsSync(_path.default.join(paths.web.base, 'package.json'))) {
    sides = [...sides, 'web'];
  }
  if (_fsExtra.default.existsSync(_path.default.join(paths.api.base, 'package.json'))) {
    sides = [...sides, 'api'];
  }
  return sides;
};
exports.sides = sides;
const serverFileExists = () => {
  const serverFilePath = _path.default.join((0, _.getPaths)().api.src, `server.${isTypeScriptProject() ? 'ts' : 'js'}`);
  return _fsExtra.default.existsSync(serverFilePath);
};
exports.serverFileExists = serverFileExists;