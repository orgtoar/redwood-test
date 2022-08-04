"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.sendTelemetry = exports.sanitizeArgv = void 0;

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _ciInfo = _interopRequireDefault(require("ci-info"));

var _crossUndiciFetch = require("cross-undici-fetch");

var _envinfo = _interopRequireDefault(require("envinfo"));

var _systeminformation = _interopRequireDefault(require("systeminformation"));

var _uuid = require("uuid");

// circular dependency when trying to import @redwoodjs/structure so lets do it
// the old fashioned way
const {
  DefaultHost
} = require('@redwoodjs/structure/dist/hosts');

const {
  RWProject
} = require('@redwoodjs/structure/dist/model/RWProject');

// Tracks any commands that could contain sensative info and their position in
// the argv array, as well as the text to replace them with
const SENSITIVE_ARG_POSITIONS = {
  exec: {
    positions: [1],
    redactWith: ['[script]']
  },
  g: {
    positions: [2, 3],
    redactWith: ['[name]', '[path]']
  },
  generate: {
    positions: [2, 3],
    redactWith: ['[name]', '[path]']
  },
  prisma: {
    options: ['--name'],
    redactWith: ['[name]']
  }
}; // gets diagnostic info and sanitizes by removing references to paths

const getInfo = async (presets = {}) => {
  var _info$System, _shell$path, _info$System2, _info$System2$OS, _info$System3, _info$System3$OS, _info$System4, _info$System4$Shell, _info$Binaries, _info$Binaries$Node, _info$Binaries2, _info$Binaries2$Yarn, _info$Binaries3, _info$Binaries3$npm, _info$IDEs, _info$IDEs$VSCode, _info$npmPackages$Re;

  const info = JSON.parse(await _envinfo.default.run({
    System: ['OS', 'Shell'],
    Binaries: ['Node', 'Yarn', 'npm'],
    npmPackages: '@redwoodjs/*',
    IDEs: ['VSCode']
  }, {
    json: true
  })); // get shell name instead of path

  const shell = (_info$System = info.System) === null || _info$System === void 0 ? void 0 : _info$System.Shell; // Windows doesn't always provide shell info, I guess

  if (shell !== null && shell !== void 0 && (_shell$path = shell.path) !== null && _shell$path !== void 0 && _shell$path.match('/')) {
    info.System.Shell.name = info.System.Shell.path.split('/').pop();
  } else if (shell !== null && shell !== void 0 && shell.path.match('\\')) {
    info.System.Shell.name = info.System.Shell.path.split('\\').pop();
  }

  const cpu = await _systeminformation.default.cpu();
  const mem = await _systeminformation.default.mem();
  return {
    os: (_info$System2 = info.System) === null || _info$System2 === void 0 ? void 0 : (_info$System2$OS = _info$System2.OS) === null || _info$System2$OS === void 0 ? void 0 : _info$System2$OS.split(' ')[0],
    osVersion: (_info$System3 = info.System) === null || _info$System3 === void 0 ? void 0 : (_info$System3$OS = _info$System3.OS) === null || _info$System3$OS === void 0 ? void 0 : _info$System3$OS.split(' ')[1],
    shell: (_info$System4 = info.System) === null || _info$System4 === void 0 ? void 0 : (_info$System4$Shell = _info$System4.Shell) === null || _info$System4$Shell === void 0 ? void 0 : _info$System4$Shell.name,
    nodeVersion: (_info$Binaries = info.Binaries) === null || _info$Binaries === void 0 ? void 0 : (_info$Binaries$Node = _info$Binaries.Node) === null || _info$Binaries$Node === void 0 ? void 0 : _info$Binaries$Node.version,
    yarnVersion: (_info$Binaries2 = info.Binaries) === null || _info$Binaries2 === void 0 ? void 0 : (_info$Binaries2$Yarn = _info$Binaries2.Yarn) === null || _info$Binaries2$Yarn === void 0 ? void 0 : _info$Binaries2$Yarn.version,
    npmVersion: (_info$Binaries3 = info.Binaries) === null || _info$Binaries3 === void 0 ? void 0 : (_info$Binaries3$npm = _info$Binaries3.npm) === null || _info$Binaries3$npm === void 0 ? void 0 : _info$Binaries3$npm.version,
    vsCodeVersion: (_info$IDEs = info.IDEs) === null || _info$IDEs === void 0 ? void 0 : (_info$IDEs$VSCode = _info$IDEs.VSCode) === null || _info$IDEs$VSCode === void 0 ? void 0 : _info$IDEs$VSCode.version,
    redwoodVersion: presets.redwoodVersion || ((_info$npmPackages$Re = info.npmPackages['@redwoodjs/core']) === null || _info$npmPackages$Re === void 0 ? void 0 : _info$npmPackages$Re.installed),
    system: `${cpu.physicalCores}.${Math.round(mem.total / 1073741824)}`
  };
}; // removes potentially sensative information from an array of argv strings


const sanitizeArgv = argv => {
  const args = (0, _slice.default)(argv).call(argv, 2);
  const name = args[0];
  const sensativeCommand = SENSITIVE_ARG_POSITIONS[name];

  if (sensativeCommand) {
    // redact positional arguments
    if (sensativeCommand.positions) {
      var _context;

      (0, _forEach.default)(_context = sensativeCommand.positions).call(_context, (pos, index) => {
        // only redact if the text in the given position is not a --flag
        if (args[pos] && !args[pos].match(/--/)) {
          args[pos] = sensativeCommand.redactWith[index];
        }
      });
    } // redact --option arguments


    if (sensativeCommand.options) {
      var _context2;

      (0, _forEach.default)(_context2 = sensativeCommand.options).call(_context2, (option, index) => {
        const argIndex = (0, _indexOf.default)(args).call(args, option);

        if (argIndex !== -1) {
          args[argIndex + 1] = sensativeCommand.redactWith[index];
        }
      });
    }
  }

  return args.join(' ');
};

exports.sanitizeArgv = sanitizeArgv;

const buildPayload = async () => {
  var _context3;

  let payload = {};
  let project;

  const argv = require('yargs/yargs')((0, _slice.default)(_context3 = process.argv).call(_context3, 2)).argv;

  const rootDir = argv.root;
  payload = {
    type: argv.type || 'command',
    command: argv.argv ? sanitizeArgv(JSON.parse(argv.argv)) : '',
    duration: argv.duration ? (0, _parseInt2.default)(argv.duration) : null,
    uid: uniqueId(rootDir) || null,
    ci: _ciInfo.default.isCI,
    redwoodCi: !!process.env.REDWOOD_CI,
    NODE_ENV: process.env.NODE_ENV || null,
    ...(await getInfo({
      redwoodVersion: argv.rwVersion
    }))
  };

  if (argv.error) {
    payload.type = 'error';
    payload.error = argv.error.split('\n')[0].replace(/(\/[@\-\.\w]+)/g, '[path]');
  } // if a root directory was specified, use that to look up framework stats
  // with the `structure` package


  if (rootDir) {
    project = new RWProject({
      projectRoot: rootDir,
      host: new DefaultHost()
    });
  } // add in app stats


  payload = { ...payload,
    complexity: `${project.getRouter().routes.length}.${project.services.length}.${project.cells.length}.${project.pages.length}`,
    sides: project.sides.join(',')
  };
  return payload;
}; // returns the UUID for this device. caches the UUID for 24 hours


const uniqueId = rootDir => {
  const telemetryCachePath = _path.default.join(rootDir || '/tmp', '.redwood', 'telemetry.txt');

  const now = (0, _now.default)();
  const expires = now - 24 * 60 * 60 * 1000; // one day

  let uuid;

  if (!_fs.default.existsSync(telemetryCachePath) || _fs.default.statSync(telemetryCachePath).mtimeMs < expires) {
    uuid = (0, _uuid.v4)();

    try {
      _fs.default.writeFileSync(telemetryCachePath, uuid);
    } catch (error) {
      console.error('\nCould not create telemetry.txt file\n');
    }
  } else {
    uuid = _fs.default.readFileSync(telemetryCachePath).toString();
  }

  return uuid;
}; // actually call the API with telemetry data


const sendTelemetry = async () => {
  const telemetryUrl = 'https://telemetry.redwoodjs.com/api/v1/telemetry';

  try {
    const payload = await buildPayload();

    if (process.env.REDWOOD_VERBOSE_TELEMETRY) {
      console.info('Redwood Telemetry Payload', payload);
    }

    const response = await (0, _crossUndiciFetch.fetch)(telemetryUrl, {
      method: 'post',
      body: (0, _stringify.default)(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (process.env.REDWOOD_VERBOSE_TELEMETRY) {
      console.info('Redwood Telemetry Response:', response);
    } // Normally we would report on any non-error response here (like a 500)
    // but since the process is spawned and stdout/stderr is ignored, it can
    // never be seen by the user, so ignore.


    if (process.env.REDWOOD_VERBOSE_TELEMETRY && response.status !== 200) {
      console.error('Error from telemetry insert:', await response.text());
    }
  } catch (e) {
    // service interruption: network down or telemetry API not responding
    // don't let telemetry errors bubble up to user, just do nothing.
    if (process.env.REDWOOD_VERBOSE_TELEMETRY) {
      console.error('Uncaught error in telemetry:', e);
    }
  }
};

exports.sendTelemetry = sendTelemetry;