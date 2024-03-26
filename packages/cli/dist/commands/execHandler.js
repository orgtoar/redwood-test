"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _path = _interopRequireDefault(require("path"));
var _api = require("@opentelemetry/api");
var _core = require("@opentelemetry/core");
var _listr = require("listr2");
var _babelConfig = require("@redwoodjs/babel-config");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _files = require("@redwoodjs/internal/dist/files");
var _lib = require("../lib");
var _colors = _interopRequireDefault(require("../lib/colors"));
var _exec = require("../lib/exec");
var _generatePrismaClient = require("../lib/generatePrismaClient");
const printAvailableScriptsToConsole = () => {
  var _context;
  console.log('Available scripts:');
  (0, _forEach.default)(_context = (0, _files.findScripts)()).call(_context, scriptPath => {
    const {
      name
    } = _path.default.parse(scriptPath);
    console.log(_colors.default.info(`- ${name}`));
  });
  console.log();
};
const handler = async args => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'exec',
    prisma: args.prisma,
    list: args.list
  });
  const {
    name,
    prisma,
    list,
    ...scriptArgs
  } = args;
  if (list || !name) {
    printAvailableScriptsToConsole();
    return;
  }
  const scriptPath = _path.default.join((0, _lib.getPaths)().scripts, name);
  const {
    overrides: _overrides,
    plugins: webPlugins,
    ...otherWebConfig
  } = (0, _babelConfig.getWebSideDefaultBabelConfig)();

  // Import babel config for running script
  (0, _babelConfig.registerApiSideBabelHook)({
    plugins: [['babel-plugin-module-resolver', {
      alias: {
        $api: (0, _lib.getPaths)().api.base,
        $web: (0, _lib.getPaths)().web.base,
        api: (0, _lib.getPaths)().api.base,
        web: (0, _lib.getPaths)().web.base
      },
      loglevel: 'silent' // to silence the unnecessary warnings
    }, 'exec-$side-module-resolver']],
    overrides: [{
      test: ['./api/'],
      plugins: [['babel-plugin-module-resolver', {
        alias: {
          src: (0, _lib.getPaths)().api.src
        },
        loglevel: 'silent'
      }, 'exec-api-src-module-resolver']]
    }, {
      test: ['./web/'],
      plugins: [...webPlugins, ['babel-plugin-module-resolver', {
        alias: {
          src: (0, _lib.getPaths)().web.src
        },
        loglevel: 'silent'
      }, 'exec-web-src-module-resolver']],
      ...otherWebConfig
    }]
  });
  try {
    require.resolve(scriptPath);
  } catch {
    console.error(_colors.default.error(`\nNo script called ${_colors.default.underline(name)} in ./scripts folder.\n`));
    printAvailableScriptsToConsole();
    process.exit(1);
  }
  const scriptTasks = [{
    title: 'Generating Prisma client',
    enabled: () => prisma,
    task: () => (0, _generatePrismaClient.generatePrismaClient)({
      force: false
    })
  }, {
    title: 'Running script',
    task: async () => {
      try {
        await (0, _exec.runScriptFunction)({
          path: scriptPath,
          functionName: 'default',
          args: {
            args: scriptArgs
          }
        });
      } catch (e) {
        console.error(_colors.default.error(`Error in script: ${e.message}`));
        throw e;
      }
    }
  }];
  const tasks = new _listr.Listr(scriptTasks, {
    rendererOptions: {
      collapseSubtasks: false
    },
    renderer: 'verbose'
  });

  // Prevent user project telemetry from within the script from being recorded
  await _api.context.with((0, _core.suppressTracing)(_api.context.active()), async () => {
    await tasks.run();
  });
};
exports.handler = handler;