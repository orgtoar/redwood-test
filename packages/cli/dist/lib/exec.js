"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.configureBabel = configureBabel;
exports.runScriptFunction = runScriptFunction;
var _path = _interopRequireDefault(require("path"));
var _babelConfig = require("@redwoodjs/babel-config");
var _projectConfig = require("@redwoodjs/project-config");
async function runScriptFunction({
  path: scriptPath,
  functionName,
  args
}) {
  const script = require(scriptPath);
  const returnValue = await script[functionName](args);
  try {
    const {
      db
    } = require(_path.default.join((0, _projectConfig.getPaths)().api.lib, 'db'));
    db.$disconnect();
  } catch (e) {
    // silence
  }
  return returnValue;
}
async function configureBabel() {
  const {
    overrides: _overrides,
    plugins: webPlugins,
    ...otherWebConfig
  } = (0, _babelConfig.getWebSideDefaultBabelConfig)();

  // Import babel config for running script
  (0, _babelConfig.registerApiSideBabelHook)({
    plugins: [['babel-plugin-module-resolver', {
      alias: {
        $api: (0, _projectConfig.getPaths)().api.base,
        $web: (0, _projectConfig.getPaths)().web.base,
        api: (0, _projectConfig.getPaths)().api.base,
        web: (0, _projectConfig.getPaths)().web.base
      },
      loglevel: 'silent' // to silence the unnecessary warnings
    }, 'exec-$side-module-resolver']],
    overrides: [{
      test: ['./api/'],
      plugins: [['babel-plugin-module-resolver', {
        alias: {
          src: (0, _projectConfig.getPaths)().api.src
        },
        loglevel: 'silent'
      }, 'exec-api-src-module-resolver']]
    }, {
      test: ['./web/'],
      plugins: [...webPlugins, ['babel-plugin-module-resolver', {
        alias: {
          src: (0, _projectConfig.getPaths)().web.src
        },
        loglevel: 'silent'
      }, 'exec-web-src-module-resolver']],
      ...otherWebConfig
    }]
  });
}