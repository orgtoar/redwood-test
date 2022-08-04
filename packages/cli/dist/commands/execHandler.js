"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _api = require("@redwoodjs/internal/dist/build/babel/api");

var _web = require("@redwoodjs/internal/dist/build/babel/web");

var _files = require("@redwoodjs/internal/dist/files");

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _exec = require("../lib/exec");

var _generatePrismaClient = require("../lib/generatePrismaClient");

const printAvailableScriptsToConsole = () => {
  console.log('Available scripts:');
  (0, _files.findScripts)().forEach(scriptPath => {
    const {
      name
    } = _path.default.parse(scriptPath);

    console.log(_colors.default.info(`- ${name}`));
  });
  console.log();
};

const handler = async args => {
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
  } = (0, _web.getWebSideDefaultBabelConfig)(); // Import babel config for running script

  (0, _api.registerApiSideBabelHook)({
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
      }
    }
  }];
  const tasks = new _listr.default(scriptTasks, {
    collapse: false,
    renderer: _listrVerboseRenderer.default
  });

  try {
    await tasks.run();
  } catch (e) {
    console.error(_colors.default.error(`The script exited with errors.`));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;