"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = exports.TargetEnum = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _stringEnvInterpolation = require("string-env-interpolation");

var _toml = _interopRequireDefault(require("toml"));

var _paths = require("./paths");

let TargetEnum;
exports.TargetEnum = TargetEnum;

(function (TargetEnum) {
  TargetEnum["NODE"] = "node";
  TargetEnum["BROWSER"] = "browser";
  TargetEnum["REACT_NATIVE"] = "react-native";
  TargetEnum["ELECTRON"] = "electron";
})(TargetEnum || (exports.TargetEnum = TargetEnum = {}));

// Note that web's includeEnvironmentVariables is handled in `webpack.common.js`
// https://github.com/redwoodjs/redwood/blob/d51ade08118c17459cebcdb496197ea52485364a/packages/core/config/webpack.common.js#L19
const DEFAULT_CONFIG = {
  web: {
    title: 'Redwood App',
    host: 'localhost',
    port: 8910,
    path: './web',
    target: TargetEnum.BROWSER,
    apiUrl: '/.redwood/functions',
    fastRefresh: true,
    a11y: true,
    sourceMap: false
  },
  api: {
    title: 'Redwood App',
    host: 'localhost',
    port: 8911,
    path: './api',
    target: TargetEnum.NODE,
    schemaPath: './api/db/schema.prisma',
    serverConfig: './api/server.config.js',
    debugPort: 18911
  },
  browser: {
    open: false
  },
  generate: {
    tests: true,
    stories: true,
    nestScaffoldByModel: true
  }
};
/**
 * These configuration options are modified by the user via the Redwood
 * config file.
 */

const getConfig = (configPath = (0, _paths.getConfigPath)()) => {
  try {
    const rawConfig = (0, _stringEnvInterpolation.env)(_fs.default.readFileSync(configPath, 'utf8'));
    return (0, _deepmerge.default)(DEFAULT_CONFIG, _toml.default.parse(rawConfig));
  } catch (e) {
    throw new Error(`Could not parse "${configPath}": ${e}`);
  }
};

exports.getConfig = getConfig;