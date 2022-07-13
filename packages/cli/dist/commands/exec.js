"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _internal = require("@redwoodjs/internal");

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _generatePrismaClient = require("../lib/generatePrismaClient");

const runScript = async (scriptPath, scriptArgs) => {
  const script = await _promise.default.resolve(`${scriptPath}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
  await script.default({
    args: scriptArgs
  });

  try {
    const {
      db
    } = await _promise.default.resolve(`${_path.default.join((0, _lib.getPaths)().api.lib, 'db')}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
    db.$disconnect();
  } catch (e) {// silence
  }

  return;
};

const command = 'exec [name]';
exports.command = command;
const description = 'Run scripts generated with yarn generate script';
exports.description = description;

const builder = yargs => {
  yargs.positional('name', {
    description: 'The file name (extension is optional) of the script to run',
    type: 'string'
  }).option('prisma', {
    type: 'boolean',
    default: true,
    description: 'Generate the Prisma client'
  }).option('list', {
    alias: 'l',
    type: 'boolean',
    default: false,
    description: 'List available scripts'
  }).strict(false).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#up')}`);
};

exports.builder = builder;

const printAvailableScriptsToConsole = () => {
  var _context;

  console.log('Available scripts:');
  (0, _forEach.default)(_context = (0, _internal.findScripts)()).call(_context, scriptPath => {
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
  } = (0, _internal.getWebSideDefaultBabelConfig)(); // Import babel config for running script

  (0, _internal.registerApiSideBabelHook)({
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
        await runScript(scriptPath, scriptArgs);
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