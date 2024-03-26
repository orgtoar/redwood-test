"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.bothSsrRscServerHandler = exports.bothServerFileHandler = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
var _path = _interopRequireDefault(require("path"));
var _concurrently = _interopRequireDefault(require("concurrently"));
var _execa = _interopRequireDefault(require("execa"));
var _apiCLIConfigHandler = require("@redwoodjs/api-server/dist/apiCLIConfigHandler");
var _cliHelpers = require("@redwoodjs/api-server/dist/cliHelpers");
var _projectConfig = require("@redwoodjs/project-config");
var _telemetry = require("@redwoodjs/telemetry");
var _exit = require("../lib/exit");
const bothServerFileHandler = async argv => {
  if ((0, _projectConfig.getConfig)().experimental?.rsc?.enabled || (0, _projectConfig.getConfig)().experimental?.streamingSsr?.enabled) {
    logSkippingFastifyWebServer();
    await (0, _execa.default)('yarn', ['rw-serve-fe'], {
      cwd: (0, _projectConfig.getPaths)().web.base,
      stdio: 'inherit',
      shell: true
    });
  } else {
    var _context;
    argv.apiPort ??= (0, _cliHelpers.getAPIPort)();
    argv.apiHost ??= (0, _cliHelpers.getAPIHost)();
    argv.webPort ??= (0, _cliHelpers.getWebPort)();
    argv.webHost ??= (0, _cliHelpers.getWebHost)();
    const apiProxyTarget = ['http://', (0, _includes.default)(_context = argv.apiHost).call(_context, ':') ? `[${argv.apiHost}]` : argv.apiHost, ':', argv.apiPort, argv.apiRootPath].join('');
    const {
      result
    } = (0, _concurrently.default)([{
      name: 'api',
      command: `yarn node ${_path.default.join('dist', 'server.js')} --apiPort ${argv.apiPort} --apiHost ${argv.apiHost} --apiRootPath ${argv.apiRootPath}`,
      cwd: (0, _projectConfig.getPaths)().api.base,
      prefixColor: 'cyan'
    }, {
      name: 'web',
      command: `yarn rw-web-server --port ${argv.webPort} --host ${argv.webHost} --api-proxy-target ${apiProxyTarget}`,
      cwd: (0, _projectConfig.getPaths)().base,
      prefixColor: 'blue'
    }], {
      prefix: '{name} |',
      timestampFormat: 'HH:mm:ss',
      handleInput: true
    });
    try {
      await result;
    } catch (error) {
      if (typeof error?.message !== 'undefined') {
        (0, _telemetry.errorTelemetry)(process.argv, `Error concurrently starting sides: ${error.message}`);
        (0, _exit.exitWithError)(error);
      }
    }
  }
};
exports.bothServerFileHandler = bothServerFileHandler;
const bothSsrRscServerHandler = async argv => {
  const apiPromise = (0, _apiCLIConfigHandler.handler)({
    apiRootPath: argv.apiRootPath,
    host: argv.apiHost,
    port: argv.apiPort
  });

  // TODO More gracefully handle Ctrl-C
  // Right now you get a big red error box when you kill the process
  const fePromise = (0, _execa.default)('yarn', ['rw-serve-fe'], {
    cwd: (0, _projectConfig.getPaths)().web.base,
    stdio: 'inherit',
    shell: true
  });
  await _promise.default.all([apiPromise, fePromise]);
};
exports.bothSsrRscServerHandler = bothSsrRscServerHandler;
function logSkippingFastifyWebServer() {
  console.warn('');
  console.warn('⚠️ Skipping Fastify web server ⚠️');
  console.warn('⚠️ Using new RSC server instead ⚠️');
  console.warn('');
}