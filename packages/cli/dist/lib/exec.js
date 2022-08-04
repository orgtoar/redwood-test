"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.configureBabel = configureBabel;
exports.runScriptFunction = runScriptFunction;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _path = _interopRequireDefault(require("path"));

var _api = require("@redwoodjs/internal/dist/build/babel/api");

var _web = require("@redwoodjs/internal/dist/build/babel/web");

var _paths = require("@redwoodjs/internal/dist/paths");

async function runScriptFunction({
  path: scriptPath,
  functionName,
  args
}) {
  const script = await _promise.default.resolve(`${scriptPath}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
  const returnValue = await script[functionName](args);

  try {
    const {
      db
    } = await _promise.default.resolve(`${_path.default.join((0, _paths.getPaths)().api.lib, 'db')}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
    db.$disconnect();
  } catch (e) {// silence
  }

  return returnValue;
}

async function configureBabel() {
  const {
    overrides: _overrides,
    plugins: webPlugins,
    ...otherWebConfig
  } = (0, _web.getWebSideDefaultBabelConfig)(); // Import babel config for running script

  (0, _api.registerApiSideBabelHook)({
    plugins: [['babel-plugin-module-resolver', {
      alias: {
        $api: (0, _paths.getPaths)().api.base,
        $web: (0, _paths.getPaths)().web.base,
        api: (0, _paths.getPaths)().api.base,
        web: (0, _paths.getPaths)().web.base
      },
      loglevel: 'silent' // to silence the unnecessary warnings

    }, 'exec-$side-module-resolver']],
    overrides: [{
      test: ['./api/'],
      plugins: [['babel-plugin-module-resolver', {
        alias: {
          src: (0, _paths.getPaths)().api.src
        },
        loglevel: 'silent'
      }, 'exec-api-src-module-resolver']]
    }, {
      test: ['./web/'],
      plugins: [...webPlugins, ['babel-plugin-module-resolver', {
        alias: {
          src: (0, _paths.getPaths)().web.src
        },
        loglevel: 'silent'
      }, 'exec-web-src-module-resolver']],
      ...otherWebConfig
    }]
  });
}