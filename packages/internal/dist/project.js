"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.getTsConfigs = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _typescript = require("typescript");

var _paths = require("./paths");

const getTsConfigs = () => {
  const rwPaths = (0, _paths.getPaths)();

  const apiTsConfigPath = _path.default.join(rwPaths.api.base, 'tsconfig.json');

  const webTsConfigPath = _path.default.join(rwPaths.web.base, 'tsconfig.json');

  const apiTsConfig = _fs.default.existsSync(apiTsConfigPath) ? (0, _typescript.parseConfigFileTextToJson)(apiTsConfigPath, _fs.default.readFileSync(apiTsConfigPath, 'utf-8')) : null;
  const webTsConfig = _fs.default.existsSync(webTsConfigPath) ? (0, _typescript.parseConfigFileTextToJson)(webTsConfigPath, _fs.default.readFileSync(webTsConfigPath, 'utf-8')) : null;
  return {
    api: apiTsConfig?.config ?? null,
    web: webTsConfig?.config ?? null
  };
};

exports.getTsConfigs = getTsConfigs;