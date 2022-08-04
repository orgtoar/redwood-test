"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureBabel = configureBabel;
exports.runScriptFunction = runScriptFunction;

var _path = _interopRequireDefault(require("path"));

var _api = require("@redwoodjs/internal/dist/build/babel/api");

var _web = require("@redwoodjs/internal/dist/build/babel/web");

var _paths = require("@redwoodjs/internal/dist/paths");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function runScriptFunction({
  path: scriptPath,
  functionName,
  args
}) {
  const script = await Promise.resolve(`${scriptPath}`).then(s => _interopRequireWildcard(require(s)));
  const returnValue = await script[functionName](args);

  try {
    const {
      db
    } = await Promise.resolve(`${_path.default.join((0, _paths.getPaths)().api.lib, 'db')}`).then(s => _interopRequireWildcard(require(s)));
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